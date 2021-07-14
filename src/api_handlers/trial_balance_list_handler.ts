import axios, { AxiosResponse, AxiosError } from 'axios';
import { IExpressHandler, IExpressRequest, IExpressResponse } from './handler_api';
import { IExFinConfig } from '../utility/interface';


export class TrialBalanceListHandler implements IExpressHandler {

  private config: IExFinConfig;

  constructor(config: IExFinConfig) {
    this.config = config;
  }

  public async handle(expressRequest: IExpressRequest, expressResponse: IExpressResponse): Promise<any> {

    let url = this.config.api + '/api/trialbalance';

    axios.get(url,
      {
        headers: { 'Authorization': 'Bearer ' + this.config.token }
      })
      .then(function (axiosResponse: AxiosResponse) {
        this.handleSuccessResponse(expressResponse, axiosResponse.status, axiosResponse.data);
      })
      .catch(function (axiosError: AxiosError) {
          let err = { errCode: axiosError.code, message: axiosError.message };
          this.handleErrorResponse(expressResponse, axiosError.response.status, err);
      });
  }

  private handleSuccessResponse(expressResponse: IExpressResponse, status: any, data: any) {
    expressResponse.json(data);
    expressResponse.status(status)
    expressResponse.end();
  }

  private handleErrorResponse(expressResponse: IExpressResponse, status: any, err: any) {
    expressResponse.json({ errorInfo: err });
    expressResponse.status(status)
    expressResponse.end();
  }
}
