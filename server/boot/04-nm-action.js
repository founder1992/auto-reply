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
              .evaluate(function (key) {
                var mynodeLists = document.querySelectorAll(key);
                return Array.prototype.map.call(mynodeLists, (v) => {return v.innerText});
              }, ".js_message_plain.ng-binding")
              .then(async (text) => {
                await judgeAndSend(userId, text)
              });
          else
            app.nightmare
              .evaluate(function(key) {
                var mynodeLists = document.querySelectorAll(key);
                return Array.prototype.map.call(mynodeLists, (v) => {return v.innerText});
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
    msgArr = nodeLists;
    chatStock = await app.kvs.chatStock.get(`${userId}-chat`);
    chatStock = chatStock instanceof Array ? chatStock : [];
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

  download = (filename, uri) => {
    return new Promise((reject, resolve) => {
      resolve(uri)
        // request
        //   .get(uri)
        //   .on('error', function(err) {
        //     reject(err)
        //   })
        //   .pipe(fs.createWriteStream(`${process.cwd()}/qrCode/${filename}`))
        //   .on('close', (err, d) => {
        //     if (err) reject(err);
        //     else resolve(makeFile(d || filename))
        //   });
      }
    )
  };

  answer = _.compose(_.taskToPromise, app.models.Sentence.answer);

  app.downloadByUrl = download;

  app.startCheckLogin = () => {
    app.checkingLogin = setInterval(() => {
      app.nightmare
        .wait('.action')
        .evaluate(function () {
          return document.querySelector('.avatar').classList[1];
        })
        .then(async (result) => {
          if (result === "show") {
            console.log("yes");
            app.publishIO.scanned();
            clearInterval(app.checkingLogin);
          }
        })
    }, 1000)
  }
};
