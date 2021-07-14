
import { inject, injectable } from "inversify";
import { ILogger } from "../logger";
import { ISystemConfig, IRepoConfig } from '../utility/utility';
import { TYPES } from '../types';
import { IRepoBase, RepoBase } from '../core/repo_base';
import { AnimationPack } from './animation_models';

export interface IAnimationRepo extends IRepoBase<AnimationPack> {

};

@injectable()
export class AnimationRepo extends RepoBase<AnimationPack> implements IAnimationRepo {

    constructor( @inject(TYPES.Logger) logger: ILogger,
        @inject(TYPES.Config) systemConfig: ISystemConfig) {

        super(logger, systemConfig.animationRepo);

    }

    getRepoFilename(): string {
        return "animations.json";
    }

    getKey(item: AnimationPack): string {
        return item.name;
    }

};
