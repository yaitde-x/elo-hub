import axios, { AxiosResponse, AxiosError } from 'axios';
import { IExpressHandler, IExpressRequest, IExpressResponse } from './handler_api';
import { INgrokConfig } from '../utility/utility';

export class NgrokConfigHandler implements IExpressHandler {

    private config: INgrokConfig;

    constructor(config: INgrokConfig) {
        this.config = config;
    }

    public async handle(expressRequest: IExpressRequest, res: IExpressResponse): Promise<any> {

        try {
            var result = await axios.get(this.config.baseUrl + '/api/tunnels');
            console.log(result);
            res.json(result);
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
}
