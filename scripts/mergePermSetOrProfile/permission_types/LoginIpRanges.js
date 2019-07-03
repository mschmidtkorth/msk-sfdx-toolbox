const AbstractPermission = require('./AbstractPermission');

/**
 * Represents the Login Ip Ranges in a Profile
 */
module.exports = class LoginIpRanges extends AbstractPermission {
  constructor(permission) {
    super(permission, 'startAddress', ['description', 'endAddress']);
  }
}
