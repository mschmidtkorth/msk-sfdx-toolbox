const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a record type visibility permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class RecordTypeVisibility extends AbstractPermission {
  constructor(permission) {
    super(permission, 'recordType', ['visible']);
  }
}
