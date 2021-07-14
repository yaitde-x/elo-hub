import { IExpressHandler, IExpressRequest, IExpressResponse } from "./handler_api";
import { IDeviceRepo, DevicePayload } from "../device/device_repo";
import { IMessageHub } from "../message_hub";

export class DeviceProfileListHandler implements IExpressHandler {

    deviceRepo: IDeviceRepo;

    constructor(deviceRepo: IDeviceRepo) {
        this.deviceRepo = deviceRepo;
    }

    public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse): Promise<any> {

        console.log('deviceprofilelist: ' + JSON.stringify(expressRequest.query));
        let devices = this.deviceRepo.getDeviceProfiles();
        expressResponse.json(devices);
    }

};
