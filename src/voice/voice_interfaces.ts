import { request, response } from "alexa-app/types";

export interface IVoiceHandler {

}

export interface IVoiceIntentHandler {
  handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse>;
}

export interface IVoiceRequest extends request {

}

export interface IVoiceResponse extends response {

}

export interface IDotCoreVoiceResponse {
  phrase: string;
}