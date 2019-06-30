/**
 * Contains the main logic to merge two permission sets.
 * Expose the Merger class that has methods to execute the
 * merge operation.
 */
const strategies = require("./strategies.js");

/**
 * Describes a whole profile
 */
class Profile {
  /**
   * Constructor
   * @param {Object} profile The content of the profile set as a JS Object
   */
  constructor(profile) {
    this.profile = profile;
  }

  /**
   * Returns true if the profile contains the specified property.
   * Returns false otherwise.
   * @param {String} propName Property id
   */
  containsProperty(propName) {
    return this.profile.Profile.hasOwnProperty(propName);
  }

  /**
   * Returns the specified property. If property does not exist returns
   * undefined.
   * @param {String} propName Property id
   */
  getProperty(propName) {
    return this.profile.Profile[propName];
  }

  /**
   * Set a property's value on the profile
   * @param {String} propName Property id
   * @param {Object} value Property's value
   */
  setProperty(propName, value) {
    this.profile.Profile[propName] = value;
  }

  /**
   * Returns the whole content of this profile
   */
  getContent() {
    return this.profile;
  }
}

/**
 * Describes a whole permission set
 */
class PermissionSet {
  /**
   * Constructor
   * @param {Object} permissionSet The content of the permission set as a JS Object
   */
  constructor(permissionSet) {
    this.permissionSet = permissionSet;
  }

  /**
   * Returns true if the permission set contains the specified property.
   * Returns false otherwise.
   * @param {String} propName Property id
   */
  containsProperty(propName) {
    return this.permissionSet.PermissionSet.hasOwnProperty(propName);
  }

  /**
   * Returns the specified property. If property does not exist returns
   * undefined.
   * @param {String} propName Property id
   */
  getProperty(propName) {
    return this.permissionSet.PermissionSet[propName];
  }

  /**
   * Set a property's value on the permission set
   * @param {String} propName Property id
   * @param {Object} value Property's value
   */
  setProperty(propName, value) {
    this.permissionSet.PermissionSet[propName] = value;
  }

  /**
   * Returns the whole content of this permission set
   */
  getContent() {
    return this.permissionSet;
  }
}

/**
 * Abstract class that contains the main logic to merge either a Profile or a Permission Set
 */
class AbstractMerger {
  constructor(propertiesToMerge) {
    this.propertiesToMerge = propertiesToMerge;
  }

  /**
   * Execute merge logic.
   * Result of the merge is stored inside the instance variable ours.
   */
  mergeTheirsIntoOurs() {
    let conflicts = false;

    // iterates over properties that need to be merged
    for (let i = 0; i < this.propertiesToMerge.length; i++) {
      let propName = this.propertiesToMerge[i];

      if (
        !this.ours.containsProperty(propName) &&
        this.theirs.containsProperty(propName)
      ) {
        // ours doesn't contain the current property. Copies it from theirs
        this._copyPermissions(propName, this.theirs, this.ours);
      } else if (
        this.ours.containsProperty(propName) &&
        this.theirs.containsProperty(propName)
      ) {
        // both permission sets contain the current property. Executes merge.
        conflicts |= this._mergePermissions(propName, this.theirs, this.ours);

        // reorder the property array
        this._reorderPermissions(propName, this.ours);
      }
    }

    return conflicts;
  }

  /**
   * Returns the result of the merge operation.
   */
  getMergeResult() {
    return this.ours.getContent();
  }

  /**
   * Reorder the content of specified property
   * @param {String} propName Property id
   * @param {Object} dest Permission set to reorder
   */
  _reorderPermissions(propName, dest) {
    let permissions = dest.getProperty(propName);

    permissions.sort(function(a, b) {
      let aPerm = strategies.Factory.getPermissionInstance(propName, a);
      let bPerm = strategies.Factory.getPermissionInstance(propName, b);
      return aPerm.compareTo(bPerm);
    });

    dest.setProperty(propName, permissions);
  }

  /**
   * Copies permissions, specified by property name, from source to destination.
   * @param {String} propName Property id
   * @param {Object} source Source permission set
   * @param {Object} dest Destination permission set
   */
  _copyPermissions(propName, source, dest) {
    dest.setProperty(propName, source.getProperty(propName));
  }

  /**
   * Merge permissions, specified by property name, from source into the destination.
   * Returns true if there were conflicts, false otherwise.
   * @param {String} propName Property id
   * @param {Object} source Source permission set
   * @param {Object} dest Destination permission set
   */
  _mergePermissions(propName, source, dest) {
    let sourcePermissions = source.getProperty(propName);
    let destPermissions = dest.getProperty(propName);
    let conflicts = false;

    for (let i = 0; i < sourcePermissions.length; i++) {
      let found = false;
      let sourcePerm = strategies.Factory.getPermissionInstance(
        propName,
        sourcePermissions[i]
      );

      for (let j = 0; j < destPermissions.length; j++) {
        let destPerm = strategies.Factory.getPermissionInstance(
          propName,
          destPermissions[j]
        );

        if (destPerm.equals(sourcePerm)) {
          // permission about same component
          conflicts |= destPerm.merge(sourcePerm);
          destPermissions[j] = destPerm.getPermission();
          found = true;
          break;
        }
      }

      if (!found) {
        // permission was not found. just add it
        destPermissions.push(sourcePerm.getPermission());
      }
    }

    // updates the content of destination
    dest.setProperty(propName, destPermissions);

    return conflicts;
  }
}

/**
 * Contains logic to merge two permission sets
 */
class PermissionSetMerger extends AbstractMerger {
  /**
   * Constructor
   * @param {Object} theirs Source permission set. The content of this permission set won't be altered
   * @param {Object} ours Destination permission set. The content of this permissions set will be altered.
   */
  constructor(theirs, ours) {
    // This list comes from https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_permissionset.htm
    super([
      "applicationVisibilities",
      "classAccesses",
      "customPermissions",
      "description",
      "externalDataSourceAccesses",
      "fieldPermissions",
      "hasActivationRequired",
      "label",
      "license",
      "objectPermissions",
      "pageAccesses",
      "recordTypeVisibilities",
      "tabSettings",
      "userLicense",
      "userPermissions"
    ]);

    this.theirs = new PermissionSet(theirs);
    this.ours = new PermissionSet(ours);
  }
}

/**
 * Contains logic to merge two profiles
 */
class ProfileMerger extends AbstractMerger {
  /**
   * Constructor
   * @param {Object} theirs Source profile. The content of this profile won't be altered
   * @param {Object} ours Destination profile. The content of this permissions set will be altered.
   */
  constructor(theirs, ours) {
    // This list comes from https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm
    super([
      "applicationVisibilities",
      "categoryGroupVisibilities",
      "classAccesses",
      "customPermissions",
      "description",
      "externalDataSourceAccesses",
      "fieldPermissions",
      "label",
      "layoutAssignments",
      "loginHours",
      "loginIpRanges",
      "objectPermissions",
      "pageAccesses",
      "recordTypeVisibilities",
      "tabSettings",
      "userLicense",
      "userPermissions"
    ]);

    this.theirs = new Profile(theirs);
    this.ours = new Profile(ours);
  }
}

module.exports = {
  PermissionSetMerger,
  ProfileMerger
};
