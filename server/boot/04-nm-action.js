'use strict';
const debug = require('debug')("twiker:login");
const moment = require("moment");
const fs = require('fs');
const request = require('request');

module.exports = function (app) {
  var makeFile, download, answer, sendMessage;

  app.startListen = async function (userId) {
    app[`${userId}-listener`] = setInterval(() => {
      app.nightmare
        .exists('.web_wechat_reddot_middle')
        .then(v => {
          if (v)
            app.nightmare
              .click('.web_wechat_reddot_middle')
              .evaluate((key) => {
                return document.querySelectorAll(key)
              }, ".js_message_plain.ng-binding")
              .then(async (text) => {
                await judgeAndSend(userId, text)
              });
          else
            app.nightmare
              .evaluate((key) => {
                return document.querySelectorAll(key)
              }, ".js_message_plain.ng-binding")
              .then(async (text) => {
                await judgeAndSend(userId, text)
              });
        })
    }, 10000);
  };

  async function judgeAndSend(userId, nodeLists) {
    // msgArr: wechat message list;
    // result: answer from message;
    // chatStock: message list in redis(not complete)
    // value: send success and callback
    let msgArr, result, chatStock, value;
    msgArr = Array.prototype.map.call(nodeLists, (v) => {return v.innerText});
    chatStock = await app.kvs.chatStock.get(`${userId}-chat`);

    if (_.last(msgArr) !== _.last(chatStock)) {
      result = await answer(_.last(msgArr), userId);
      value = await sendMessage(userId, result && result.value);
      return await app.kvs.chatStock.set(`${userId}-chat`, chatStock.push(value));
    }

    return false
  }

  sendMessage = function (userId, value) {
    return new Promise(function (resolve, reject) {
      app.nightmare
        .type('#editArea', value)
        .click('.btn_send')
        .then(async () => {
          resolve(value)
        })
        .catch((error) => {
          debug('Failed:', error);
          reject(error)
        })
    })
  };

  makeFile = function (filename) {
    return `${app.get("domain")}/images/${filename}`
  };

  download = _.curry((filename, uri) => {
    return new _.Task((reject, resolve) => {
        request
          .get(uri)
          .on('error', function(err) {
            reject(err)
          })
          .pipe(fs.createWriteStream(`${process.cwd()}/qrCode/${filename}`))
          .on('close', (err, d) => {
            if (err) reject(err);
            else resolve(d || filename)
          });
      }
    )
  });

  answer = _.compose(_.taskToPromise, app.models.Sentence.answer);

  app.downloadByUrl = _.compose(_.chain(_.compose(_.Task.of, makeFile)), download);
};
