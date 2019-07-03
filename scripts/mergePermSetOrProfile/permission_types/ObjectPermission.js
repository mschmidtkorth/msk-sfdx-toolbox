const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a custom object permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class ObjectPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, 'object', [
      'allowCreate',
      'allowDelete',
      'allowEdit',
      'allowRead',
      'modifyAllRecords',
      'viewAllRecords'
    ]);
  }
}
