const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a Profile Action Override
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm
 */
module.exports = class ProfileActionOverride extends AbstractPermission {
  constructor(permission) {
    super(permission, 'actionName', [
      'comment',
      'content',
      'formFactor',
      'skipRecordTypeSelect',
      'type'
    ]);
  }
}
