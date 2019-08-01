'use strict';
const _ = require('ramda-extend');
const ic = require('../mixins/init-action');

module.exports = function(Sentence) {

  const hard = (q, uid) => {
    return Sentence.findOne({where: {key: q, uid: uid, type: "hard"}})
  };

  const sort = (q, uid) => {
    return Sentence.findOne({where: {key: {like: `%${q}%`}, uid: uid, type: "sort"}});
  };

  const add = _.curry((k, v, t, uid) => {
    return Sentence.create({key: k, value: v, uid: uid})
  });

  const find = (f) => {
    return Sentence.find(f);
  };

  const hardTask = _.compose(_.promiseToTask, hard);

  const sortTask = _.compose(_.promiseToTask, sort);

  const chain = _.curry((h, s) => {
    return h || s
  });

  Sentence.answer = async (q, uid) => {
    return _.liftA2(chain, hardTask(q, uid), sortTask(q, uid));
  };

  Sentence.add = async (k, v, t, options) => {
    return Sentence.create({key: k, value: v, uid: options.accessToken.userId})
  };

  Sentence.remoteMethod('add', {
    description: 'add',
    accessType: 'WRITE',
    accepts: [
      {arg: 'key', type: 'string', required: true},
      {arg: 'value', type: 'string', required: true},
      {arg: 't', type: 'string', description: "hard | sort"},
      {arg: 'options', type: 'object', http: 'optionsFromRequest'}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'post', path: '/add'},
  });
};
