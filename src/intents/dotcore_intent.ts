import { AlexaSpeech } from "../voice/voice_handler";
import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse, IDotCoreVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import * as Speech from 'ssml-builder';
import { ISystemConfig } from "../utility/utility";
import axios from 'axios';

export class DotCoreIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;
    config: ISystemConfig;

    constructor(logger: ILogger, config: ISystemConfig) {
        this.logger = logger;
        this.config = config;
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        let that = this;
        return new Promise<IVoiceResponse>(async (resolve, reject) => {
            console.log('dotcore query...');

            var dotCoreRequest =
            {
                url:  that.config.exfin.api + '/api/alexa',
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                data: request.data
            };

            var axiosResponse = await axios(dotCoreRequest);
            var dotCoreResponse = <IDotCoreVoiceResponse>axiosResponse.data;

            if (dotCoreResponse && dotCoreResponse.phrase && dotCoreResponse.phrase.length > 0)
                response.say(dotCoreResponse.phrase);

            resolve(response);
        });
    }
}