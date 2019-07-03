const StringValuePermission = require('./StringValuePermission');

/**
 * UserLicense of this permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class UserLicense extends StringValuePermission {
  constructor(permission) {
    super(permission, 'userLicense');
  }
}
