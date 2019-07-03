const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a user permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class UserPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, 'name', ['enabled']);
  }
}
