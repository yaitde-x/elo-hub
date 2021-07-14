
export interface IBuild {
    
}
export interface IBuildHandler {

    queueBuild(): Promise<void>;
    getBuildStatus() : Promise<number>;
    getBuild() : Promise<IBuild>;
};
