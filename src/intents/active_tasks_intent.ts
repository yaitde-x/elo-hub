import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { IDeviceRepo } from "../device/device_repo";
import * as fs from 'fs';
import * as path from 'path';
import { ISystemConfig } from "../utility/utility";
import { exec } from "child_process";
import { container } from '../boot';
import { VstsFileNames, StandardVoiceResponses } from "../types";
import { VstsWorkitem, VstsUtilities } from "../vsts/vsts";
import * as Speech from 'ssml-builder';
import { AlexaSpeech } from "../voice/voice_handler";
import { IVstsRepo } from "../vsts/vsts_repo";

export class ActiveTasksIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;
    vstsRepo: IVstsRepo;
    config: ISystemConfig;

    constructor(logger: ILogger, vstsRepo: IVstsRepo, config: ISystemConfig) {
        this.config = config;
        this.vstsRepo = vstsRepo;
        this.logger = logger;
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        let self = this;

        return new Promise<IVoiceResponse>((resolve, reject) => {

            let activeTasks = self.vstsRepo.getActiveTasks();

            let complexSpeech = <AlexaSpeech>new Speech();

            if (activeTasks.length > 0) {

                let msg = "You have " + activeTasks.length + " task" + (activeTasks.length == 1 ? "" : "s") + ".";
                let index = 0;
                complexSpeech.say(msg);
                complexSpeech.pause('300ms');

                activeTasks.forEach((task) => {
                    index += 1;
                    complexSpeech.say("" + index)
                        .pause('300ms')
                        .sayAs({
                            word: "" + task.id,
                            interpret: "digits"
                        })
                        .pause('500ms')
                        .say(", " + task.title + '. ')
                        .pause('300ms')
                        .say("Total complete work is " + task.completedWork + " hours with ")
                        .say("" + task.remainingWork + " hours remaining. ")
                        .pause('500ms');

                });
            } else {
                complexSpeech.say("You have no active tasks as this time.").pause('300ms');
            }

            request.getSession().set("taskContext", "active");

            complexSpeech.say("What else do you need me for?");
            //response.shouldEndSession(false);
            response.say(complexSpeech.ssml(true));
            resolve(response);
        });
    }
}