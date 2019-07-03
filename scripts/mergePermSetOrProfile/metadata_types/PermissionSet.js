const AbstractMetadataType = require('./AbstractMetadataType');

/**
 * Describes a whole permission set
 */
module.exports = class PermissionSet extends AbstractMetadataType {
  /**
   * Constructor
   * @param {Object} permissionSet The content of the permission set as a JS Object
   */
  constructor(permissionSet) {
    super(permissionSet, 'PermissionSet', [
      'applicationVisibilities',
      'classAccesses',
      'customPermissions',
      'description',
      'externalDataSourceAccesses',
      'fieldPermissions',
      'hasActivationRequired',
      'label',
      'license',
      'objectPermissions',
      'pageAccesses',
      'recordTypeVisibilities',
      'tabSettings',
      'userLicense',
      'userPermissions'
    ]);
  }
};
