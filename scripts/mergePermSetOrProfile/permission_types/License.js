const StringValuePermission = require('./StringValuePermission');
/**
 * License for this permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class License extends StringValuePermission {
  constructor(permission) {
    super(permission, 'license');
  }
}
