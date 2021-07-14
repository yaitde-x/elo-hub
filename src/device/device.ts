
import { injectable, inject } from "inversify";
import "reflect-metadata";
import axios from 'axios';
import { InputRegisterMap, OutputRegisterMap, ConfigRegisterMap } from "../registers/register_map_models";

export class DeviceNames {
    public static kitchen: string = 'kitchen';
    public static whiteboard: string = 'elo_wb';
    public static sideTable: string = 'sidetable';
}

export class DeviceIndicator {
    i : number;
    li : number;
    ls: number;
    lc: number;
};

export class DeviceDescriptor {
    public address: string;
    public port: number;
    public connectionType: string;
    public deviceClass: string;
    public description: string;
    public name: string;
    public animationPack: string;
    public indicators: DeviceIndicator[];
    public inputRegisterMap: InputRegisterMap;
    public outputRegisterMap: OutputRegisterMap;
    public configRegisterMap: ConfigRegisterMap;
}

export interface IDevice {
    updateIndicator(indicatorId: number, status: number, level: number): Promise<void>;
    setOn(): Promise<void>;
    setOff(): Promise<void>;
}

export class AxiosDevice implements IDevice {

    private url: string;
    private port: number;

    constructor(url: string, port: number) {
        this.url = url;
        this.port = port;
    }

    async updateIndicator(indicatorId: number, status: number, level: number): Promise<void> {
        var url = "http://" + this.url + ":" + this.port + '/api/dev_indicator';

        var indicatorRequest =
            {
                url: url,
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                data: { indicatorId: indicatorId, status: status, level: level }
            };

        await axios(indicatorRequest);
    }

    async setOn(): Promise<void> {
        var fullUrl = "http://" + this.url + ':' + this.port + '/api/dev_on';
        await axios.post(fullUrl, { brightness: 100 });
    }

    async setOff(): Promise<void> {
        var fullUrl = "http://" + this.url + ':' + this.port + '/api/dev_off';
        await axios.post(fullUrl, { brightness: 100 });
    }
}

