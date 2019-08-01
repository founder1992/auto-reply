'use strict';

const _ = require('ramda-extend');
const loopback = require('loopback');

module.exports = function (app) {
  global._ = _;

  const taskToPromise = (value) => {
    value.afterRemote('**', async function (ctx, next) {
      if(ctx.result && ctx.result instanceof _.Task) {
        ctx.result = await _.taskToPromise(ctx.result);
      }
    });
  };

  _.forEachObjIndexed(taskToPromise, app.models);


  app.use(loopback.token({
    cookies: ['access_token'],
    headers: ['access_token', 'X-Access-Token'],
    params:  ['access_token']
  }));
};
