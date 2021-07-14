import { container } from './boot';
import { App } from './app'
import { ILogger } from './logger';
import { TYPES } from './types';
import { ISystemConfig } from './utility/utility';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { RefreshActiveTasksJob } from './sch_jobs';
import { JenkinsCheckBuildStatusJob } from './jenkins/jenkins_check_build_status';

const port: number = parseInt(process.env.PORT) || 3000;

let configPath: string = process.cwd();
const config: ISystemConfig = JSON.parse(fs.readFileSync(path.join(configPath, 'elo_hub_cfg.json')).toString());

container.bind<ISystemConfig>(TYPES.Config).toConstantValue(config);

setInterval(async () => {

  let buildStatusJob = new JenkinsCheckBuildStatusJob();
  await buildStatusJob.run(container, config);

  //let vstsTasksJob = new RefreshActiveTasksJob();
  //await vstsTasksJob.run(container, config);

}, 30 * 1000);

const app = new App();
app.run(port);
