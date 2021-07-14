import * as fs from 'fs';
import * as filewatcher from 'filewatcher';
import * as path from 'path';
import { container } from "../boot";
import { KeyedCollection } from "../utility/dictionary";
import { IDeviceRepo } from "../device/device_repo";
import { DeviceState } from "../topics/topic_handler_factory";
import { IMessageHub } from "../message_hub";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { ISystemConfig } from "../utility/utility";
import { ILogger } from "../logger";


export class IndicatorRuleType {
    public static equal: number = 1;
    public static range: number = 2;
}

export class IndicatorRepoConfig {
    repoPath: string;
}

export class Indicator {
    name: string;
    rules: IndicatorRule[];

    constructor() {
        this.rules = [];
    }
};

class IndicatorContext {
    indicator: Indicator;
};

class IndicatorRule {
    ruleType: number;
    triggerName: string;
    triggerVar: string;
    deviceName: string;
    deviceIndicator: number;
    indicatorState: number;
    indicatorLevel: number;

    minVal: number;
    maxVal: number;
};

export interface IIndicatorRepo {
    getIndicatorsInterestedInDeviceStateChange(deviceName: string): Indicator[];
    getIndicator(name: string): Indicator;
};

@injectable()
export class IndicatorRepo implements IIndicatorRepo {

    private indicators: KeyedCollection<IndicatorContext>;
    private repoConfig: IndicatorRepoConfig;

    constructor(@inject(TYPES.Logger) logger: ILogger,
                @inject(TYPES.Config) systemConfig: ISystemConfig) {
                    
        this.repoConfig = systemConfig.indicatorRepo;

        this.initializeRepo();
        this.watchRepo();
    }

    private watchRepo() {
        let that = this;
        let repoPath = path.join(this.repoConfig.repoPath ,'ind_repo.json');
        let watcher = filewatcher();
 
        watcher.add(repoPath);
         
        watcher.on('change', function(file, stat) {
          console.log('Indicator repo changed, reloading...');
          that.initializeRepo();
        });
    }

    initializeRepo() {
        let self = this;
        this.indicators = new KeyedCollection<IndicatorContext>();

        let repoPath = path.join( this.repoConfig.repoPath,  '/ind_repo.json');
        let indicatorStore = <Indicator[]> JSON.parse( fs.readFileSync(repoPath).toString());

        indicatorStore.forEach(indicator => {
            this.indicators.add(indicator.name, <IndicatorContext> { indicator: indicator } );
        });
    }

    private addDogFoodIndicatorRules(indicator: Indicator): void {
        indicator.rules.push(this.createRule(IndicatorRuleType.range, 'elo_dfmon', 'v1', 'elo_wb', 1, 2, 2, undefined, 624));
        indicator.rules.push(this.createRule(IndicatorRuleType.range, 'elo_dfmon', 'v1', 'elo_wb', 1, 2, 4, 625, 899));
        indicator.rules.push(this.createRule(IndicatorRuleType.range, 'elo_dfmon', 'v1', 'elo_wb', 1, 2, 0, 900, undefined));
    }

    private addBuildIndicatorRules(indicator: Indicator): void {
        indicator.rules.push(this.createRule(IndicatorRuleType.equal, 'elo_bld', 'v1', 'elo_wb', 0, 2, 2, 0, undefined));
        indicator.rules.push(this.createRule(IndicatorRuleType.equal, 'elo_bld', 'v1', 'elo_wb', 0, 2, 1, 1, undefined));
        indicator.rules.push(this.createRule(IndicatorRuleType.equal, 'elo_bld', 'v1', 'elo_wb', 0, 2, 3, 2, undefined));
    }


    private createRule(ruleType: number, triggerName: string, triggerVar: string, deviceName: string, deviceIndicator: number, indicatorState: number, indicatorLevel: number, minVal: number, maxVal: number): IndicatorRule {
        let rule = new IndicatorRule();

        rule.ruleType = ruleType;
        rule.triggerName = triggerName;
        rule.triggerVar = triggerVar;
        rule.deviceName = deviceName;
        rule.deviceIndicator = deviceIndicator;
        rule.indicatorState = indicatorState;
        rule.indicatorLevel = indicatorLevel;
        rule.minVal = minVal;
        rule.maxVal = maxVal;

        return rule;
    }

    public getIndicatorsInterestedInDeviceStateChange(deviceName: string): Indicator[] {
        let indicators: KeyedCollection<Indicator> = new KeyedCollection<Indicator>();
        let allContexts: IndicatorContext[] = this.indicators.values();

        allContexts.forEach(context => {
            let rules = context.indicator.rules;
            rules.forEach(rule => {
                if (rule.triggerName === deviceName) {
                    if (!indicators.containsKey(context.indicator.name))
                        indicators.add(context.indicator.name, context.indicator);
                }
            });
        });

        return indicators.values();
    }

