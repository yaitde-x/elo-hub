import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { ISystemConfig, IRepoConfig } from '../utility/utility';
import { TYPES } from '../types';
import { IRepoBase, RepoBase } from '../core/repo_base';
import { VstsWorkitem, VstsUtilities } from "./vsts";
import { VstsActiveTaskCommandBuilder } from "./vsts_script_runner";

export class VstsTask {
    "id": number;
    "title": string;
    "state": string;
    "originalEstimate": number;
    "completedWork": number;
    "remainingWork": number;
};

export class VstsState {
    name: string;
    openTasks: VstsTask[];
};

export interface IVstsRepo extends IRepoBase<VstsState> {
    getActiveTasks(): VstsTask[];
    mergeTaskState(workItems: VstsWorkitem[]): void;
};

@injectable()
export class VstsRepo extends RepoBase<VstsState> implements IVstsRepo {

    constructor(@inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

        super(logger, systemConfig.registerMapRepo);

    }

    getRepoFilename(): string {
        return "vsts_repo.json";
    }

    getKey(item: VstsState): string {
        return item.name;
    }

    getActiveTasks(): VstsTask[] {
        let allTasks = this.getAllTasks();
        let activeTasks: VstsTask[] = [];

        allTasks.forEach((task) =>{
            activeTasks.push(task);
        });
        
        return activeTasks;
    }

    getAllTasks(): VstsTask[] {
        let myState = this.getItem(VstsUtilities.getMyVstsId());
        let allTasks = myState.openTasks;
        let copyOfAllTasks = [];

        allTasks.forEach((task) =>{ copyOfAllTasks.push(task); });

        return copyOfAllTasks;
    }

    addOrUpdateTask(newTask: VstsTask): void {
        let myState = this.getItem(VstsUtilities.getMyVstsId());
        let allTasks = myState.openTasks;
        let index = allTasks.findIndex((task) => { return task.id == newTask.id });

        if (index == -1)
            allTasks.push(newTask);
        else
            allTasks[index] = newTask;
    }

    mergeTaskState(workItems: VstsWorkitem[]): void {
        let self = this;

        let mergeChangedRepo = false;
        let allTasks = self.getAllTasks();

        workItems.forEach((workItem)=>{
            let internalTask = self.findTask(allTasks, workItem.id);
            if (internalTask == null)
            {
                let task = self.createTaskFromWorkItem(workItem);
                self.addOrUpdateTask(task);
                mergeChangedRepo = true;
            } else if (self.mergeTaskAndReturnChanged(workItem, internalTask))
                mergeChangedRepo = true;
        });

        // Still need to see if any tasks have changed
        if (mergeChangedRepo)
            self.save();
    }

    private createTaskFromWorkItem(workItem: VstsWorkitem) : VstsTask {
        let task = new VstsTask();
        
        task.id = workItem.id;
        task.title = VstsUtilities.getTitle(workItem);
        task.originalEstimate = VstsUtilities.getOriginalEstimate(workItem);
        task.completedWork = VstsUtilities.getCompletedWork(workItem);
        task.remainingWork = VstsUtilities.getRemainingWork(workItem);
        
        return task;
    }
    private findTask(tasks: VstsTask[], id: number) {
        tasks.forEach((task) => {
            if (task.id == id)
                return task;
        });

        return null;
    }

    private mergeTaskAndReturnChanged(workItem: VstsWorkitem, task: VstsTask) : boolean {
        return false;
    }
};
