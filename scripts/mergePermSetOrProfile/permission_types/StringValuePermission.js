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
        'You can only merge permissions referring to the same component.'
      );
    }

    let conflicts = false;

    // in this case permission is just a string value
    if (this.getPermission() !== otherPermission.getPermission()) {
      this.permission = this.buildConflictString(
        this.getPermission(),
        otherPermission.getPermission()
      );
      conflicts = true;
    }

    return conflicts;
  }
}

module.exports = StringValuePermission;