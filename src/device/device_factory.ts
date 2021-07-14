import { injectable, inject } from "inversify";
import "reflect-metadata";
import { IDevice, AxiosDevice, DeviceDescriptor } from "./device";

export interface IDeviceFactory {
    getDevice(deviceDescriptor: DeviceDescriptor): IDevice;
}

@injectable()
export class RuntimeDeviceFactory implements IDeviceFactory {
    getDevice(deviceDescriptor: DeviceDescriptor): IDevice {
        return new AxiosDevice(deviceDescriptor.address, deviceDescriptor.port);
    };
}