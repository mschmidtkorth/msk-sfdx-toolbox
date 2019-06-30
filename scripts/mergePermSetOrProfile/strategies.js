/**
 * Contains strategies to merge all different kind of permissions
 * contained inside the different properties of a permission set or profile.
 */

/**
 * Represents a permission.
 * Exposes general methods to manipulate the permission.
 */
class AbstractPermission {
  /**
   * Constructor
   * @param {Object} permission Permission
   * @param {String} idProperty Specifies the property that identifies this permission
   * @param {Array} mergeProperties Contains the property of this permission that need to be merged
   */
  constructor(permission, idProperty, mergeProperties) {
    this.permission = permission;
    this.idProperty = idProperty;
    this.mergeProperties = mergeProperties;
  }

  /**
   * Returns the identifier for this permission
   */
  getId() {
    return this.getProperty(this.idProperty);
  }

  /**
   * Returns true if both permissions have the same identifier
   * @param {AbstractPermission} otherPermission Permission to compare to
   */
  equals(otherPermission) {
    return this.getId() == otherPermission.getId();
  }

  /**
   * Merges the content of other permission into the current one.
   * Returns true in case there were merge conflicts, false otherwise.
   * @param {AbstractPermission} otherPermission Permission to merge
   */
  merge(otherPermission) {
    // checks that both permissions refer to same component
    if (this.getId() !== otherPermission.getId()) {
      throw new Error(
        "You can only merge permission referring to same component"
      );
    }

    let conflicts = false;

    for (let i = 0; i < this.mergeProperties.length; i++) {
      let prop = this.mergeProperties[i];

      let current = this.getProperty(prop);
      let other = otherPermission.getProperty(prop);

      if (current !== other) {
        conflicts = true;
        this.setProperty(prop, this.buildConflictString(current, other));
      }
    }

    return conflicts;
  }

  /**
   * Compares current permission identifier with the other.
   * Returns
   *    -1 if current permission identifier comes before the other
   *    1 if current permission identifier comes after the other
   *    0 if both identifiers are the same
   * @param {AbstractPermission} otherPermission Permission to compare to
   */
  compareTo(otherPermission) {
    let res = 0;

    if (this.getId() < otherPermission.getId()) {
      res = -1;
    } else if (this.getId() > otherPermission.getId()) {
      res = 1;
    }

    return res;
  }

  /**
   * Set a property's value for this permission
   * @param {String} propName Property id
   * @param {Object} value Proeprty's value
   */
  setProperty(propName, value) {
    if (!this.hasProperty(propName)) {
      this.permission[propName] = [].concat(null);
    }
    this.permission[propName][0] = value;
  }

  /**
   * Returns the content of the specified property in the current
   * permission
   * @param {String} propName Property id
   */
  getProperty(propName) {
    if (!this.hasProperty(propName)) {
      return null;
    }
    return this.permission[propName][0];
  }

  /**
   * Returns true if permission contains the specified property, false otherwise
   * @param {String} propName Property id
   */
  hasProperty(propName) {
    return !!this.permission[propName];
  }

  /**
   * Returns the content of this permission
   */
  getPermission() {
    return this.permission;
  }

  /**
   * Build the conflict string to place inside the conflicting permission
   * @param {String} current current value
   * @param {String} other other value
   */
  buildConflictString(current, other) {
    return `\n----- CURRENT\n${current}\n===== OTHER\n${other}\n-----\n`;
  }
}

/**
 * Represents a permission that doesn't contains any property but
 * just a string value.
 * These type of permissions have a slightly different logic when it comes
 * to identifier and merge logic
 */
class StringValuePermission extends AbstractPermission {
  /**
   * Return the name of the permission itself
   */
  getId() {
    return this.idProperty;
  }

  /**
   * Merge the content of the current permission with the other
   * @param {StringValuePermission} otherPermission Source permission to merge
   */
  merge(otherPermission) {
    // checks that both permissions refer to same component
    if (this.getId() !== otherPermission.getId()) {
      throw new Error(
        "You can only merge permission referring to same component"
      );
    }

    let conflicts = false;

    // in this case permission variable it's a string instead of an object
    if (this.permission !== otherPermission.permission) {
      this.permission = this.buildConflictString(
        this.permission,
        otherPermission.permission
      );
      conflicts = true;
    }

    return conflicts;
  }
}

class CategoryGroupVisibilities extends AbstractPermission {
  constructor(permission) {
    super(permission, "dataCategoryGroup", ["visibility", "dataCategories"]);
  }
}

class LayoutAssignments extends AbstractPermission {
  constructor(permission) {
    super(permission, "recordType", ["layout"]);
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
    return this.getProperty("layout").split("-")[0];
  }
}

class LoginHours extends AbstractPermission {
  getId() {
    return this.idProperty; // there can be only one entry in a profile
  }

  constructor(permission) {
    super(permission, "loginHours", [
      "fridayEnd",
      "fridayStart",
      "mondayEnd",
      "mondayStart",
      "saturdayEnd",
      "saturdayStart",
      "sundayEnd",
      "sundayStart",
      "thursdayEnd",
      "thursdayStart",
      "tuesdayEnd",
      "tuesdayStart",
      "wednesdayEnd",
      "wednesdayStart"
    ]);
  }

