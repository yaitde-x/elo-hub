import { injectable, inject } from "inversify";
import "reflect-metadata";

import * as express from 'express';
import * as fs from 'fs';
import { exec } from 'child_process';

import { app, ErrorHandler } from 'alexa-app';
import { ILogger } from '../logger';
import { Messages, Utility, ISystemConfig } from '../utility/utility';
import { IDeviceFactory } from '../device/device_factory';
import { DeviceControlIntentHandler } from '../intents/device_control_intent';
import { TYPES } from "../types";
import { IDeviceRepo } from "../device/device_repo";
import { AlexaLaunchHandler } from "../intents/alexa_launch_handler";
import { CheckBuildStatusIntentHandler } from "../intents/check_build_status_intent";
import { QueueBuildIntentHandler } from "../intents/queue_build_intent";
import { ActiveTasksIntentHandler } from "../intents/active_tasks_intent";
import { runInThisContext } from "vm";
import { response, request } from "alexa-app/types";
import { IVstsRepo } from "../vsts/vsts_repo";
import { StatusReportIntentHandler } from "../intents/status_report_intent";
import { FeatureDisabledIntentHandler } from "../intents/feature_disabled_intent";
import { IVoiceHandler, IVoiceRequest, IVoiceResponse } from "./voice_interfaces";
import { ExpenseQueryIntentHandler } from "../intents/expense_query_intent";
import { DotCoreIntentHandler } from "../intents/dotcore_intent";

//var alexa = require("alexa-app");

export interface AlexaSpeech {
  say(msg: string): AlexaSpeech;
  pause(time: string): AlexaSpeech;
  sayAs(options: any): AlexaSpeech;
  ssml(something: true): string;
};

export interface IVoiceHandlerFactory {
  getVoiceHandler(logger: ILogger, deviceRepo: IDeviceRepo, vstsRepo: IVstsRepo, app: any, config: ISystemConfig): IVoiceHandler;
}

export class AlexaVoiceHandler implements IVoiceHandler {

  private alexaApp: app;
  private logger: ILogger;
  private deviceRepo: IDeviceRepo;
  private config: ISystemConfig;
  private vstsRepo: IVstsRepo;

  constructor(@inject(TYPES.Logger) logger: ILogger,
    @inject(TYPES.DeviceRepo) deviceRepo: IDeviceRepo,
    @inject(TYPES.VstsRepo) vstsRepo: IVstsRepo,
    @inject(TYPES.ExpressApp) expressApp: any,
    @inject(TYPES.Config) config: ISystemConfig) {

    this.alexaApp = new app("alexa");
    this.logger = logger;
    this.deviceRepo = deviceRepo;
    this.config = config;
    this.vstsRepo = vstsRepo;

    this.alexaApp.express({
      expressApp: expressApp,
      checkCert: false,
      debug: true
    });

    this.initialize();
  }

  private initialize(): void {

    var self = this;
    var logger = this.logger;

    this.alexaApp.launch((request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        var intent = new AlexaLaunchHandler(this.logger, this.deviceRepo);
        return intent.handleIntent(request, response);
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("DeviceControlIntent", {
      "slots": {},
      "utterances": [
        "to turn on|off the device"
      ]
    }, (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        var intent = new DeviceControlIntentHandler(this.logger, this.deviceRepo);
        return intent.handleIntent(request, response);
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("BuildIntent", {
      "slots": {},
      "utterances": [
        "to check on the build"
        , "to get the status of the build"
        , "to get the build status"
      ]
    }, (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.vsts) {
          let intent = new CheckBuildStatusIntentHandler(this.logger, this.deviceRepo, this.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
        response.say(e);
      }
    });

    this.alexaApp.intent("QueueBuildIntent", {
      "slots": {},
      "utterances": [
        "to queue a build"
        , "to run a build"
        , "start a build"
      ]
    }, (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.vsts) {
          let intent = new QueueBuildIntentHandler(this.logger, this.deviceRepo, this.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("AnimationIntent", {
      "slots": {},
      "utterances": [
        "to change the device animation"
      ]
    }, (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        let intent = new QueueBuildIntentHandler(this.logger, this.deviceRepo, this.config);
        return intent.handleIntent(request, response);
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("ActiveTasksIntent", {
      "slots": {},
      "utterances": [
        "to list my active tasks"
      ]
    }, async (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.vsts) {
          let intent = new ActiveTasksIntentHandler(this.logger, this.vstsRepo, self.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("StatusReportIntent", {
      "slots": {},
      "utterances": [
        "to read the current status report"
      ]
    }, async (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.wiki) {
          var intent = new StatusReportIntentHandler(this.logger, self.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("ExpenseQueryIntent", {
      "slots": {},
      "utterances": [
        "how much have I spent on <expense> this <period>"
      ]
    }, async (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.exfin) {
          var intent = new ExpenseQueryIntentHandler(this.logger, self.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
      }
    });

    this.alexaApp.intent("NewSimulationIntent", {
      "slots": {},
      "utterances": [
        "create a new simulation"
      ]
    }, async (request: IVoiceRequest, response: IVoiceResponse) => {
      try {
        if (self.config.featureSet.exfin) {
          var intent = new DotCoreIntentHandler(this.logger, self.config);
          return intent.handleIntent(request, response);
        } else {
          let intent = new FeatureDisabledIntentHandler(this.logger);
          return intent.handleIntent(request, response);
        }
      } catch (e) {
        logger.error(e);
      }
    });
  }
}

@injectable()
export class RuntimeVoiceHandlerFactory implements IVoiceHandlerFactory {
  getVoiceHandler(logger: ILogger, deviceRepo: IDeviceRepo, vstsRepo: IVstsRepo, app: any, config: ISystemConfig): IVoiceHandler {
    return new AlexaVoiceHandler(logger, deviceRepo, vstsRepo, app, config);
  }
}