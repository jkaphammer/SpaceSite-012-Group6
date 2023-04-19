// Imports the index.js file to be tested.
const server = require('../index'); //TO-DO Make sure the path to your index.js is correctly added
// Importing libraries

// Chai HTTP provides an interface for live integration testing of the API's.
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });

  // ===========================================================================
  // TO-DO: Part A Login unit test case

  //We are checking POST /add_user API by passing the user info in the correct order. This test case should pass and return a status 200 along with a "Success" message.
//Positive cases
it('positive : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 'johndoe@example.com', password: 'HelloWorld'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Login Success');
        done();
      });
  });

  //We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 200 along with a "Invalid input" message.
it('Negative : /login', done => {
    chai
      .request(server)
      .post('/login')
      .send({email: 10, password: 'HelloWorld'})
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.message).to.equals('Incorrect username or password');
        done();
      });
  });

  it('positive : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({name: 'Lil Uzi', email: 'liluzi@example.com', password: 'Ijustwannarock', birthday: '2000-01-01'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.message).to.equals('Register Success');
        done();
      });
  });

  it('Negative : /register', done => {
    chai
      .request(server)
      .post('/register')
      .send({name: 'Lil Uzi', email: 'johndoe@example.com', password: 'Ijustwannarock', birthday: '2000-01-01'})      .end((err, res) => {
        expect(res).to.have.status(409);
        expect(res.body.message).to.equals('Email already exixts');
        done();
      });
  });
  

});