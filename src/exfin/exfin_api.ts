import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { ISystemConfig } from '../utility/utility';
import { TYPES } from '../types';

export interface TrialBalanceEntry 
    {
        id : string;
        accountNumber : string;
        department : string;
        amount : number;
    }

export interface TrialBalance {
    ownerId: string;
    realm: string;
    id: string;
    branch: string;
    period : number;
    entries : TrialBalanceEntry[];
};


@injectable()
export class ExFinApi {


    constructor(@inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

    }

    getTrialBalanceList(): TrialBalance[] {
        return <TrialBalance[]>[];
    }

};  