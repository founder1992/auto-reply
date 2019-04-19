'use strict';
const debug = require('debug')("twiker:login");
const moment = require("moment");
const fs = require('fs');
const request = require('request');

module.exports = function (app) {
  app.clearTimeout = function (key) {
    clearTimeout(app[key]);
    return key
  }
};
