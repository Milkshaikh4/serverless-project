"use strict";

const uuid = require("uuid");
const AWS = require("aws-sdk");

AWS.config.setPromisesDependency(require("bluebird"));

const db = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  const { descr, img } = JSON.parse(event.body);

  if (typeof descr !== "string" || typeof img !== "string") {
    console.error("Validation Failed");
    callback(
      new Error("Couldn't submit candidate because of validation errors.")
    );
    return;
  }

  const success = (id) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully created post",
        id,
      }),
    };
  };

  const error = (error) => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Unable to create post`,
        error
      }),
    };
  };

  submitPost(post(descr, img))
    .then((res) => callback(null, success(res.id)))
    .catch((err) => callback(null, error(err)));
};

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.CANDIDATE_TABLE,
    ProjectionExpression: "descr, img",
  };

  console.log("Scanning Candidate table.");

  const onScan = (err, data) => {
    if (err) {
      console.log(
        "Scan failed to load data. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      callback(err);
      return;
    }
    
    console.log("Scan succeeded.");
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        posts: data.Items,
      }),
    });
  };

  db.scan(params, onScan);
};

const submitPost = (post) => {
  console.log("Creating post");
  const payload = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: post,
  };

  return db
    .put(payload)
    .promise()
    .then((res) => post);
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
