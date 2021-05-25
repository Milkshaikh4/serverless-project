/* eslint-env mocha */

const mochaPlugin = require('serverless-mocha-plugin');
const dirtyChai = require('dirty-chai');
const fs = require('fs');
const { Lambda } = require('aws-sdk');

mochaPlugin.chai.use(dirtyChai);
const { expect } = mochaPlugin.chai;

describe('CreatePost', () => {
  const event1 = { body: {} };
  const event2 = { body: {} };

  const params1 = () => ({
    FunctionName: 'createPost',
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(event2),
  });

  const create = new Lambda({
    apiVersion: '2015-03-31',
    endpoint:
      'http://localhost:3000/2015-03-31/functions/createPost/invocations',
  });

  try {
    const data1 = fs.readFileSync('./test/events/event1.json', 'utf8');
    event1.body = data1;

    const data2 = fs.readFileSync('./test/events/event2.json', 'utf8');
    event2.body = data2;
  } catch (err) {
    console.log(`Error reading file from disk: ${err}`);
  }

  // eslint-disable-next-line arrow-body-style
  // eslint-disable-next-line prefer-arrow-callback
  it('it should create a post and return successful when given post request', async function () {
    const res = await create.invoke(params1()).promise();

    expect(res).to.not.be.empty();
    expect(res.statusCode).to.equal(200);
  });
});

// describe('DeletePost', () => {
//   const deletePost = mochaPlugin.getWrapper(
//     'post',
//     '/api/post.js',
//     'deletePost',
//   );

//   const event1 = { body: {} };

//   try {
//     const data1 = fs.readFileSync('./test/events/delete-event.json', 'utf8');
//     event1.body = data1;
//   } catch (err) {
//     console.log(`Error reading file from disk: ${err}`);
//   }

//   it('Should delete post when given id', () => {
//     deletePost.run(event1).then((response) => {
//       expect(response).to.be.empty();
//       expect(response.statusCode).to.eq(200);
//     });
//   });
// });
