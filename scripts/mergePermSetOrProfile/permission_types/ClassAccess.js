const AbstractPermission = require('./AbstractPermission');

/**
 * Represents a class access permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class ClassAccess extends AbstractPermission {
    constructor(permission) {
      super(permission, "apexClass", ["enabled"]);
    }
  }