import axios, { AxiosResponse, AxiosError } from 'axios';
import {IExpressHandler, IExpressRequest, IExpressResponse } from './handler_api';
import { IDeviceRepo } from '../device/device_repo';

export class ExpressDeviceRelayHandler implements IExpressHandler {
    public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse) : Promise<any> {

        console.log('relay: ' + JSON.stringify(expressRequest.body));
        
          let relayPayload = expressRequest.body;
          let deviceAddress = decodeURIComponent(relayPayload.deviceAddress);
          let devicePayload = relayPayload.payload;
        
          console.log('relay to : ' + deviceAddress);
          axios.post(deviceAddress, relayPayload.payload)
            .then(function (axiosResponse: AxiosResponse) {
              console.log('back from device', JSON.stringify(axiosResponse.data));
              expressResponse.json(axiosResponse.data);
            })
            .catch(function (axiosError: AxiosError) {
              console.log('error calling device' + JSON.stringify(axiosError));
              expressResponse.json({ errorInfo: axiosError });
            });
    }
}
