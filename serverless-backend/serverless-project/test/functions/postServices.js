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
  endpoint: 'http://localhost:3002',
});

describe.only('Test API functions', () => {
  const event1 = {
    body: JSON.stringify({
      descr: 'This is a cute photo :)',
      img: '/9j/4AAQSkZJRgABAQAAAQABAAD/4gxYSUNDX1BST0ZJTEUAAQ…DTsLREixkgcEUiHJEghLdaslSJltwAee1TYBygJ0WkReR/9k=',
    }),
  };
  const posts = [];
  const deleteEvent = (id) => ({
    pathParameters: {
      id,
    },
  });

  for (let i = 0; i < 5; i++) {
    it('should create a post and return successful when given post request', async function () {
      const params = {
        FunctionName: 'post-service-dev-createPost',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(event1),
      };

      const raw = await api.invoke(params).promise();
      const res = JSON.parse(raw.Payload);

      const body = JSON.parse(res.body);

      posts.push(body.post.id);

      expect(body).to.haveOwnProperty('message', 'Successfully created post');
      expect(body).to.not.be.empty();
      expect(res.statusCode).to.equal(200);
      expect(posts.includes(body.post.id));
      expect(body.post.createdAt).to.be.a('number');
      expect(body.post.createdAt === body.post.updatedAt);
    });
  }

  it('Should list all posts', async function () {
    const params = {
      FunctionName: 'post-service-dev-listPosts',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({}),
    };

    const raw = await api.invoke(params).promise();
    const res = JSON.parse(raw.Payload);
    const body = JSON.parse(res.body);

    expect(body.posts.Count === 5);
    expect(res).to.not.be.empty();
    expect(res.statusCode).to.eq(200);
  });

  posts.forEach((id) => {
    it('should delete post when given id', async function () {
      const params = {
        FunctionName: 'post-service-dev-deletePost',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(deleteEvent(id)),
      };

      const raw = await api.invoke(params).promise();
      const res = JSON.parse(raw.Payload);

      expect(res).to.be.empty();
    });
  });

  it('Should list no posts', async function () {
    const params = {
      FunctionName: 'post-service-dev-listPosts',
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({}),
    };

    const raw = await api.invoke(params).promise();
    const res = JSON.parse(raw.Payload);
    const body = JSON.parse(res.body);

    expect(body.posts.Count === 0);
    expect(res).to.not.be.empty();
    expect(res.statusCode).to.eq(200);
  });
});

describe('UpdatePost', () => {
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
