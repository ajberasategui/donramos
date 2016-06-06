/* jshint esversion:6 */
const chai = require("chai");
const slackClient = require("../../slack/slack-client");
const utils = require("../../core/utils");
const expect = chai.expect;

describe("utils", () => {
    describe("unamesToIds()", () => {
        it("should map usernames to ids", (done) => {
            slackClient.getUsers((err, users) => {
                const unames = ["ajberasategui"];
                const usersWithIds = utils.unamesToIds(unames, users.members);
                
                expect(usersWithIds[0].id).to.equal("U1CD139TN");
                done();
            });
        });
    });
});
