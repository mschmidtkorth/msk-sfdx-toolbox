/**
 * Represents a permission.
 * Exposes general methods to manipulate the permission.
 */
module.exports = class AbstractPermission {
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
    if (!this.equals(otherPermission)) {
      throw new Error(
        'You can only merge permission referring to the same component.'
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
    return `\n<<<<<<< CURRENT\n${current}\n======= \n${other}\n>>>>>>> OTHER\n`;
  }
}