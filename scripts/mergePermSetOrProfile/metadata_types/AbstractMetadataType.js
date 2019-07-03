/**
 * Represents an abstract Metadata type
 */
module.exports = class AbstractMetadataType {
  /**
   * Constructor
   * @param {Object} component Content of the metadata component as JS object
   * @param {String} rootProperty Root property of the component
   * @param {Array<String>} mergeProperties List of properties that can be merged
   */
  constructor(component, rootProperty, mergeProperties) {
    this.component = component;
    this.rootProperty = rootProperty;
    this.mergeProperties = mergeProperties;
  }

  /**
   * Checks if current component is of same type as other.
   * Returns true if this and other are of the same type, false otherwise
   * @param {AbstractMetadataType} other Other component
   */
  isSameType(other) {
    return this.rootProperty === other.rootProperty;
  }

  /**
   * Checks if the component contains the property
   * Returns true if cmponent contains the property, false otherwise.
   * @param {String} propName Property id
   */
  containsProperty(propName) {
    return this.component[this.rootProperty].hasOwnProperty(propName);
  }

  /**
   * Returns the specified property. If property does not exist returns
   * null.
   * @param {String} propName Property id
   */
  getProperty(propName) {
    if (this.containsProperty(propName)) {
      return this.component[this.rootProperty][propName];
    }
    return null;
  }

  /**
   * Set a property's value on the profile
   * @param {String} propName Property id
   * @param {Object} value Property's value
   */
  setProperty(propName, value) {
    this.component[this.rootProperty][propName] = value;
  }

  /**
   * Returns the whole content of this profile
   */
  getContent() {
    return this.component;
  }

  /**
   * Returns merge properties for this Metadata Type
   */
  getMergeProperties() {
    return this.mergeProperties;
  }
};
