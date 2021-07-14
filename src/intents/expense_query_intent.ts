import { IVoiceRequest, IVoiceIntentHandler, IVoiceResponse } from "../voice/voice_interfaces";
import { ILogger } from "../logger";
import { IDeviceRepo } from "../device/device_repo";
import { exec } from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import { ISystemConfig } from "../utility/utility";
import { VstsFileNames, StandardVoiceResponses } from "../types";

export class ExpenseQueryIntentHandler implements IVoiceIntentHandler {

    logger: ILogger;
    config: ISystemConfig;

    constructor(logger: ILogger, config: ISystemConfig) {
        this.logger = logger;
        this.config = config;
    }

    async handleIntent(request: IVoiceRequest, response: IVoiceResponse): Promise<IVoiceResponse> {
        let that = this;
        return new Promise<IVoiceResponse>((resolve, reject) => {
            console.log('expense query...');

            var category = that.getExpenseCategory(request.slot("category"));

            if (category) {
                var amount = that.getAmount(category);
                var commonPhrase = this.getCommonPhrase(category);
                var phrase = 'This month, you have spent ' + amount + ' dollars on ' + commonPhrase;
                response.say(phrase);
            }
            else
                response.say("I dont know about " + request.slot("category"));

            resolve(response);
        });
    }

    getCommonPhrase(expenseCategory: string): string {
        let index: any = {};
        index['grocery'] = 'groceries';
        index['utility'] = 'utilities';

        var phrase = index[expenseCategory];

        if (!phrase)
            phrase = expenseCategory;

        return phrase;
    }

    getAmount(expenseCategory: string): number {
        let index: any = {};
        index['household'] = 400;
        index['technology'] = 300;
        index['utility'] = 330;
        index['automotive'] = 550;
        index['insurance'] = 300;

        return index[expenseCategory];
    }

    getExpenseCategory(category: string): string {
        var index: any = {};

        index['groceries'] = 'household';
        index['food'] = 'household';
        index['household'] = 'household';
        
        index['electronics'] = 'technology';
        index['technology'] = 'technology';

        index['utilities'] = 'utility';
        index['internet'] = 'utility';
        index['phone'] = 'utility';

        index['automotive'] = 'automotive';
        index['fuel'] = 'automotive';
        index['oil_change'] = 'automotive';

        index['insurance'] = 'insurance';
        index['car_insurance'] = 'insurance';
        index['insurance'] = 'insurance';

        var sanitized = category.replace(' ', '_').replace("'", '');

        return index[sanitized];
    }
}
