import { ISystemConfig , IElasticConfig } from "../utility/utility";
import * as elasticsearch from 'elasticsearch';
import { IDocument } from "../core/document";
import { IDocumentCriteria } from "../core/document_criteria";

export class ElasticRepo {
    config: ISystemConfig;

    constructor(config: ISystemConfig) {
        this.config = config;
    }

    private getClient(config: IElasticConfig) : any {
        let client = new elasticsearch.Client({
            host: config.url,
            log: config.logLevel
        });

        return client;
    }

    public create(document: IDocument): Promise<IDocument> {
        let self = this;
        return new Promise<IDocument>((resolve, reject) => {
            let client = self.getClient(self.config.elasticSearch);

            client.create({
                index: document.category,
                type: document.documentType,
                id: document.id,
                body: document.documentBody
            }, function (error, response: IDocument) {
                if (error)
                    reject(error);
                else
                    resolve(response);
            });
        });
    }

    public update(document: IDocument): Promise<IDocument> {
        let self = this;
        return new Promise<IDocument>((resolve, reject) => {
            let client = self.getClient(self.config.elasticSearch);

            client.update({
                index: document.category,
                type: document.documentType,
                id: document.id,
                body: { doc: document.documentBody }
            }, function (error, response: IDocument) {
                if (error)
                    reject(error);
                else
                    resolve(response);
            });
        });
    }

    public delete(category: string, documentType: string, id: string): Promise<any> {
        return new Promise<void>((resolve, reject) =>{
            let client = this.getClient(this.config.elasticSearch);

            client.delete({
                index: category,
                type: documentType,
                id: id
              }, function (error, response) {
                if (error)
                    reject(error);
                else
                    resolve(response);
              });              
        });
    }

    public all(criteria: IDocumentCriteria) : Promise<IDocument[]> {
        return new Promise<IDocument[]>((resolve, reject) => {
            let client = this.getClient(this.config.elasticSearch);
            client.search({
                index: criteria.category,
                type: criteria.documentType,
                body: {
                  query: {
                    match_all: {}
                  }
                }
              }).then(function (resp) {
                  var hits = resp.hits.hits;
                  resolve(hits);
              }, function (err) {
                  reject(err);
              });
        });
    }

    public search(criteria: IDocumentCriteria) : Promise<IDocument[]> {
        return new Promise<IDocument[]>((resolve, reject) => {
            let client = this.getClient(this.config.elasticSearch);

            client.search({
                index: criteria.category,
                type: criteria.documentType,
                body: criteria.criteria
              }).then(function (resp) {
                  var hits = resp.hits.hits;
                  resolve(hits);
              }, function (err) {
                  reject(err);
              });
        });
    }
}