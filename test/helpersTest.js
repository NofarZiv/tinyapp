const { assert } = require('chai');
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const  getUserByEmail  = require('../helpers.js');
chai.use(chaiHttp);


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
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined for unvalid email', function() {
    const user = getUserByEmail("user34@example.com", testUsers)
    assert.strictEqual(user, undefined);
  });
});

const agent = chai.request.agent("http://localhost:8080");

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should redirect to /login with 302 status code', function() {
    return agent.get("/").redirects(0).end((_, res) => {
      expect(res).to.redirect;
      expect(res).to.have.status(302);
      expect(res).to.redirectTo('/login');
  });
});

  it('should return 302 status code for /urls/new', function() {
    return agent.get('/urls/new').redirects(0).end((_, res) => {
      expect(res).to.redirect;
      expect(res).to.have.status(302);
      expect(res).to.redirectTo('/login');
  });
  }); 
  
  it('should return 404 status code for GET request to "/urls/NOTEXISTS"', () => {
    return agent
    .post('/register')
    .send({ email: '1@1.com', password: '1' })
    .then((registerRes) => {
        // Introduce a delay to ensure registration is processed
        return new Promise((resolve) => setTimeout(resolve, 1500)); // Adjust the delay time as needed
    })
    .then(() => {
        return agent.get('/urls/NOTEXISTS')
            .then((protectedRes) => {
                expect(protectedRes).to.have.status(404);
            });
    });
});

});