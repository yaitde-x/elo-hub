import { IExpressHandler, IExpressRequest, IExpressResponse } from "./handler_api";
import { IMessageHub } from "../message_hub";
import { IRepoBase } from "../core/repo_base";

export class GenericListHandler<T> implements IExpressHandler {

    repo: IRepoBase<T>;
    description: string;
    
    constructor(description: string, repo: IRepoBase<T>) {
        this.repo = repo;
        this.description = description;
    }

    public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse): Promise<any> {

        console.log(this.description + ': ' + JSON.stringify(expressRequest.query));
        
        let items = this.repo.allItems();

        expressResponse.json(items);
    }

};
