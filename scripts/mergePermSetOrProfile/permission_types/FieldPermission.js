const AbstractPermission = require('./AbstractPermission');

/**
 * Represents a field permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class FieldPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, 'field', ['readable', 'editable']);
  }
}
