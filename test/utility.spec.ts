
import * as mocha from 'mocha';
import {expect} from 'chai';

import { Utility } from "../src/utility/utility";
import { container} from "./boot";

describe("Utility Tests", function () {
    describe("Whiteboard Name Recognition Tests", function () {
        it("recognizes whiteboard as a phrase", function () {

            var result = Utility.isWhiteboard("whiteboard");

            expect(result).to.equal(true);
        });
    });
    describe("Kitchen Cabinet Name Recognition Tests", function () {
        it("recognizes kitchen as a phrase", function () {

            var result = Utility.isKitchen("kitchen");

            expect(result).to.equal(true);
        });
    });
    describe("Side Table Name Recognition Tests", function () {
        it("recognizes side table as a phrase", function () {

            var result = Utility.isSideTable("side table");

            expect(result).to.equal(true);
        });
    });
});