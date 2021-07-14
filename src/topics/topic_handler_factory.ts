import { injectable, inject } from "inversify";
import "reflect-metadata";

import { ILogger } from '../logger';
import { ISystemConfig } from "../utility/utility";
import { IDeviceRepo } from "../device/device_repo";
import { TYPES } from "../types";
import { IIndicatorRulesEngine } from "../indicator/indicator_repo";

export interface ITopicHandler {
    handleMessage(name: string, message: string);
}

class DeviceConfigHandler implements ITopicHandler {

    deviceRepo: IDeviceRepo;
    deviceName: string;

    constructor(deviceName:string, deviceRepo: IDeviceRepo) {
        this.deviceRepo = deviceRepo;
        this.deviceName = deviceName;
    }

    handleMessage(topic: string, message: string) {
        let state = <DeviceConfig>JSON.parse(message);
        this.deviceRepo.updateDeviceConfiguration(this.deviceName, state);
    }

}

export class DeviceStateHandler implements ITopicHandler {
    rulesEngine: IIndicatorRulesEngine;

    deviceRepo: IDeviceRepo;
    deviceName: string;

    constructor(deviceName:string, deviceRepo: IDeviceRepo, rulesEngine: IIndicatorRulesEngine) {
        this.deviceRepo = deviceRepo;
        this.deviceName = deviceName;
        this.rulesEngine = rulesEngine;
    }

    handleMessage(topic: string, message: string) {
        let self = this;
        let state = <DeviceState>JSON.parse(message);
        this.deviceRepo.updateDeviceState(this.deviceName, state);

        let actions = this.rulesEngine.processDeviceStateChange(this.deviceName);
        actions.forEach(action => {
            action.invoke();
        });
    }

}

class NullTopicHandler implements ITopicHandler {

    handleMessage(name: string, message: string) {
        console.log('null topic handler selected for topic ' + name + '. this message was missed:');
        console.log(message);
    }

}

export interface EloColor {
    r: number;
    g: number;
    b: number;
};

export interface DeviceConfig {
    s: number;
    n: string;
    v: number;
    c: EloColor;
    a: number;
    l: number;
    p1: number;
    p2: number;
    p3: number;
    p4: number;
    p5: number;
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;    
};

export interface DeviceState {
    n: string;
    v1: number;
    v2: number;
    v3: number;
    v4: number;
    v5: number;
};

export interface ITopicHandlerFactory {
    getHandlerForTopic(topic: string): ITopicHandler;
}

@injectable()
export class TopicHandlerFactory implements ITopicHandlerFactory {
    rulesEngine: IIndicatorRulesEngine;

    private logger: ILogger;
    private config: ISystemConfig;
    private deviceRepo: IDeviceRepo;

    constructor( @inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.DeviceRepo) deviceRepo: IDeviceRepo,
        @inject(TYPES.IndicatorRulesEngine) rulesEngine: IIndicatorRulesEngine,        
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

        this.logger = logger;
        this.rulesEngine = rulesEngine;
        this.config = systemConfig;
        this.deviceRepo = deviceRepo;
    }

    public getHandlerForTopic(topic: string): ITopicHandler {

        let deviceName = this.getDeviceName(topic);

        if (topic.startsWith('elo') && topic.endsWith('/config'))
            return new DeviceConfigHandler(deviceName, this.deviceRepo);
        else if (topic.startsWith('elo') && topic.endsWith('/state'))
            return new DeviceStateHandler(deviceName, this.deviceRepo, this.rulesEngine);

        return new NullTopicHandler();
    }

    private getDeviceName(topic: string): string {
        let parts = topic.split('/');
        return parts[1];
    }

}