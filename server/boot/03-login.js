'use strict';
const Nightmare = require('nightmare');
require('nightmare-iframe-manager')(Nightmare);
const debug = require('debug')("twiker:login");
const moment = require("moment");
// const robot = require("robotjs");

Nightmare.action('hide',
  function(name, options, parent, win, renderer, done) {
    parent.respondTo('hide', function(done) {
      win.hide();
      done();
    });
    done();
  },
  function(done) {
    this.child.call('hide', done);
  });

Nightmare.action('show',
  function(name, options, parent, win, renderer, done) {
    parent.respondTo('show', function(done) {
      win.show();
      done();
    });
    done();
  },
  function(done) {
    this.child.call('show', done);
  });


module.exports = function (app) {
  app.Logining = false;

  app.sleep = function (time) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve('ok');
      }, time);
    })
  };

  let nightmare = app.nightmare = Nightmare({
    show: false,
    waitTimeout: 2 * 60 * 60 * 1000,
    webPreferences: {
      webSecurity: false,
      partition: 'persist: testing'
    }
  });

  nightmare.app = app;

  app.getQrCode = function (userId) {
    return new Promise(function (reject, resolve) {
      nightmare
        .useragent('chrome')
        .goto(app.get('webWechat').url)
        .exists('.qrcode,.hide')
        .then(v => {
          if (v) {
            nightmare
              .click('.button_default')
              .wait(1000)
              .wait('.qrcode')
              .evaluate(function () {
                return document.querySelector('.img').src;
              })
              .then(async (result) => {
                let path = await app.downloadByUrl(`${userId}${moment().format("YYYYMMDDmmss")}.png`, result);
                resolve(path)
              })
              .catch((error) => {
                debug('Failed:', error);
                reject(error)
              })
          } else {
            nightmare
              .evaluate(function () {
                return document.querySelector('.img').src;
              })
              .then(async (result) => {
                let path = await app.downloadByUrl(`${userId}${moment().format("YYYYMMDDmmss")}.png`, result);
                resolve(path)
              })
              .catch((error) => {
                debug('Failed:', error);
                reject(error)
              })
          }
        })
    });
  };

  //
  // nightmare
  //   .useragent('chrome')
  //   .goto("https://react.docschina.org/docs/introducing-jsx.html")
  //   .exists('.css-plpslk')
  //   .then((ans) => {
  //     console.log(ans)
  //   })
    // .evaluate((key) => {
    //   return document.querySelector(key).innerText
    // }, ".token,.keyword")
    // .then((text) => {
    //   console.log(333, text, app.nightmare);
    //   nightmare
    //     .goto("http://es6.ruanyifeng.com/#docs/generator")
    //     .evaluate((key) => {
    //       return document.querySelector(key).innerText
    //     }, ".token,.keyword")
    //     .then((aaa) => {console.log(7777, aaa)})
    // })

};
