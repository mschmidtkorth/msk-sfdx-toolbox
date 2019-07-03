const AbstractPermission = require('./AbstractPermission');

/**
 * Represents a Page Layout assignment on a Profile
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm
 */
module.exports = class LayoutAssignments extends AbstractPermission {
  constructor(permission) {
    super(permission, 'recordType', ['layout']);
  }

  /**
   * recordType property might not be there.
   * In that case as Id we take the object name from the layout
   */
  getId() {
    if (this.hasProperty(this.idProperty)) {
      return super.getId();
    }

    return this.getObjectNameFromLayout();
  }

  /**
   * Returns the object name this layout is related to.
   */
  getObjectNameFromLayout() {
    return this.getProperty('layout').split('-')[0];
  }
}
