/* eslint-disable no-console */
const middy = require('@middy/core');
const cors = require('@middy/http-cors');
const httpErrorHandler = require('@middy/http-error-handler');

const uuid = require('uuid');
const AWS = require('aws-sdk');

if (process.env.IS_LOCAL) {
  const credentials = new AWS.SharedIniFileCredentials({ profile: 'personal' });
  AWS.config.credentials = credentials;
}

AWS.config.update({ region: 'ap-southeast-2' });
AWS.config.setPromisesDependency(require('bluebird'));

const clientOptions = (process.env.IS_LOCAL
  ? {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY',
    secretAccessKey: 'DEFAULT_SECRET',
  }
  : {});

const db = new AWS.DynamoDB.DocumentClient(clientOptions);

const create = middy((event) => {
  const { descr, img } = JSON.parse(event.body);

  if (typeof descr !== 'string' || typeof img !== 'string') {
    throw new Error("Couldn't submit post because of validation errors.");
  }

  return submitPost(post(descr, img));
});

create.use(httpErrorHandler()).use(cors());

const list = middy(() => {
  const params = {
    TableName: process.env.POST_TABLE,
  };

  console.log({
    message: 'getting posts from db',
    params,
  });

  const onScan = (err, data) => {
    if (err) {
      console.log({
        message: 'Error in getting posts',
        err,
      });
      return err;
    }

    return data.Items;
  };

  return db
    .scan(params, onScan)
    .promise()
    .then((posts) => success({ posts }));
});

list.use(httpErrorHandler()).use(cors());

const deletePost = middy((event) => {
  const { id = null } = event.pathParameters;

  if (id === null) {
    console.error('id is undefined');
    return new Error('id is undefined');
  }

  const params = {
    TableName: process.env.POST_TABLE,
    Key: {
      id,
    },
  };

  console.log({
    msg: 'deleting item',
    params,
  });

  const handleHook = (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  };

  return db.delete(params, handleHook).promise();
});

deletePost.use(httpErrorHandler()).use(cors());

const success = (body) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...body,
  }),
});

const submitPost = (post) => {
  const payload = {
    TableName: process.env.POST_TABLE,
    Item: post,
  };

  console.log({
    message: 'pushing post to db',
    payload,
  });

  return db
    .put(payload)
    .promise()
    .then(() => success({ message: 'Successfully created post', post }));
};

const post = (descr, img) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    descr,
    img,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

module.exports = { create, list, deletePost };
