
import { Container } from "inversify";
import { IDeviceFactory, RuntimeDeviceFactory } from "../src/device/device_factory";
import { AlexaVoiceHandler } from "../src/voice/voice_handler";
import { IMessageHub } from "../src/message_hub";
import { ConsoleLogger, ILogger } from "../src/logger";
import { TYPES } from "../src/types";
import { MockMessageHub } from "./mocks/mock_message_hub";
import { IDeviceRepo, StaticDeviceRepo } from "../src/device/device_repo";
import { IVoiceHandler } from "../src/voice/voice_interfaces";

const container = new Container();

container.bind<IDeviceRepo>(TYPES.DeviceRepo).to(StaticDeviceRepo).inSingletonScope();
container.bind<IDeviceFactory>(TYPES.DeviceFactory).to(RuntimeDeviceFactory);
container.bind<IVoiceHandler>(TYPES.VoiceHandlerFactory).to(AlexaVoiceHandler);
container.bind<IMessageHub>(TYPES.MessageHub).to(MockMessageHub);
container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger);

export { container };