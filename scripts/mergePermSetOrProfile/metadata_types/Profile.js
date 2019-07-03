const AbstractMetadataType = require('./AbstractMetadataType');

module.exports = class Profile extends AbstractMetadataType {
  /**
   * Constructor
   * @param {Object} profile The content of the profile set as a JS Object
   */
  constructor(profile) {
    super(profile, 'Profile', [
      'applicationVisibilities',
      'categoryGroupVisibilities',
      'classAccesses',
      'customPermissions',
      'description',
      'externalDataSourceAccesses',
      'fieldPermissions',
      'label',
      'layoutAssignments',
      'loginHours',
      'loginIpRanges',
      'objectPermissions',
      'pageAccesses',
      'recordTypeVisibilities',
      'tabSettings',
      'userLicense',
      'userPermissions'
    ]);
  }
};
