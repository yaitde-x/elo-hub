import axios, { AxiosResponse, AxiosError } from 'axios';
import {IExpressHandler, IExpressRequest, IExpressResponse } from './handler_api';

export class HelloHandler implements IExpressHandler {
    public async handle(expressRequest: IExpressRequest, res: IExpressResponse) : Promise<any>{
        res.send("Hello from elo_hub!");
    }
}
