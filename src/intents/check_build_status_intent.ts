import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { IDeviceRepo } from "../device/device_repo";
import * as fs from 'fs';
import * as path from 'path';
import { ISystemConfig } from "../utility/utility";
import { VstsFileNames, StandardVoiceResponses } from "../types";

export class CheckBuildStatusIntentHandler implements IVoiceIntentHandler {

  logger: ILogger;
  deviceFactory: IDeviceRepo;
  config: ISystemConfig;

  constructor(logger: ILogger, deviceFactory: IDeviceRepo, config: ISystemConfig) {
    this.deviceFactory = deviceFactory;
    this.logger = logger;
    this.config = config;
  }

  private getBuildResultFullPath() {
    return path.join(this.config.vsts.dataPath, VstsFileNames.BuildResults)
  }

  async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
    return new Promise<IVoiceResponse>((resolve, reject) => {
      let buildResultPath = this.getBuildResultFullPath();
      if (!fs.existsSync(buildResultPath)) {
        response.say(StandardVoiceResponses.MissingBuildResults)
      } else {
        var buildStatus = JSON.parse(fs.readFileSync(buildResultPath, 'utf8'))[0];
        var msg = "The build be doing some funky stuff!";

        if (buildStatus.status !== "inProgress")
          msg = "a build is currently running";
        if (buildStatus.status !== "completed")
          msg = "a build is currently running";
        if (buildStatus.result === "succeeded") {
          msg = "The last build succeeded";
        } else if (buildStatus.result === "failed") {
          msg = "The last build failed";
        }

        response.say(msg);
      }
      resolve(response);
    });
  }
}