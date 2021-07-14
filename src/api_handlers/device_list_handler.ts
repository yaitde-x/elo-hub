import { IExpressHandler, IExpressRequest, IExpressResponse } from "./handler_api";
import { IDeviceRepo, DevicePayload } from "../device/device_repo";
import { IMessageHub } from "../message_hub";


export class DeviceListHandler implements IExpressHandler {

    deviceRepo: IDeviceRepo;

    constructor(deviceRepo: IDeviceRepo) {
        this.deviceRepo = deviceRepo;
    }

    public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse): Promise<any> {

        console.log('devicelist: ' + JSON.stringify(expressRequest.query));
        let devices = this.deviceRepo.getDeviceConfiguration();
        expressResponse.json(devices);
    }

};
