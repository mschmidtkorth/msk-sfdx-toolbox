const types = require('../metadata_types');

module.exports = class MetadataTypeFactory {
  /**
   * Returns the correct Metadata type instance for given component.
   * Metadata Type is derived from the root element in the component's object.
   * @param {Object} component Metadata component object
   */
  static getMetadataComponent(component) {
    let rootProperty;
    let res;
    for (let key in component) {
      rootProperty = key;
      break;
    }

    switch (rootProperty) {
      case 'Profile':
        res = new types.Profile(component);
        break;
      case 'PermissionSet':
        res = new types.PermissionSet(component);
        break;
      default:
        throw new Error(`${rootProperty} type is not supported`);
    }

    return res;
  }
};
