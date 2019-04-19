'use strict';

const _ = require('ramda-extend');

module.exports = function (app) {
  global._ = _;

  const taskToPromise = (value) => {
    value.afterRemote('**', async function (ctx) {
      console.log(2222, ctx.result);
      if(ctx.result && ctx.result instanceof _.Task) {
        console.log(333, ctx.result);
        ctx.result = await _.taskToPromise(ctx.result);
      }
    });
  };

  _.forEachObjIndexed(taskToPromise, app.models)
};
