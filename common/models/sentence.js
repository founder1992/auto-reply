'use strict';
const _ = require('ramda-extend');

module.exports = function(Sentence) {

  const hard = (q, uid) => {
    return Sentence.findOne({where: {key: q, uid: uid, type: "hard"}})
  };

  const sort = (q, uid) => {
    return Sentence.findOne({where: {key: {like: `%${q}%`}, uid: uid, type: "sort"}});
  };

  const hardTask = _.compose(_.promiseToTask, hard);

  const sortTask = _.compose(_.promiseToTask, sort);

  const chain = _.curry((h, s) => {
    return h || s
  });

  Sentence.answer = (q, uid) => {
    return _.liftA2(chain, hardTask(q, uid), sortTask(q, uid));
  };

  Sentence.remoteMethod('answer', {
    description: 'answer',
    accessType: 'READ',
    accepts: [
      {arg: 'q', type: 'string', required: true},
      {arg: 'uid', type: 'string', required: true}
    ],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/answer'},
  });
};
