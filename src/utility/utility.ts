import { DeviceNames } from "../device/device";
import { IKnowledgeDocConfig } from "../documents/knowledge_doc_parser";
import { IJenkinsConfig, IExFinConfig } from "./interface";
import { BulkInsertProtocolViolationException } from "ravendb";

export class Utility {

    static isWhiteboard(unprocessedName: string): boolean {
        return (unprocessedName === "the whiteboard" || unprocessedName === "whiteboard" || unprocessedName === "white board"
            || unprocessedName === "the lightboard" || unprocessedName === "lightboard" || unprocessedName === "light board"
            || unprocessedName === "light 1" || unprocessedName === "white boar" || unprocessedName === "light boar"
            || unprocessedName === "narwhale"
            || unprocessedName === "light ward" || unprocessedName === "white war" || unprocessedName === "light war");
    }

    static isKitchen(unprocessedName: string): boolean {
        return (unprocessedName == "kitchen" || unprocessedName == "the kitchen" || unprocessedName === "kitch light" || unprocessedName === "the kitchen light");
    }

    static isSideTable(unprocessedName: string): boolean {
        return (unprocessedName == "side table" || unprocessedName == "the side table");
    }

    public static unprocessedNameToDeviceName(unprocessedName: string): string {
        if (Utility.isWhiteboard(unprocessedName))
            return DeviceNames.whiteboard;
        else if (Utility.isKitchen(unprocessedName))
            return DeviceNames.kitchen;
        else if (Utility.isSideTable(unprocessedName))
            return DeviceNames.sideTable;

        return null;
    }

};

export interface INgrokConfig {
    baseUrl: string;
};

export interface IElasticConfig {
    url: string;
    logLevel: string;
    index: string;
};

export interface IRepoConfig {
    repoPath: string;
};

export interface IVstsConfig {
    scriptPath: string;
    dataPath: string;
    token: string;
    vstsPath: string;
    activeTasksQueryId: string;
};

export interface IFeatureSet {
    build: boolean;
    wiki: boolean;
    vsts: boolean;
    jenkins: boolean | IJenkinsConfig;
    exfin: boolean;
};

export class Messages {
    public static StockErrorMessage: string = 'Not cool!';
};

export interface ISystemConfig {
    featureSet: IFeatureSet;
    messaging: any;
    deviceRepo: IRepoConfig;
    indicatorRepo: IRepoConfig;
    animationRepo: IRepoConfig;
    registerMapRepo: IRepoConfig;
    broadcastInterval: number;
    vsts: IVstsConfig;
    knowledgeDoc: IKnowledgeDocConfig;
    elasticSearch: IElasticConfig;
    jenkins?: IJenkinsConfig;
    ngrok?: INgrokConfig;
    exfin?: IExFinConfig;
};

export interface IExpressApp {

}