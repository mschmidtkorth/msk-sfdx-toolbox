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
    for (let i = 0; i < propertiesToMerge.length; i++) {
      let propName = propertiesToMerge[i];

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
      let aPerm = factories.PermissionFactory.getPermissionInstance(
        propName,
        a
      );
      let bPerm = factories.PermissionFactory.getPermissionInstance(
        propName,
        b
      );
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
      let sourcePerm = factories.PermissionFactory.getPermissionInstance(
        propName,
        sourcePermissions[i]
      );

      for (let j = 0; j < destPermissions.length; j++) {
        let destPerm = factories.PermissionFactory.getPermissionInstance(
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
};
