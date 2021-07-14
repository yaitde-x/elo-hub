
import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { ISystemConfig, IRepoConfig } from '../utility/utility';
import { TYPES } from '../types';
import { IRepoBase, RepoBase } from '../core/repo_base';
import { RegisterMap } from "./register_map_models";

 
export interface IRegisterMapRepo extends IRepoBase<RegisterMap> {

};

@injectable()
export class RegisterMapRepo extends RepoBase<RegisterMap> implements IRegisterMapRepo {

    constructor( @inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

        super(logger, systemConfig.registerMapRepo);

    }

    getRepoFilename(): string {
        return "register_maps.json";
    }

    getKey(item: RegisterMap): string {
        return item.name;
    }

};
