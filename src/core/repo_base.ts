import * as fs from 'fs';
import * as filewatcher from 'filewatcher';
import * as path from 'path';
import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { KeyedCollection } from '../utility/dictionary';
import { ISystemConfig, IRepoConfig } from '../utility/utility';
import { TYPES } from '../types';

export interface IRepoBase<T> {
    getItem(key: string): T;
    allItems(): T[];
};

@injectable()
export class RepoBase<T> implements IRepoBase<T> {

    private repoConfig: IRepoConfig;
    private items: KeyedCollection<T>;
    private writing: number = 0;

    constructor(logger: ILogger, repoConfig: IRepoConfig) {

        this.repoConfig = repoConfig;
        this.initializeRepo();
        this.watchRepo();
    }

    private getFullRepoPath(): string {
        return path.join(this.repoConfig.repoPath, this.getRepoFilename());
    }

    private watchRepo() {
        let that = this;
        let repoPath = this.getFullRepoPath();
        let watcher = filewatcher();

        watcher.add(repoPath);

        watcher.on('change', function (file, stat) {
            if (that.writing > 0)
                that.writing = 0;
            else {
                console.log(this.repoFileName + ' repo has changed, reloading...');
                that.initializeRepo();
            }
        });
    }

    public save(): Promise<void> {
        let self = this;
        self.writing += 1;

        return new Promise((resolve, reject) => {
            let repoPath = self.getFullRepoPath();
            let buf = JSON.stringify( self.items.values(), null, 2);
            fs.writeFile(repoPath, buf, (err) => {

                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    public getItem(key: string): T {
        if (this.items.containsKey(key))
            return this.items.item(key);

        return undefined;
    }

    public allItems(): T[] {
        return this.items.values();
    }

    public getKey(item: T): string {
        return undefined;
    }

    getRepoFilename(): string {
        return undefined;
    }

    readItems(buf: Buffer): T[] {
        return <T[]>JSON.parse(buf.toString());
    }

    initializeRepo() {
        let self = this;
        this.items = new KeyedCollection<T>();

        let repoPath = this.getFullRepoPath();
        let fileStore = self.readItems(fs.readFileSync(repoPath))

        fileStore.forEach(item => {
            let key = self.getKey(item);
            this.items.add(key, <T>item);
        });

    }
};