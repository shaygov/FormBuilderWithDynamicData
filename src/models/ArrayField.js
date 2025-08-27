import React from 'react';
import { BaseFormField, createFormField } from './FormField';

class ArrayField extends BaseFormField {
  
  constructor(name, property, path, isRequired = false) {
    super(name, property, path, isRequired);
    this.itemFields = this.createItemFields();
  }

  // =======> create all fields for  items.properties
  createItemFields() {
    if (!this.property.items || !this.property.items.properties) return [];
    
    return Object.keys(this.property.items.properties).map(key => {
      const itemProperty = this.property.items.properties[key];
      return createFormField(key, itemProperty, key, this.property.items.required);
    });
  }

  validate(value) {
    this.errors = [];
    
    if (!Array.isArray(value)) {
      if (this.isRequired()) {
        this.errors.push('This field must be an array');
        return false;
      }
      return true;
    }

    if (this.isRequired() && value.length === 0) {
      this.errors.push('At least one item is required');
      return false;
    }

    let isValid = true;
    
    value.forEach((item, index) => {
      this.itemFields.forEach(field => {
        const fieldValue = item[field.name];
        if (!field.validate(fieldValue)) {
          isValid = false;
          this.errors.push(`Row ${index + 1}: ${field.errors.join(', ')}`);
        }
      });
    });

    return isValid;
  }

  render(setValue) {
    const value = this.value || [];
    
    const addItem = () => {
      const newItem = {};

      this.itemFields.forEach(field => {
        if (field.property.type === 'number') {
          newItem[field.name] = 0;
        } else if (field.property.type === 'boolean') {
          newItem[field.name] = false;
        } else {
          newItem[field.name] = '';
        }
      });
      
      if (newItem.quantity > 0 && newItem.price > 0) {
        newItem.lineTotal = newItem.quantity * newItem.price;
      }
      
      const newArray = [...value, newItem];

      // =======> set each fields as a value

      setValue(this.path, newArray);
    };

    const removeItem = (index) => {
      const newArray = value.filter((_, i) => i !== index);
      setValue(this.path, newArray);
    };

    const updateItem = (index, fieldName, fieldValue) => {
      const newArray = [...value];
      if (!newArray[index]) {
        newArray[index] = {};
      }
      newArray[index] = { ...newArray[index], [fieldName]: fieldValue };
      
      if (fieldName === 'quantity' || fieldName === 'price') {
        const quantity = fieldName === 'quantity' ? fieldValue : newArray[index].quantity;
        const price = fieldName === 'price' ? fieldValue : newArray[index].price;
        if (quantity !== undefined && price !== undefined && quantity > 0 && price > 0) {
          newArray[index].lineTotal = quantity * price;
        } else {
          newArray[index].lineTotal = 0;
        }
      }
      
      setValue(this.path, newArray);
    };

    return (
      <div className="form-group mb-3">

        <div className="d-flex align-items-center mb-3">
        <label className="form-label m-0">
          {this.getLabel()}
          {this.isRequired() && <span className="text-danger"> * </span>}
        </label>
        <button
            type="button"
            onClick={addItem}
            className="btn btn-sm btn-outline-primary  ms-2"
          >
            Add Item
          </button>
        </div>
         
        
        {value.map((item, index) => (
          <div key={index} className="card mb-2">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="btn btn-sm btn-outline-danger"
              >
                Remove
              </button>
            </div>
            <div className="card-body container-fluid">
              <div className=''>
                <div className="row">
                {this.itemFields.map(field => {
                  field.value = item[field.name];
                  return (
                    <div className="col col-md-4" key={field.path}>
                      {field.render((fieldPath, fieldValue) => updateItem(index, fieldPath, fieldValue))}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {this.errors.length > 0 && !value.length  && (
          <div className="invalid-feedback d-block">
            {this.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default ArrayField;
