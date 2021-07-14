import { IDevice } from "../../src/device/device";

export class MockDevice implements IDevice {
    
    private deviceState : DeviceState;
    
    constructor() {
        this.deviceState = new DeviceState();
    }
    
    setOn(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    
    setOff(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public updateIndicator(indicatorId: number, state: number, level: number): Promise<any> {
        var self = this;
        return new Promise<any>((resolve, reject) => {
            this.deviceState.index = indicatorId;
            this.deviceState.state = state;
            this.deviceState.level = level;
            });
    }
    
}

class DeviceState {
    public index: number;
    public state: number;
    public level: number;
}