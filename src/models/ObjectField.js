import React from 'react';
import { BaseFormField, createFormField } from './FormField';
import ArrayField from './ArrayField';

class ObjectField extends BaseFormField {
  constructor(name, property, path) {
    super(name, property, path, property.required);
    this.fields = this.createFields();
  }

  createFields() {
    if (!this.property.properties) return [];
    
    return Object.keys(this.property.properties).map(key => {
      const itemProperty = this.property.properties[key];
      const itemPath = this.path ? `${this.path}.${key}` : key;
      
      if (itemProperty.type === 'object' && itemProperty.properties) {
        return new ObjectField(key, itemProperty, itemPath);
      } else if (itemProperty.type === 'array') {
        return new ArrayField(key, itemProperty, itemPath);
      } else {
        return createFormField(key, itemProperty, itemPath, this.property.required);
      }
    });
  }

  validate(value) {
    this.errors = [];
    
    if (!value || typeof value !== 'object') {
      if (this.isRequired()) {
        this.errors.push('Required');
        return false;
      }
      return true;
    }

    let isValid = true;
    
    this.fields.forEach(field => {
      const fieldValue = value[field.name];
      if (!field.validate(fieldValue)) {
        isValid = false;
        this.errors.push(...field.errors);
      }
    });

    return isValid;
  }

  render(setValue) {

    
    const value = this.value || {};
    
    return (
      <div className="card">
        <div className="card-header">{this.getLabel()}</div>
        <div className="card-body">
          {this.fields.map(field => {
            field.value = value[field.name];
            return (
              <div key={field.path}>
                {field.render(setValue)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ObjectField;
