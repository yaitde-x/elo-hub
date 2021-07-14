
export interface IJenkinsConfig {
    url: string;
    userName: string;
    password: string;
    defaultBuild: string;
    scriptPath: string;
    dataPath: string;
};

export interface IExFinConfig {
    api: string;
    ids: string;
    token: string;
};