const Redis = require('ioredis');
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = require('./constants');

const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

//key example "prefix*"
function getKeysByPattern(key) {
  return new Promise((resolve, reject) => {
    let stream = redis.scanStream({
      // only returns keys following the pattern of "key"
      match: key,
      // returns approximately 100 elements per call
      count: 100
    });

    let keys = [];
    stream.on('data', function (resultKeys) {
      // `resultKeys` is an array of strings representing key names
      for (let i = 0; i < resultKeys.length; i++) {
        keys.push(resultKeys[i]);
      }
    });
    stream.on('end', function () {
      resolve(keys);
    });
  })
}

//key example "prefix*"
function deleteKeysByPattern(key) {
  let stream = redis.scanStream({
    // only returns keys following the pattern of "key"
    match: key,
    // returns approximately 100 elements per call
    count: 100
  });

  let keys = [];
  stream.on('data', function (resultKeys) {
    // `resultKeys` is an array of strings representing key names
    for (let i = 0; i < resultKeys.length; i++) {
      keys.push(resultKeys[i]);
    }
  });
  stream.on('end', function () {
    console.log(keys);
    redis.unlink(keys);
  });
}

//key example "prefix*"
function batchDeletionKeysByPattern(key) {
  let stream = redis.scanStream({
    // only returns keys following the pattern of "key"
    match: key,
    // returns approximately 100 elements per call
    count: 100
  });

  stream.on('data', function (resultKeys) {
    if (resultKeys.length) {
      redis.unlink(resultKeys);
    }
  });
}

module.exports = {
  redis,
  getKeysByPattern,
  deleteKeysByPattern,
  batchDeletionKeysByPattern
};