    public getIndicator(name: string): Indicator {
        if (this.indicators.containsKey(name)) {
            return this.indicators.item(name).indicator;
        }

        return undefined;
    }
}

export interface IIndicatorAction {
    invoke() : void;
};

export class IndicatorStatus {
    i : number;
    is: number;
    il: number;
};

export class MqttIndicatorAction implements IIndicatorAction {
    deviceName: string;
    
    indicatorLevel: number;
    indicatorId: number;
    indicatorState: number;

    constructor(deviceName:string,  indicatorId: number, indicatorState: number, indicatorLevel: number) {

        this.deviceName = deviceName;
        this.indicatorId = indicatorId;
        this.indicatorState = indicatorState;
        this.indicatorLevel = indicatorLevel;
    }

    public invoke() : void {
        let status: IndicatorStatus = { i: this.indicatorId, is: this.indicatorState, il: this.indicatorLevel };
        let messageHub : IMessageHub = container.get<IMessageHub>(TYPES.MessageHub);
        messageHub.broadcastIndicatorStatus(this.deviceName, status);
    }
};

export interface IIndicatorRulesEngine {
    processDeviceStateChange(deviceName: string): IIndicatorAction[];
};

@injectable()
export class IndicatorRulesEngine implements IIndicatorRulesEngine {

    private indicatorRepo: IIndicatorRepo;
    private deviceRepo: IDeviceRepo;

    constructor(@inject(TYPES.IndicatorRepo) indicatorRepo: IIndicatorRepo, 
                @inject(TYPES.DeviceRepo) deviceRepo: IDeviceRepo) {
        this.indicatorRepo = indicatorRepo;
        this.deviceRepo = deviceRepo;
    }

    public processDeviceStateChange(deviceName: string): IIndicatorAction[] {
        let self = this;
        let indicatorActions: IIndicatorAction[] = [];
        let affectedIndicators: Indicator[] = this.indicatorRepo.getIndicatorsInterestedInDeviceStateChange(deviceName);

        affectedIndicators.forEach(indicator => {
            indicatorActions = indicatorActions.concat(self.processIndicatorRules(indicator));
        });

        return indicatorActions;
    }

    private processIndicatorRules(indicator: Indicator): IIndicatorAction[] {
        let self = this;
        let indicatorActions: IIndicatorAction[] = [];
        let deviceState: KeyedCollection<DeviceState> = new KeyedCollection<DeviceState>();

        indicator.rules.forEach(rule => {
            let triggerState = self.getDeviceState(rule.triggerName, deviceState);
            let triggerVal: number = <number>triggerState[rule.triggerVar];

            if (triggerVal !== undefined) {
                if (rule.ruleType === IndicatorRuleType.equal) {
                    if (triggerVal === rule.minVal)
                        indicatorActions.push(self.createIndicatorAction(rule.deviceName, rule.deviceIndicator, rule.indicatorState, rule.indicatorLevel));
                }
                else if (rule.ruleType === IndicatorRuleType.range) {
                    if ((rule.minVal === undefined || rule.minVal === null) && triggerVal <= rule.maxVal)
                        indicatorActions.push(self.createIndicatorAction(rule.deviceName, rule.deviceIndicator, rule.indicatorState, rule.indicatorLevel));
                    else if ((rule.minVal !== undefined && rule.minVal !== null) && triggerVal >= rule.minVal && 
                             (rule.maxVal !== undefined && rule.maxVal !== null) && triggerVal <= rule.maxVal)
                        indicatorActions.push(self.createIndicatorAction(rule.deviceName, rule.deviceIndicator, rule.indicatorState, rule.indicatorLevel));
                    else if ((rule.maxVal === undefined || rule.maxVal === null) && triggerVal >= rule.minVal)
                        indicatorActions.push(self.createIndicatorAction(rule.deviceName, rule.deviceIndicator, rule.indicatorState, rule.indicatorLevel));
                }
            }
        });

        return indicatorActions;
    }

    private createIndicatorAction(deviceName: string, indicatorId: number, indicatorState: number, indicatorLevel: number): IIndicatorAction {
        let action = new MqttIndicatorAction(deviceName, indicatorId, indicatorState, indicatorLevel);
        return action;
    }

    private getDeviceState(deviceName: string, stateIndex: KeyedCollection<DeviceState>): DeviceState {

        if (stateIndex.containsKey(deviceName))
            return stateIndex.item(deviceName);
        else {
            let deviceState = this.deviceRepo.getDeviceState(deviceName);
            stateIndex.add(deviceName, deviceState);
            return deviceState;
        }
    }
}