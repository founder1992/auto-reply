'use strict';

const _ = require('lodash');
const PromiseA = require('bluebird');

module.exports = function (app, done) {
  const dataSources = _(app.datasources).values().uniq().value();

  PromiseA.each(dataSources, ds => ds.autoupdate && ds.autoupdate()).then(async () => {
    // await initFixtures(app);
    return
  }).asCallback(done);
};

async function initFixtures(app) {
  const {Account, Role, RoleMapping} = app.models;
  return PromiseA.all([
    PromiseA.fromCallback(cb => Role.upsertWithWhere({name: 'admin'}, {name: 'admin', description: '系统管理员'}, cb)),
    PromiseA.fromCallback(cb => Account.upsertWithWhere({username: 'admin'}, {
      "username": "admin",
      "password": "autoreply"
    }, cb))
  ]).then(async ([adminRole, adminUser]) => {
    app.roleAdmin = adminRole;
    let roleMapping = await RoleMapping.findOne({
      where: {
        principalType: app.models.RoleMapping.USER,
        principalId: adminUser.id,
        roleId: adminRole.id
      }
    });
    if (!roleMapping)
      await adminRole.principals.create({principalType: RoleMapping.USER, principalId: adminUser.id});

    return;
  });
}
