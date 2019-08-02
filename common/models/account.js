'use strict';
const g = require('strong-globalize')();
const _ = require('ramda-extend');
const ic = require('../mixins/init-action');
const debug = require('debug')('AR:Account');

module.exports = function (Account) {
  Account.login = function (credentials, include) {
    return this._doLogin(credentials, include, {enabled: {neq: false}});
  };

  Account._doLogin = function (credentials, include, where) {
    include = (include || '');
    if (Array.isArray(include)) {
      include = include.map((val) => {
        return val.toLowerCase();
      });
    } else {
      include = include.toLowerCase();
    }
    let realmDelimiter;
    const realmRequired = Boolean(this.settings.realmRequired || this.settings.realmDelimiter);
    if (realmRequired) {
      realmDelimiter = this.settings.realmDelimiter;
    }

    let query = this.normalizeCredentials(credentials, realmRequired, realmDelimiter);

    if (realmRequired && !query.realm) {
      const err1 = new Error(g.f('{{realm}} is required'));
      err1.statusCode = 400;
      err1.code = 'REALM_REQUIRED';
      throw err1;
    }
    if (!query.or && !query.mobile && !query.email && !query.username) {
      const err2 = new Error(g.f('{{username}} or {{email}} is required'));
      err2.statusCode = 400;
      err2.code = 'USERNAME_EMAIL_REQUIRED';
      throw err2;
    }

    if (where) {
      query = {and: [query, where]};
    }

    function tokenHandler(token) {
      if (Array.isArray(include) ? include.indexOf('user') !== -1 : include === 'user') {
        token.__data.user = user;
      }
      return token;
    }

    return this.findOne({where: query}).then(user => {
      const defaultError = new Error(g.f('login failed'));
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      if (user) {
        return user.hasPassword(credentials.password).then(isMatch => {
          if (isMatch) {
            if (user.createAccessToken.length === 2) {
              return user.createAccessToken(credentials.ttl).then(token => tokenHandler(token, user, include));
            } else {
              return user.createAccessToken(credentials.ttl, credentials).then(token => tokenHandler(token, user, include));
            }
          } else {
            debug('The password is invalid for user %s', query.email || query.username);
            throw defaultError;
          }
        });
      } else {
        debug('No matching record is found for user %s', query.email || query.username);
        throw defaultError;
      }
    });
  };

  Account.me = (options) => {
    return Account.findOne({
      where: {id: options.accessToken.userId}
    });
  };

  Account.getQrCode = async (options) => {
    let qrcode = await Account.app.getQrCode(options.accessToken.userId);
    Account.app.startCheckLogin();
    return qrcode
  };

  Account.start = (options) => {
    return Account.app.startListen(options.accessToken.userId)
  };

  Account.stop = (options) => {
    return Account.app.clearTimeout(options.accessToken.userId + "-listener")
  };

  Account.remoteMethod(
    'login',
    {
      description: '用户登录',
      accepts: [
        {arg: 'credentials', type: 'object', required: true, http: {source: 'body'}},
        {
          arg: 'include', type: ['string'], http: {source: 'query'},
          description: 'Related objects to include in the response. ' +
          'See the description of return value for more details.'
        },
      ],
      returns: {
        arg: 'accessToken', type: 'object', root: true
      },
      http: {verb: 'post', path: '/login'},
    }
  );

  Account.remoteMethod('getQrCode', {
    description: '获取登陆二维码',
    accessType: 'READ',
    accepts: [{arg: 'options', type: 'object', http: 'optionsFromRequest'}],
    returns: {arg: 'data', type: 'string', root: true},
    http: {verb: 'get', path: '/qrCode'},
  });

  Account.remoteMethod('start', {
    description: '开始监听',
    accessType: 'READ',
    accepts: [{arg: 'options', type: 'object', http: 'optionsFromRequest'}],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/start'},
  });

  Account.remoteMethod('stop', {
    description: '停止监听',
    accessType: 'READ',
    accepts: [{arg: 'options', type: 'object', http: 'optionsFromRequest'}],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/stop'},
  });

  Account.remoteMethod('me', {
    description: '我的信息',
    accessType: 'READ',
    accepts: [{arg: 'options', type: 'object', http: 'optionsFromRequest'}],
    returns: {arg: 'data', type: 'object', root: true},
    http: {verb: 'get', path: '/me'},
  });
};
