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
      'fieldLevelSecurities', // deprecated in API 23
      'label',
      'layoutAssignments',
      'loginHours',
      'loginIpRanges',
      'objectPermissions',
      'pageAccesses',
      'profileActionOverrides', // deprecated in API 45
      'recordTypeVisibilities',
      'tabVisibilities',
      'userLicense',
      'userPermissions'
    ]);
  }
};
