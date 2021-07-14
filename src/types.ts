const TYPES = {
    DeviceFactory: Symbol("IDeviceFactory"),
    VoiceHandlerFactory: Symbol("IVoiceHandlerFactory"),
    MessageHub: Symbol("IMessageHub"),
    Logger: Symbol("ILogger"),
    Config: Symbol("ISystemConfig"),
    ExpressApp: Symbol("IExpressApp"),
    DeviceRepo: Symbol("IDeviceRepo"),
    TopicHandlerFactory : Symbol("ITopicHandlerFactory"),
    IndicatorRepo : Symbol("IIndicatorRepo"),
    IndicatorRulesEngine : Symbol("IIndicatorRulesEngine"),
    AnimationRepo : Symbol("IAnimationRepo"),
    RegisterMapRepo : Symbol("IRegisterMapRepo"),
    VstsRepo : Symbol("IVstsRepo")
};

const JenkinsFileNames  = {
    BuildResults : "jenkins_build_status.json",
    CheckBuildStatus: "jenkins_check_build_status.sh",
};

const VstsFileNames  = {
    BuildResults : "build_status.json",
    CheckBuildStatus: "check_build_status.sh",
    QueueBuild: "queue_build.sh",
    ListActiveTasks: "list_active_tasks.sh",
    ActiveTaskResults: "active_tasks.json"    
};

const StandardVoiceResponses  = {
    MissingScript : "I seem to have lost the script. You can probably get the dev to fix it.",
    MissingBuildResults: "The file containing the last build result is not where it should be."
}

const ELO_HUB_VERSION : string = "0.0.3.0";

export { TYPES, VstsFileNames, StandardVoiceResponses, JenkinsFileNames, ELO_HUB_VERSION };
