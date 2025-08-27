class BaseFormField {
  static createRegexFromJson(fieldName, pattern) {
    let fixedPattern = pattern.replace(/\\A/g, '^').replace(/\\Z/g, '$');
    const flags = fieldName === 'email' ? 'i' : '';
    return new RegExp(fixedPattern, flags);
  }
  constructor(name, property, path, required) {
    this.name = name;
    this.property = property;
    this.path = path;
    this.required = required;
    this.errors = [];
  }

  validate(value) {
    this.errors = [];
    
    if (this.isRequired() && (value === undefined || value === null || value === '')) {
      this.errors.push('Required');
      return false;
    }

    if (value === undefined || value === null || value === '') {
      return true;
    }

    if (this.property.pattern) {
      const regex = BaseFormField.createRegexFromJson(this.name, this.property.pattern);
      if (!regex.test(value)) {
        if (this.name === 'phone') {
          this.errors.push('Format: 123-456-7890 or (123) 456-7890 or +1 123-456-7890');
        } else {
          this.errors.push('Wrong format');
        }
        return false;
      }
    }

    if (typeof this.validateValue === 'function') {
      return this.validateValue(value);
    }

    return true;
  }

  isRequired() {
    if (this.property.required) {
      return true;
    }
    
    if (typeof this.required === 'boolean') {
      return this.required;
    }
    
    if (this.required && Array.isArray(this.required) && this.required.includes(this.name)) {
      return true;
    }
    
    if (this.property.minLength && parseInt(this.property.minLength) > 0) {
      return true;
    }
    
    return false;
  }

  validateValue(value) {
    return true;
  }

  getLabel() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1).replace(/([A-Z])/g, ' $1');
  }

  getPlaceholder() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1).replace(/([A-Z])/g, ' $1');
  }

  renderField(inputElement) {
    return (
      <div className="form-group mb-3">
        <label htmlFor={this.path} className="form-label">
          {this.getLabel()}
          {this.isRequired() && <span className="text-danger"> * </span>}
        </label>
        
        {inputElement}
        
        {this.errors.length > 0 && (
          <div className="invalid-feedback">
            {this.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  render(setValue) {
    return null;
  }
}

class TextField extends BaseFormField {
  validateValue(value) {
    if (typeof value !== 'string') {
      this.errors.push('String required');
      return false;
    }

    if (this.property.minLength && value.length < this.property.minLength) {
      this.errors.push(`Min ${this.property.minLength} chars`);
      return false;
    }

    if (this.property.maxLength && value.length > this.property.maxLength) {
      this.errors.push(`Max ${this.property.maxLength} chars`);
      return false;
    }

    return true;
  }

  render(setValue) {
    const inputElement = (
      <input
        type="text"
        placeholder={this.getPlaceholder()}
        value={this.value !== undefined && this.value !== null ? this.value : ''}
        onChange={(e) => {
          this.errors = [];
          setValue(this.path, e.target.value);
        }}
        className={`form-control ${this.errors.length > 0 ? 'is-invalid' : ''}`}
        id={this.path}
      />
    );

    return this.renderField(inputElement);
  }
}

class SelectField extends BaseFormField {
  isRequired() {
    if (this.property.enum && this.property.enum.length > 0) {
      return true;
    }
    
    return super.isRequired();
  }

  validateValue(value) {
    if (typeof value !== 'string') {
      this.errors.push('Select option');
      return false;
    }

    if (this.property.enum && !this.property.enum.includes(value)) {
      this.errors.push('Invalid option');
      return false;
    }

    return true;
  }

  render(setValue) {
    const inputElement = (
      <select
        value={this.value !== undefined && this.value !== null ? this.value : ''}
        onChange={(e) => {
          this.errors = [];
          setValue(this.path, e.target.value);
        }}
        className={`form-select ${this.errors.length > 0 ? 'is-invalid' : ''}`}
        id={this.path}
      >
        <option value="">Select...</option>
        {this.property.enum.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );

    return this.renderField(inputElement);
  }
}



class NumberField extends BaseFormField {
  validateValue(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      this.errors.push('Numbers only');
      return false;
    }

    if (this.name === 'total' && value < 0) {
      this.errors.push('Total is required');
      return false;
    }
    
    if (this.property.minimum !== undefined && value < this.property.minimum) {
      this.errors.push(`Min ${this.property.minimum}`);
      return false;
    }

    if (this.property.maximum !== undefined && value > this.property.maximum) {
      this.errors.push(`Max ${this.property.maximum}`);
      return false;
    }

    return true;
  }

  render(setValue) {
    const inputElement = (
      <input
        type="number"
        step="any"
        value={this.value !== undefined && this.value !== null ? this.value : ''}
        onChange={(e) => {
          this.errors = [];
          const newValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
          setValue(this.path, isNaN(newValue) ? undefined : newValue);
        }}
        className={`form-control ${this.name === 'lineTotal' || this.name === 'total' ? 'bg-light' : ''} ${this.errors.length > 0 ? 'is-invalid' : ''}`}
        id={this.path}
        disabled={this.name === 'lineTotal' || this.name === 'total'}
      />
    );

    return this.renderField(inputElement);
  }
}

class BooleanField extends BaseFormField {
  validateValue(value) {
    if (typeof value !== 'boolean') {
      this.errors.push('Select option');
      return false;
    }
    return true;
  }

  render(setValue) {
    const value = this.value || false;
    
    return (
      <div className="form-group mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => {
              this.errors = [];
              setValue(this.path, e.target.checked);
            }}
            className={`form-check-input ${this.errors.length > 0 ? 'is-invalid' : ''}`}
            id={this.path}
          />
          <label htmlFor={this.path} className="form-label">{this.getLabel()}</label>
        </div>
        
        {this.errors.length > 0 && (
          <div className="invalid-feedback">
            {this.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

const createFormField = (name, property, path, required = null) => {
  switch (property.type) {
    case 'string':
      if (property.enum) {
        return new SelectField(name, property, path, required);
      } else {
        return new TextField(name, property, path, required);
      }
    case 'number':
      return new NumberField(name, property, path, required);
    case 'boolean':
      return new BooleanField(name, property, path, required);
    default:
      return new TextField(name, property, path, required);
  }
};

export { BaseFormField, TextField, SelectField, NumberField, BooleanField, createFormField };
