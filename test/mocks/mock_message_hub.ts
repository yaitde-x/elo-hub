import { IMessageHub } from "../../src/message_hub";
import { IndicatorStatus } from "../../src/indicator/indicator_repo";


export class MockMessageHub implements IMessageHub{
    broadcastIndicatorStatus(device: string, status: IndicatorStatus): void {
        throw new Error("Method not implemented.");
    }
    sendMessage(device: string, subject: string, message: string) {
        
    }
}