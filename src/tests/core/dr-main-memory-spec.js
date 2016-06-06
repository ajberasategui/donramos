/* jshint esversion:6 */
/// <reference path="../../../typings/tsd.d.ts" />

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const sinon = require("sinon");
const sinonChai = require("sinon-chai");

const config = require("./../../config");
const drMemory = require("../../core/dr-main-memory");
const db = require("../../firebase/data-service");

describe("drMainMemory", function() {
    
    let expect = chai.expect;
    // describe(".save()", function() {
    //     it("should save the tests.core.dataservice save:true", function() {
    //         let p = drMemory.save("tests/core/dataservicesave", {save: true});
            
    //         p.then(function(result) {
    //             expect(result.success).toBe(true);
    //         });
    //     });
    // });
    
    describe(".recall()", function() {
        
        it("should call db.get", () => {
            chai.use(sinonChai);
            let dbGetSpy = sinon.spy(db, 'get');
            
            let promise = drMemory.recall("testMemory");
            
            expect(dbGetSpy).to.have.been.calledWith("testMemory");
        });
    });
});
