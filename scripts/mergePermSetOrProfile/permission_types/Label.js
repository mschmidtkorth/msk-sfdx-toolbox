const StringValuePermission = require('./StringValuePermission');
/**
 * Label of the permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class Label extends StringValuePermission {
  constructor(permission) {
    super(permission, 'label');
  }
}
