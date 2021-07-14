import * as fs from 'fs';
import * as filewatcher from 'filewatcher';
import * as path from 'path';
import { container } from "../boot";
import { injectable, inject } from "inversify";
import "reflect-metadata";

import { Container } from "inversify";
import { IDevice, DeviceDescriptor } from "./device";
import { KeyedCollection } from "../utility/dictionary";
import { TYPES } from "../types";
import { IDeviceFactory } from "./device_factory";
import { DeviceConfig, DeviceState } from "../topics/topic_handler_factory";
import { Collection } from "../utility/collection";
import { ILogger } from '../logger';
import { ISystemConfig } from '../utility/utility';

export interface IDeviceRepo {
    getDeviceByName(name: string): IDevice;
    updateDeviceConfiguration(name: string, state: DeviceConfig);
    getDeviceState(name: string): DeviceState;
    updateDeviceState(name: string, state: DeviceState);
    getDeviceConfiguration(): DevicePayload[];
    getDeviceProfiles(): DeviceProfile[];
};

export interface IDeviceRepoConfig {
    repoPath: string;
}

export interface DeviceProfile {
    applianceId: string,
    manufacturerName: string,
    modelName: string,
    version: '1.0',
    friendlyName: string,
    friendlyDescription: string,
    isReachable: true,
    actions: string[],
    additionalApplianceDetails: any
    ;
}

class DeviceContext {
    descriptor: DeviceDescriptor;
    config: DeviceConfig;
    state: DeviceState;
    profile: DeviceProfile;
};

export class DevicePayload {
    name: string;
    device: DeviceDescriptor;
    config: DeviceConfig;
    state: DeviceState;
};

class Device {
    name: string;
    context: DeviceContext;
}

@injectable()
export class StaticDeviceRepo implements IDeviceRepo {

    private devices: KeyedCollection<DeviceContext>;
    private config: IDeviceRepoConfig;

    constructor( @inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

        this.config = systemConfig.deviceRepo;

        this.initializeRepo();

        this.watchRepo();
    }

    private watchRepo() {
        let that = this;
        let repoPath = path.join(this.config.repoPath, 'device_repo.json');
        let watcher = filewatcher();

        watcher.add(repoPath);

        watcher.on('change', function (file, stat) {
            console.log('Device repo changed, reloading...');
            that.initializeRepo();
        });
    }

    initializeRepo() {
        let self = this;
        this.devices = new KeyedCollection<DeviceContext>();

        let repoPath = path.join(this.config.repoPath, 'device_repo.json');
        let deviceStore = <Device[]>JSON.parse(fs.readFileSync(repoPath).toString());

        deviceStore.forEach(device => {
            this.devices.add(device.name, device.context);
        });

        // this.dumpRepo();
    }

    private dumpRepo() {
        let dump = [];
        for (let key of this.devices.keys()) {
            let outModel = <Device>{ name: key, context: this.devices.item(key) };
            dump.push(outModel);
        }

        let repoBuf = JSON.stringify(dump);
        fs.writeFileSync('sample_files/repo.json', repoBuf);
    }

    public getDeviceByName(name: string): IDevice {
        if (this.devices.containsKey(name)) {
            var context: DeviceContext = this.devices.item(name);
            var deviceFactory = container.get<IDeviceFactory>(TYPES.DeviceFactory);
            var device = deviceFactory.getDevice(context.descriptor);

            return device;
        }

        return null;
    }

    public updateDeviceConfiguration(name: string, config: DeviceConfig) {
        let context = this.getDeviceContext(name);
        context.config = config;
    }

    public getDeviceState(name: string): DeviceState {
        let context = this.getDeviceContext(name);
        return context.state;
    }

    public updateDeviceState(name: string, state: DeviceState) {
        let context = this.getDeviceContext(name);
        context.state = state;
    }

    private getDeviceContext(name: string): DeviceContext {
        if (this.devices.containsKey(name)) {
            return this.devices.item(name);
        } else {
            var context = new DeviceContext();
            this.devices.add(name, context);
            return context;
        }
    }

    public getDeviceConfiguration(): DevicePayload[] {
        let deviceList: DevicePayload[] = [];

        for (let key of this.devices.keys()) {
            var context = this.devices.item(key);
            if (context.descriptor) {
                let state = context.state === undefined ? {} : context.state;
                let deviceResponse: DevicePayload = <DevicePayload>
                    {
                        name: key, config: context.config, state: state, device: context.descriptor
                    };
                deviceList.push(deviceResponse);
            }
        }

        return deviceList;
    }

    public getDeviceProfiles(): DeviceProfile[] {
        let deviceList: DeviceProfile[] = [];

        for (let key of this.devices.keys()) {
            var context = this.devices.item(key);

            if (context.profile !== undefined)
                deviceList.push(context.profile);
        }

        return deviceList;
    }
};
