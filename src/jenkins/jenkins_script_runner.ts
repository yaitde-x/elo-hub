import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { IJenkinsConfig } from '../utility/interface';
import { JenkinsFileNames } from '../types';

type JenkinsCommandBuilder = (scriptToRun: string, jenkinsConfig: IJenkinsConfig) => string;

export const JenkinsBuildCommandBuilder: JenkinsCommandBuilder = (scriptToRun: string, jenkinsConfig: IJenkinsConfig) => {
    //curl -XGET http://${1}/job/${2}/lastBuild/api/json --basic -u ${3}:{4} > {$5}/jenkins_build_status.json
    return scriptToRun + ' ' + jenkinsConfig.url + ' ' + jenkinsConfig.defaultBuild + ' ' + jenkinsConfig.userName + ' ' +
            jenkinsConfig.password + ' ' + jenkinsConfig.dataPath + ' ' + JenkinsFileNames.BuildResults;
};

export class JenkinsScriptRunner<T> {

    config: IJenkinsConfig;
    scriptName: string;
    resultsName: string;
    commandBuilder: JenkinsCommandBuilder;

    constructor(config: IJenkinsConfig, scriptName: string, resultsName: string, commandBuilder: JenkinsCommandBuilder) {
        this.config = config;
        this.scriptName = scriptName;
        this.resultsName = resultsName;
        this.commandBuilder = commandBuilder;
    }
    
    public runWithResult() : Promise<T> {
        let self = this;

        return new Promise<T>((resolve, reject) => {
            let scriptToRun = path.join(self.config.scriptPath, self.scriptName);

            if (!fs.existsSync(scriptToRun)) {
                reject("missing script");
                return;
            }

            let fullCommandLine = self.commandBuilder(scriptToRun, self.config);

            exec(fullCommandLine, (error, stdout, stderr) => {
                console.log(stdout);
                console.log(stderr);
                console.log(JSON.stringify(error));

                if (!error || error === null) {
                    var results = <T>JSON.parse(fs.readFileSync(path.join(self.config.dataPath, self.resultsName), 'utf8'));
                    resolve(results);
                }
            });
        });

    }
}