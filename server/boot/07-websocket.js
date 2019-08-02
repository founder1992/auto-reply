'use strict';
const socket = require('socket.io');

module.exports = function (app) {
  setTimeout(function () {
    const io = socket(app.server);

    app.io = io;
    app.publishIO = {};

    // app.publishIO.orderPayment = function (orderId) {
    //   debug(`Order ${orderId} progress published`);
    //   io.emit(`/order/${orderId}/payed`, {orderId, payed: true});
    // };


    app.publishIO.scanned = function () {
      console.log(`scan complete`);
      io.emit(`scanned`, {scanned: true});
    };
  }, 3 * 1000);
};
