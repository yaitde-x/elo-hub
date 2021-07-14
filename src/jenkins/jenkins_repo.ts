import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { ISystemConfig, IRepoConfig } from '../utility/utility';
import { TYPES } from '../types';
import { IRepoBase, RepoBase } from '../core/repo_base';


@injectable()
export class JenkinsApi  {


    constructor(@inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

    }

    getRepoFilename(): string {
        return "jenkins_build_status.json";
    }

};
