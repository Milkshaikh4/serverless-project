/* eslint-disable prefer-arrow-callback */
/* eslint-env mocha */

const mochaPlugin = require('serverless-mocha-plugin');
const dirtyChai = require('dirty-chai');
const fs = require('fs');
const { Lambda } = require('aws-sdk');

mochaPlugin.chai.use(dirtyChai);
const { expect } = mochaPlugin.chai;

const api = new Lambda({
  apiVersion: '2015-03-31',
  endpoint:
    'http://localhost:3002',
});

describe.only('CreatePost', () => {
  const event1 = { body: {} };
  const event2 = { body: {} };

  try {
    const data1 = fs.readFileSync('./test/events/create/event1.json', 'utf8');
    event1.body = data1;

    const data2 = fs.readFileSync('./test/events/create/event2.json', 'utf8');
    event2.body = data2;
  } catch (err) {
    console.log(`Error reading file from disk: ${err}`);
  }

  it('it should create a post and return successful when given post request', async function () {
    const params = {
      FunctionName: 'post-service-dev-createPost',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event1),
    };

    const raw = await api.invoke(params).promise();
    const res = JSON.parse(raw.Payload);

    expect(res).to.not.be.empty();
    expect(res.statusCode).to.equal(200);
  });
});

describe.only('DeletePost', () => {
  const event1 = { body: {} };

  try {
    const data1 = fs.readFileSync('./test/events/delete/event1.json', 'utf8');
    event1.body = data1;
  } catch (err) {
    console.log(`Error reading file from disk: ${err}`);
  }

  it('Should delete post when given id', async function () {
    const params = {
      FunctionName: 'post-service-dev-deletePost',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event1),
    };

    const raw = await api.invoke(params).promise();
    const res = JSON.parse(raw.Payload);

    expect(res).to.be.empty();
    expect(res.statusCode).to.eq(200);
  });
});

describe('ListPost', () => {
  const event1 = { body: {} };

  try {
    const data1 = fs.readFileSync('./test/events/list/event1.json', 'utf8');
    event1.body = data1;
  } catch (err) {
    console.log(`Error reading file from disk: ${err}`);
  }

  it('Should list all posts', async function () {
    const params = {
      FunctionName: 'post-service-dev-listPosts',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(event1),
    };

    const raw = await api.invoke(params).promise();
    const res = JSON.parse(raw.Payload);

    expect(res).to.be.empty();
    expect(res.statusCode).to.eq(200);
  });
});

// describe('ListPost', () => {
//   const event1 = { body: {} };

//   try {
//     const data1 = fs.readFileSync('./test/events/list/event1.json', 'utf8');
//     event1.body = data1;
//   } catch (err) {
//     console.log(`Error reading file from disk: ${err}`);
//   }

//   it('Should list all posts', async function () {
//     const params = {
//       FunctionName: 'post-service-dev-listPosts',
//       InvocationType: 'RequestResponse',
//       Payload: JSON.stringify(event1),
//     };

//     const raw = await api.invoke(params).promise();
//     const res = JSON.parse(raw.Payload);

//     expect(res).to.be.empty();
//     expect(res.statusCode).to.eq(200);
//   });
// });