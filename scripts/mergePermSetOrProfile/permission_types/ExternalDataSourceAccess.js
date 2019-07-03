const AbstractPermission = require('./AbstractPermission');

/**
 * Represents an external data source permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
module.exports = class ExternalDataSourceAccess extends AbstractPermission {
  constructor(permission) {
    super(permission, 'externalDataSource', ['enabled']);
  }
}
