import { AlexaSpeech } from "../voice/voice_handler";
import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import * as Speech from 'ssml-builder';

export class FeatureDisabledIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        let self = this;

        return new Promise<IVoiceResponse>((resolve, reject) => {

            let complexSpeech = <AlexaSpeech>new Speech();
            complexSpeech.say("This feature is currently disabled");
            response.say(complexSpeech.ssml(true));
            resolve(response);

        });
    }
}