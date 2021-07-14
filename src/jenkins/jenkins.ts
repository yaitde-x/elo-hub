import { ISystemConfig } from "../utility/utility";
import { IJenkinsConfig } from "../utility/interface";

export class JenkinsUtilities {

    public static getJenkinsConfig(config: ISystemConfig): IJenkinsConfig {
        let jenkins: IJenkinsConfig;

        if (typeof config.featureSet.jenkins === "boolean") {
            let jenkinsEnabled: boolean = config.featureSet.jenkins;

            if (jenkinsEnabled) {
                if (!config.jenkins) {
                    jenkins = null;
                } else
                    jenkins = config.jenkins;
            } else {
                jenkins = null;
            }
        } else
            jenkins = <IJenkinsConfig>config.featureSet.jenkins;

        return jenkins;
    }
};

export class JenkinsBuild {
    fullDisplayName: string;
    result: string;
    building: boolean;
};