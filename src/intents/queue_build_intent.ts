import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { IDeviceRepo } from "../device/device_repo";
import { exec } from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import { ISystemConfig } from "../utility/utility";
import { VstsFileNames, StandardVoiceResponses } from "../types";

export class QueueBuildIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;
    deviceFactory: IDeviceRepo;
    config: ISystemConfig;

    constructor(logger: ILogger, deviceFactory: IDeviceRepo, config: ISystemConfig) {
        this.deviceFactory = deviceFactory;
        this.logger = logger;
        this.config = config;
    }

    private getQueueBuildScriptPath() {
        return path.join(this.config.vsts.scriptPath, VstsFileNames.QueueBuild)
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        return new Promise<IVoiceResponse>((resolve, reject) => {
            console.log('queuing a build...');

            let scriptToRun = path.join(this.config.vsts.scriptPath, VstsFileNames.QueueBuild);

            if (!fs.existsSync(scriptToRun)) {
                response.say(StandardVoiceResponses.MissingScript);
                resolve(response);
                return;
            }

            let fullCommandLine = scriptToRun + ' ' + this.config.vsts.vstsPath + ' ' + this.config.vsts.dataPath + ' ' + this.config.vsts.token + ' ' + 'Karmak_Integrations';

            exec(fullCommandLine, (error, stdout, stderr) => {

                if (!error || error === null) {
                    console.log('build queued...');
                    response.say("Ok! A build has been queued");
                } else {
                    console.log(stdout);
                    console.log(stderr);
                    console.log(JSON.stringify(error));
                    response.say("There was an error when I tried to queue the build.");
                }

                resolve(response);
            });
        });

    }
}