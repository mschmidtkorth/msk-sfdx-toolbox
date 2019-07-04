const factories = require('../factories');

/**
 * Abstract class that contains the main logic to merge either a Profile or a Permission Set
 */
module.exports = class GenericMerger {
  /**
   * Constructor
   * @param {AbstractMetadataType} theirs Metadata component to merge from
   * @param {AbstractMetadataType} ours Metadata component to merge into
   */
  constructor(theirs, ours) {
    this.theirs = factories.MetadataTypeFactory.getMetadataComponent(theirs);
    this.ours = factories.MetadataTypeFactory.getMetadataComponent(ours);

    if (!this.theirs.isSameType(this.ours)) {
      throw new Error('Components must be of same type');
    }
  }

  /**
   * Execute merge logic.
   * Result of the merge is stored inside the instance variable ours.
   */
  mergeTheirsIntoOurs() {
    let conflicts = false;
    const propertiesToMerge = this.theirs.getMergeProperties();

    // iterates over properties that need to be merged
    for (let propName of propertiesToMerge) {
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
        // both contain the current property. Executes merge.
        conflicts |= this._mergePermissions(propName, this.theirs, this.ours);
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
    let destPermissionsMap = {};
    let conflicts = false;

    // for each permission in the destination maps the permission id to its instance
    for (let item of dest.getProperty(propName)) {
      let perm = factories.PermissionFactory.getPermissionInstance(
        propName,
        item
      );

      destPermissionsMap[perm.getId()] = perm;
    }

    for (let item of sourcePermissions) {
      let sourcePerm = factories.PermissionFactory.getPermissionInstance(
        propName,
        item
      );

      let destPerm = destPermissionsMap[sourcePerm.getId()];

      if (!destPerm) {
        // permission is not in destination, just add it
        destPermissionsMap[sourcePerm.getId()] = sourcePerm;
      } else {
        conflicts |= destPerm.merge(sourcePerm);
      }
    }

    // extracts all permissions from map
    let destPermissions = Object.keys(destPermissionsMap).map(
      key => destPermissionsMap[key]
    );

    // reorder permissions
    destPermissions.sort((a, b) => {
      return a.compareTo(b);
    });

    // updates the content of destination
    dest.setProperty(
      propName,
      destPermissions.map(perm => perm.getPermission())
    );

    return conflicts;
  }
};
