'use strict';

const { OPERATIONS, FIELDS, } = require('ilorm-constants').QUERY;
const declareOperation = require('./helpers/declareOperation');

const SCHEMA_FIELDS_OPERATIONS = [
  OPERATIONS.IS,
  OPERATIONS.IS_NOT,
  OPERATIONS.IS_IN,
  OPERATIONS.IS_NOT_IN,
];

/**
 * Class representing a field of the schema
 */
let SchemaField = class SchemaField {

  /**
   * Create a new Schema field
   */
  constructor() {
    this._isRequired = false;
    this._default = null;
    this._name = null;
  }

  /**
   * Check if the given value is valid for the given field
   * @param {*} value The value to check
   * @return {boolean} Return true if the given value is valid of the current field
   */
  async isValid(value) { // eslint-disable-line
    return true;
  }

  /**
   * Init the given instance field
   * @param {Object} instance instance to init
   * @param {String} field field to init
   * @return {*} The initied field value
   */
  async init(instance, field) {
    const value = instance[field];

    if (value !== undefined) {
      if (!await this.isValid(value)) {
        throw new Error(`Invalid ${value} for field ${this._name}`);
      }

      return value;
    }

    if (typeof this._default === 'function') {
      instance[field] = await this._default();

      return instance[field];
    }

    instance[field] = this._default;

    return instance[field];
  }

  /**
   * Declare the field as required
   * @param {boolean} [isRequired=true] define the field as required or not
   * @return {SchemaField} Return the field (to chainable definition)
   */
  required(isRequired = true) {
    this._isRequired = isRequired;

    return this;
  }

  /**
   * Set the default value of the field
   * @param {*} value The default value
   * @return {SchemaField} Return the field (to chainable definition)
   */
  default(value) {
    this._default = value;

    return this;
  }

  /**
   * Return the query operation associated with the given schema field
   * @param {Query} query the instance of query to use
   * @param {Array.<String>} additionalOperations Add operations to the field builder
   * @return {Object} The query operations
   */
  getQueryOperations(query, additionalOperations = []) {
    const resultQueryOperations = {
      [OPERATIONS.SET]: declareOperation({
        query,
        operation: OPERATIONS.SET,
        field: FIELDS.UPDATE,
        key: this.name,
      }),
    };

    SCHEMA_FIELDS_OPERATIONS
      .concat(additionalOperations)
      .forEach(operation => {
        resultQueryOperations[operation] = declareOperation({
          query,
          operation,
          key: this._name,
        });
      });

    return resultQueryOperations;
  }

  /**
   * Cast a value to match the specific field or throw an exception
   * @param {Mixed} value the value to cast
   * @returns {Mixed} value the value casted to the specific schemaField type configuration
   */
  castValue(value) {
    return value;
  }
};

/**
 * Overload SchemaField class by another (to plugin)
 * @param {Model} Class A new SchemaField to replace the current one (plugin)
 * @returns {void} Return nothing
 */
const overload = Class => {
  SchemaField = Class;
  SchemaField.overload = overload;
};

SchemaField.overload = overload;

module.exports = SchemaField;
