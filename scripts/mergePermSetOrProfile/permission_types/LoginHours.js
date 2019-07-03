const AbstractPermission = require('./AbstractPermission');

/**
 * Represents Login Hours specified on a Profile
 * Reference: https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_profile.htm
 */
module.exports = class LoginHours extends AbstractPermission {
  getId() {
    return this.idProperty; // there can be only one entry in a profile
  }

  constructor(permission) {
    super(permission, 'loginHours', [
      'fridayEnd',
      'fridayStart',
      'mondayEnd',
      'mondayStart',
      'saturdayEnd',
      'saturdayStart',
      'sundayEnd',
      'sundayStart',
      'thursdayEnd',
      'thursdayStart',
      'tuesdayEnd',
      'tuesdayStart',
      'wednesdayEnd',
      'wednesdayStart'
    ]);
  }

  /**
   * Merges the content of login hours.
   * Returns true in case there were merge conflicts, false otherwise.
   * @param {AbstractPermission} otherPermission Permission to merge
   */
  merge(otherPermission) {
    // checks that both permissions refer to same component
    if (!this.equals(otherPermission)) {
      throw new Error(
        'You can only merge permission referring to same component'
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
