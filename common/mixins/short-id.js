const PromiseA = require('bluebird');
const shortid = require('shortid');

module.exports = function (Model, options) {
  options = options || {};
  const idName = options.id || Model.definition.idName();

  Model.observe('before save', (ctx) => {
    if (ctx.instance && !ctx.instance[idName]) {
      // debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt, ctx.instance.id);
      ctx.instance[idName] = id();
    }

    if (ctx.instance) {
      let values = Model.autoValues && Model.autoValues(ctx.instance);
      if (values) {
        let keys = Object.keys(values);
        keys.map(key => {
          ctx.instance[key] = values[key];
        })
      }
    }

    return PromiseA.resolve();
  });
};

function id() {
  return shortid.generate();
}
