import { container } from './boot';
import { IDeviceRepo } from "./device/device_repo";
import { IIndicatorRulesEngine } from "./indicator/indicator_repo";
import { DeviceStateHandler } from "./topics/topic_handler_factory";
import { TYPES, VstsFileNames } from "./types";
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { ISystemConfig } from "./utility/utility";
import { Container } from 'inversify';
import { VstsScriptRunner, VstsActiveTaskCommandBuilder } from './vsts/vsts_script_runner';
import { VstsWorkitem } from './vsts/vsts';
import { IVstsRepo } from './vsts/vsts_repo';


export interface IScheduledJob {
    run(container: Container, config: ISystemConfig): Promise<void>;
};

export class RefreshActiveTasksJob implements IScheduledJob {
    run(container: Container, config: ISystemConfig): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            console.log('refreshing active tasks...');

            try {
                let scriptRunner = new VstsScriptRunner<VstsWorkitem>(config, VstsFileNames.ListActiveTasks, VstsFileNames.ActiveTaskResults, VstsActiveTaskCommandBuilder);
                let result = await scriptRunner.runWithResult();

                let vstsRepo = container.get<IVstsRepo>(TYPES.VstsRepo);
                vstsRepo.mergeTaskState(result);

                resolve();
            } catch (Err) {
                reject(Err);
            }
        });
    }
}