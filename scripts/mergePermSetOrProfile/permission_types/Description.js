const StringValuePermission = require('./StringValuePermission');
/**
 * Description of the permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class Description extends StringValuePermission {
  constructor(permission) {
    super(permission, 'description');
  }
}
