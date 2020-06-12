
const { assert } = require('chai');
const { userEmailLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function(done) {
    const user = userEmailLookup("user@example.com", testUsers)
    const expectedOutput = testUsers["userRandomID"];
    assert.equal(expectedOutput, user)

    done()
  });
  
  it('should return a user with valid email', function(done) {
    const user = userEmailLookup("user2@example.com", testUsers)
    const expectedOutput = testUsers["user2RandomID"];
    assert.equal(expectedOutput, user)

    done()
  });

  it('should return undefined', function(done) {
    const user = userEmailLookup("hello@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user)

    done()
  });

});