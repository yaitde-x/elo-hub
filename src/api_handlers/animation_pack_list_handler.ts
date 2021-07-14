import { IExpressHandler, IExpressRequest, IExpressResponse } from "./handler_api";
import { IMessageHub } from "../message_hub";
import { IAnimationRepo } from "../animations/animation_repo";


export class AnimationPackListHandler implements IExpressHandler {

    animationRepo: IAnimationRepo;

    constructor(animationRepo: IAnimationRepo) {
        this.animationRepo = animationRepo;
    }

    public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse): Promise<any> {

        console.log('animationPacklist: ' + JSON.stringify(expressRequest.query));
        let animationPackName = expressRequest.query.animationPack;
        let animationPacks = this.animationRepo.getItem(animationPackName);

        expressResponse.json(animationPacks);
    }

};
