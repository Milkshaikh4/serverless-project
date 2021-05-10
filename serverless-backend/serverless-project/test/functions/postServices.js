/* eslint-env mocha */

const mochaPlugin = require('serverless-mocha-plugin');
const dirtyChai = require('dirty-chai');
const fs = require('fs');

mochaPlugin.chai.use(dirtyChai);
const { expect } = mochaPlugin.chai;

const create = mochaPlugin.getWrapper('post', '/api/post.js', 'create');

describe('CreatePost', () => {
  const event1 = { body: {} };
  const event2 = { body: {} };

  try {
    const data1 = fs.readFileSync('./test/events/event1.json', 'utf8');
    event1.body = data1;

    const data2 = fs.readFileSync('./test/events/event2.json', 'utf8');
    event2.body = data2;
  } catch (err) {
    console.log(`Error reading file from disk: ${err}`);
  }

  // eslint-disable-next-line arrow-body-style
  it('it should create a post and return successful when given post request', () => create.run(event1).then((response) => {
    expect(response).to.not.be.empty();
    expect(response.statusCode).to.equal(200);
  }));
});
