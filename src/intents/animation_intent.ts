import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { IDeviceRepo } from "../device/device_repo";


export class AlexaLaunchHandler implements IVoiceIntentHandler {
    
        logger: ILogger;
        deviceFactory: IDeviceRepo;
    
        constructor(logger: ILogger, deviceFactory: IDeviceRepo) {
            this.deviceFactory = deviceFactory;
            this.logger = logger;
        }
    
        handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
            return new Promise<IVoiceResponse>((resolve, reject) => {
                response.say("not implemented");
                resolve(response);
            });
        }
    }