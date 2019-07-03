const AbstractPermission = require('./AbstractPermission');
/**
 * Represents a tab setting permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class TabSetting extends AbstractPermission {
  constructor(permission) {
    super(permission, 'tab', ['visibility']);
  }
}
