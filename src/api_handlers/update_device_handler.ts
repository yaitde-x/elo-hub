import { IDeviceRepo, DevicePayload } from "../device/device_repo";
import { IMessageHub } from "../message_hub";
import { IExpressHandler, IExpressRequest, IExpressResponse } from "./handler_api";


export class UpdateDeviceHandler implements IExpressHandler {

    deviceRepo: IDeviceRepo;
    messageHub: IMessageHub;

    constructor(deviceRepo: IDeviceRepo, messageHub: IMessageHub) {
        this.deviceRepo = deviceRepo;
        this.messageHub = messageHub;
    }

    public async handle(request: IExpressRequest, response: IExpressResponse): Promise<any> {
        let payload = <DevicePayload> request.body;

        this.deviceRepo.updateDeviceConfiguration(payload.name, payload.config);
        this.messageHub.sendMessage(payload.name, 'update', JSON.stringify(payload.config));
        response.send('');
    }

};