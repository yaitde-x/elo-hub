import * as mocha from 'mocha';
import { expect } from 'chai';
import { container } from "../boot";

import { Utility, ISystemConfig } from "../../src/utility/utility";
import { StaticDeviceRepo } from '../../src/device/device_repo';
import { DeviceNames } from '../../src/device/device';
import { ConsoleLogger } from '../../src/logger';

var config: ISystemConfig = {
    featureSet: { vsts: false, build: false, wiki: false, jenkins: false, exfin: false },
    messaging: {
        hubUrl: 'mqtt://pi3_hub',
        listenerDisabled: false,
        listenerPattern: 'elo/#'
    },
    elasticSearch : {
        url: "localhost:9200",
        logLevel : "trace",
        index : "test"
    },
    deviceRepo: {
        repoPath: 'sample_files'
    },
    indicatorRepo: {
        repoPath: 'sample_files'
    },
    animationRepo: {
        repoPath: 'sample_files'
    },
    registerMapRepo: {
        repoPath: 'sample_files'
    },
    broadcastInterval: 5000,
    vsts: { scriptPath: "", dataPath: "", token: "", vstsPath: "",activeTasksQueryId: "" },
    knowledgeDoc: { repoRoot: "" }
};

describe("Device Repo Tests", function () {
    describe("Static Device Repo Tests", function () {
        describe("Can retrieve a device", function () {
            it("retrieves the whiteboard device", function () {

                var repo = new StaticDeviceRepo(new ConsoleLogger(), config);
                var result = repo.getDeviceByName(DeviceNames.whiteboard);

                expect(result).to.not.be.null;
            }),
                it("bad device names return null", function () {

                    var repo = new StaticDeviceRepo(new ConsoleLogger(), config);
                    var result = repo.getDeviceByName('junk');

                    expect(result).to.be.null;
                });
        });
    });
});