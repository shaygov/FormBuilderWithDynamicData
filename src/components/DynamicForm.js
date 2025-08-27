import React from 'react';
import useForm from '../_hooks/useForm';

const DynamicForm = ({ config, onSubmit }) => {
  const { fields, formData, errors, setValue, validate, reset } = useForm(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isValid = validate();
    if (isValid) {
      if (onSubmit) {
        onSubmit(formData);
      }
    } else {
      console.log('Form validation errors:', errors);
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => {
        field.value = formData[field.name];
        return (
          <div key={field.path}>
            {field.render(setValue)}
          </div>
        );
      })}
      
      <div className="form-actions d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        <button type="button" onClick={handleReset} className="btn btn-outline-secondary">
          Reset
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
