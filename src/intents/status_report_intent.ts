import { AlexaSpeech } from "../voice/voice_handler";
import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { ISystemConfig } from "../utility/utility";
import * as Speech from 'ssml-builder';
import { RepoScanner, RepoScannerResult } from "../documents/knowledge_doc_parser";

export class StatusReportIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;
    config: ISystemConfig;

    constructor(logger: ILogger, config: ISystemConfig) {
        this.config = config;
        this.logger = logger;
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        let self = this;

        return new Promise<IVoiceResponse>((resolve, reject) => {

            let complexSpeech = <AlexaSpeech>new Speech();

            let scanner = new RepoScanner(self.config.knowledgeDoc);
            let result = scanner.scan().then((scanResults: RepoScannerResult) => {

                let doc = scanResults.docs.find((item) => {
                    if (item.name == "elk_status.md")
                        return true;

                    return false;
                });

                if (!doc)
                    complexSpeech.say("I couldn't find the status report,");
                else {
                    complexSpeech.say("Here is the current status: ");
                    complexSpeech.pause("1s");
                    complexSpeech.say(doc.summary.text);
                }

                //response.shouldEndSession(false);
                response.say(complexSpeech.ssml(true));
                resolve(response);

            });

            Promise.all([result]);

        });
    }
}