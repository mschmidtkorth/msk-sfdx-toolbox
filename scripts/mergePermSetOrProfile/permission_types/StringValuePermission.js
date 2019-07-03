const AbstractPermission = require('./AbstractPermission');

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
    if (!this.equals(otherPermission)) {
      throw new Error(
        'You can only merge permission referring to same component'
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

module.exports = StringValuePermission;
