import { useState, useCallback, useMemo, useEffect } from 'react';
import { createFormField } from '../models/FormField';
import ObjectField from '../models/ObjectField';
import ArrayField from '../models/ArrayField';
import { getInitialFormData } from '../_helpers';

const useForm = (config) => {
  const [formData, setFormData] = useState(() => getInitialFormData(config));
  const [errors, setErrors] = useState({});

  const setValue = useCallback((path, value) => {

    console.log('path===>', path, 'value===>', value);
    setFormData(prevData => {
      const newFormData = { ...prevData };
      const pathArray = path.split('.');
      let current = newFormData;

      
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      
      const lastKey = pathArray[pathArray.length - 1];
      current[lastKey] = value;
      return newFormData;
    });
  }, []);

  const fields = useMemo(() => {
    if (!config?.properties) return [];
    
    return Object.keys(config.properties).map(key => {
      const property = config.properties[key];
      
      if (property.type === 'object' && property.properties) {
        return new ObjectField(key, property, key);
      } else if (property.type === 'array') {
        const isRequired = config.required && config.required.includes(key);
        return new ArrayField(key, property, key, isRequired);
      } else {
        return createFormField(key, property, key, config.required);
      }
    });
  }, [config, setValue]);

  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const fieldValue = formData[field.name];
      
      if (!field.validate(fieldValue)) {
        newErrors[field.path] = field.errors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData]);

  const reset = useCallback(() => {
    setFormData(getInitialFormData(config));
    setErrors({});
  }, [config]);

  const getField = useCallback((path) => {
    return fields.find(field => field.path === path);
  }, [fields]);

  useEffect(() => {
    if (formData.lineItems && Array.isArray(formData.lineItems)) {
      const total = formData.lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

      if (isNaN(total) || total < 0) {
        setErrors(prev => ({
          ...prev,
          total: ['wrong total amount']
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.total;
          return newErrors;
        });
      }
    
      setFormData(prevData => ({
        ...prevData,
        total: total
      }));
    }
  }, [formData.lineItems]);

  return {
    fields,
    formData,
    errors,
    setValue,
    validate,
    reset,
    getField,
  };
};

export default useForm;
