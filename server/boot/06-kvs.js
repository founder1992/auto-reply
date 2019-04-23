'use strict';

const kvs = require('kvs');

module.exports = async function (app) {
  const config = app.get('kvs');
  const redisStore = new kvs.store(config.adapter, {db: config.db, host: config.host, password: config.password});
  const chatStock = await redisStore.createBucket('chatStock', {ttl: 30000/*seconds*/});

  app.kvs = {
    chatStock
  };
};
