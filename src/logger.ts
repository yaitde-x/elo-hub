import { injectable, inject } from "inversify";
import "reflect-metadata";

export interface ILogger {
    log(obj: any): void;
    info(obj: any): void;
    error(obj: any): void;
}

@injectable()
export class ConsoleLogger implements ILogger {
    
    log(obj: any): void {
        console.log(obj);
    }

    info(obj: any): void {
        console.info(obj);
    }

    error(obj: any): void {
        console.error(obj);
    }

}