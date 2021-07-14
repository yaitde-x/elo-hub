
export interface IExpressRequest {
    body: any;
    query : any;
    params: any;
    headers: any;
}

export interface IExpressResponse {
    status(statusCode: number) : IExpressResponse;
    send(message: string): IExpressResponse;
    json(data: any): IExpressResponse;
    end() : void;
    end(buf: Buffer);
    writeHead(statusCode: number, headers: any);

}

export interface IExpressHandler {
    handle(request: IExpressRequest, response: IExpressResponse) : Promise<any>;
}
