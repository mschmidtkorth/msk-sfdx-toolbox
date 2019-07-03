const strategies = require('../permission_types');

/**
 * Factory that instantiate the proper class
 * extending the AbstractPermission
 */
module.exports = class PermissionFactory {
  /**
   * Returns a concrete instance of AbstractPermission
   * @param {String} type Type of permission. For a list of valid type
   * please refer to the "Field" column in the table at this official doc page
   * https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
   * @param {Object} permission Content of the permission
   */
  static getPermissionInstance(type, permission) {
    let res;

    switch (type) {
      case 'applicationVisibilities':
        res = new strategies.ApplicationVisibility(permission);
        break;
      case 'categoryGroupVisibilities':
        res = new strategies.CategoryGroupVisibilities(permission);
        break;
      case 'classAccesses':
        res = new strategies.ClassAccess(permission);
        break;
      case 'customPermissions':
        res = new strategies.CustomPermission(permission);
        break;
      case 'description':
        res = new strategies.Description(permission);
        break;
      case 'externalDataSourceAccesses':
        res = new strategies.ExternalDataSourceAccess(permission);
        break;
      case 'fieldPermissions':
      case 'fieldLevelSecurities': // only for Profile, deprecated in API 23
        res = new strategies.FieldPermission(permission);
        break;
      case 'hasActivationRequired':
        res = new strategies.HasActivationRequired(permission);
        break;
      case 'label':
        res = new strategies.Label(permission);
        break;
      case 'layoutAssignments':
        res = new strategies.LayoutAssignments(permission);
        break;
      case 'license':
        res = new strategies.License(permission);
        break;
      case 'loginHours':
        res = new strategies.LoginHours(permission);
        break;
      case 'loginIpRanges':
        res = new strategies.LoginIpRanges(permission);
        break;
      case 'objectPermissions':
        res = new strategies.ObjectPermission(permission);
        break;
      case 'pageAccesses':
        res = new strategies.PageAccess(permission);
        break;
      case 'profileActionOverrides': // only for Profile, deprecated in API 45
        res = new strategies.ProfileActionOverride(permission);
        break;
      case 'recordTypeVisibilities':
        res = new strategies.RecordTypeVisibility(permission);
        break;
      case 'tabSettings': // this is for Permission Set
      case 'tabVisibilities': // this is for Profile
        res = new strategies.TabSetting(permission);
        break;
      case 'userLicense':
        res = new strategies.UserLicense(permission);
        break;
      case 'userPermissions':
        res = new strategies.UserPermission(permission);
        break;
      default:
        throw new Error(`${type} is not supported`);
    }

    return res;
  }
}
