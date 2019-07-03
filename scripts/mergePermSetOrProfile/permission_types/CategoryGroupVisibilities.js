const AbstractPermission = require('./AbstractPermission');

/**
 * Represents a Category visibility on a Profile
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm
 */
module.exports = class CategoryGroupVisibilities extends AbstractPermission {
  constructor(permission) {
    super(permission, 'dataCategoryGroup', ['visibility', 'dataCategories']);
  }
}