  /**
   * Merges the content of login hours.
   * Returns true in case there were merge conflicts, false otherwise.
   * @param {AbstractPermission} otherPermission Permission to merge
   */
  merge(otherPermission) {
    // checks that both permissions refer to same component
    if (this.getId() !== otherPermission.getId()) {
      throw new Error(
        "You can only merge permission referring to same component"
      );
    }

    let conflicts = false;

    for (let i = 0; i < this.mergeProperties.length; i++) {
      let prop = this.mergeProperties[i];

      if (!this.hasProperty(prop) && otherPermission.hasProperty(prop)) {
        // just add it
        this.setProperty(prop, otherPermission.getProperty(prop));
      } else if (this.hasProperty(prop) && otherPermission.hasProperty(prop)) {
        // merge logic
        let current = this.getProperty(prop);
        let other = otherPermission.getProperty(prop);

        if (current !== other) {
          conflicts = true;

          this.setProperty(prop, this.buildConflictString(current, other));
        }
      }
    }

    return conflicts;
  }
}

class LoginIpRanges extends AbstractPermission {
  constructor(permission) {
    super(permission, "startAddress", ["description", "endAddress"]);
  }
}

/**
 * Represents a class access permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class ClassAccess extends AbstractPermission {
  constructor(permission) {
    super(permission, "apexClass", ["enabled"]);
  }
}

/**
 * Represents an application visibility permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class ApplicationVisibility extends AbstractPermission {
  constructor(permission) {
    super(permission, "application", ["visible"]);
  }
}

/**
 * Represents a custom user permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class CustomPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, "name", ["enabled"]);
  }
}

/**
 * Description of the permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class Description extends StringValuePermission {
  constructor(permission) {
    super(permission, "description");
  }
}

/**
 * Represents an external data source permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class ExternalDataSourceAccess extends AbstractPermission {
  constructor(permission) {
    super(permission, "externalDataSource", ["enabled"]);
  }
}

/**
 * Represents a field permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class FieldPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, "field", ["readable", "editable"]);
  }
}

/**
 * HasActivationRequired property of the permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class HasActivationRequired extends StringValuePermission {
  constructor(permission) {
    super(permission, "hasActivationRequired");
  }
}

/**
 * Label of the permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class Label extends StringValuePermission {
  constructor(permission) {
    super(permission, "label");
  }
}

/**
 * License for this permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class License extends StringValuePermission {
  constructor(permission) {
    super(permission, "license");
  }
}

/**
 * Represents a custom object permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class ObjectPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, "object", [
      "allowCreate",
      "allowDelete",
      "allowEdit",
      "allowRead",
      "modifyAllRecords",
      "viewAllRecords"
    ]);
  }
}

/**
 * Represents a page access permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class PageAccess extends AbstractPermission {
  constructor(permission) {
    super(permission, "apexPage", ["enabled"]);
  }
}

/**
 * Represents a record type visibility permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class RecordTypeVisibility extends AbstractPermission {
  constructor(permission) {
    super(permission, "recordType", ["visible"]);
  }
}

/**
 * Represents a tab setting permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class TabSetting extends AbstractPermission {
  constructor(permission) {
    super(permission, "tab", ["visibility"]);
  }
}

/**
 * UserLicense of this permission set
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class UserLicense extends StringValuePermission {
  constructor(permission) {
    super(permission, "userLicense");
  }
}

/**
 * Represents a user permission.
 * Reference https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
 */
class UserPermission extends AbstractPermission {
  constructor(permission) {
    super(permission, "name", ["enabled"]);
  }
}

/**
 * Factory that instantiate the proper class
 * extending the AbstractPermission
 */
class Factory {
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
      case "applicationVisibilities":
        res = new ApplicationVisibility(permission);
        break;
      case "categoryGroupVisibilities":
        res = new CategoryGroupVisibilities(permission);
        break;
      case "classAccesses":
        res = new ClassAccess(permission);
        break;
      case "customPermissions":
        res = new CustomPermission(permission);
        break;
      case "description":
        res = new Description(permission);
        break;
      case "externalDataSourceAccesses":
        res = new ExternalDataSourceAccess(permission);
        break;
      case "fieldPermissions":
        res = new FieldPermission(permission);
        break;
      case "hasActivationRequired":
        res = new HasActivationRequired(permission);
        break;
      case "label":
        res = new Label(permission);
        break;
      case "layoutAssignments":
        res = new LayoutAssignments(permission);
        break;
      case "license":
        res = new License(permission);
        break;
      case "loginHours":
        res = new LoginHours(permission);
        break;
      case "loginIpRanges":
        res = new LoginIpRanges(permission);
        break;
      case "objectPermissions":
        res = new ObjectPermission(permission);
        break;
      case "pageAccesses":
        res = new PageAccess(permission);
        break;
      case "recordTypeVisibilities":
        res = new RecordTypeVisibility(permission);
        break;
      case "tabSettings":
        res = new TabSetting(permission);
        break;
      case "userLicense":
        res = new UserLicense(permission);
        break;
      case "userPermissions":
        res = new UserPermission(permission);
        break;
      default:
        throw new Error(`${type} is not supported`);
    }

    return res;
  }
}

module.exports = {
  Factory
};
