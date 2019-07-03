const AbstractPermission = require('./AbstractPermission');

/**
 * Represents an application visibility permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class ApplicationVisibility extends AbstractPermission {
  constructor(permission) {
    super(permission, 'application', ['visible']);
  }
}
