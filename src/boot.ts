
import { Container } from "inversify";
import { IDeviceFactory, RuntimeDeviceFactory } from "./device/device_factory";
import { IVoiceHandlerFactory, RuntimeVoiceHandlerFactory } from "./voice/voice_handler";
import { IMessageHub, MqttMessageHub } from "./message_hub";
import { ConsoleLogger, ILogger } from "./logger";
import { TYPES } from "./types";
import { IDeviceRepo, StaticDeviceRepo } from "./device/device_repo";
import { ITopicHandlerFactory, TopicHandlerFactory } from "./topics/topic_handler_factory";
import { IndicatorRepo, IIndicatorRepo, IndicatorRulesEngine, IIndicatorRulesEngine } from "./indicator/indicator_repo";
import { AnimationRepo, IAnimationRepo } from "./animations/animation_repo";
import { RegisterMapRepo, IRegisterMapRepo } from "./registers/register_map_repo";
import { VstsRepo, IVstsRepo } from "./vsts/vsts_repo";

const container = new Container();

container.bind<IDeviceRepo>(TYPES.DeviceRepo).to(StaticDeviceRepo).inSingletonScope();
container.bind<IDeviceFactory>(TYPES.DeviceFactory).to(RuntimeDeviceFactory).inSingletonScope();
container.bind<IVoiceHandlerFactory>(TYPES.VoiceHandlerFactory).to(RuntimeVoiceHandlerFactory).inSingletonScope();
container.bind<IMessageHub>(TYPES.MessageHub).to(MqttMessageHub).inSingletonScope();
container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger).inSingletonScope();
container.bind<IIndicatorRepo>(TYPES.IndicatorRepo).to(IndicatorRepo).inSingletonScope();
container.bind<IAnimationRepo>(TYPES.AnimationRepo).to(AnimationRepo).inSingletonScope();
container.bind<IRegisterMapRepo>(TYPES.RegisterMapRepo).to(RegisterMapRepo).inSingletonScope();
container.bind<IIndicatorRulesEngine>(TYPES.IndicatorRulesEngine).to(IndicatorRulesEngine).inSingletonScope();
container.bind<ITopicHandlerFactory>(TYPES.TopicHandlerFactory).to(TopicHandlerFactory).inSingletonScope();
container.bind<IVstsRepo>(TYPES.VstsRepo).to(VstsRepo).inSingletonScope();

console.log('container setup');

export { container };