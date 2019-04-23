'use strict';

const _ = require('ramda-extend');

module.exports = function (app) {
  global._ = _;

  const taskToPromise = (value) => {
    value.afterRemote('**', async function (ctx, next) {
      if(ctx.result && ctx.result instanceof _.Task) {
        ctx.result = await _.taskToPromise(ctx.result);
      }
    });
  };

  _.forEachObjIndexed(taskToPromise, app.models)
};
