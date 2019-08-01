'use strict';

const _ = require('ramda-extend');

module.exports = {
  idFromOp: _.compose(_.map(_.prop('userId')), _.map(_.prop('accessToken')), _.Maybe.of),
};
