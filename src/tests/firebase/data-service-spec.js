/* jshint esversion:6 */
const chai = require('chai');

const config = require('../../config');
const drMemory = require('../../firebase/data-service.js');

describe('DataService', function() {
    
    describe('.save()', function() {
        it('should save the tests.core.dataservice save:true', function() {
            let p = drMemory.save('tests/core/dataservicesave', {save: true});
            
            p.then(function(result) {
                expect(result.success).toBe(true);
            });
        });
    });
    
    describe('.get()', function() {
        it('should get the tests.core.dataservice save:true', function() {
            let p = drMemory.get('tests/core/dataservicesave');
            
            p.then(function(result) {
                expect(result.val()).toBe(true);
            });
        });
    });
});
