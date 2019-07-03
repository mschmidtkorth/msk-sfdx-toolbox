const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a page access permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class PageAccess extends AbstractPermission {
  constructor(permission) {
    super(permission, 'apexPage', ['enabled']);
  }
}
