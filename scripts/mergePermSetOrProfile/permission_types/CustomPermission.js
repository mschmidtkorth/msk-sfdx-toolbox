const AbstractPermission = require('./AbstractPermission');

/**
 * Represents a custom user permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class CustomPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, 'name', ['enabled']);
  }
}
