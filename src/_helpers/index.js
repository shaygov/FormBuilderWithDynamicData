const getInitialFormData = (config) => {
  if (!config || !config.properties) return {};
  
  const data = {};
  Object.keys(config.properties).forEach(key => {
    const property = config.properties[key];
    if (property.type === 'object' && property.properties) {
      data[key] = getInitialFormData(property);
    } else if (property.type === 'array') {
      data[key] = [];
    } else if (property.type === 'boolean') {
      data[key] = false;
    } else if (property.type === 'number') {
      data[key] = 0;
    } else {
      data[key] = '';
    }
  });
  return data;
};

export { getInitialFormData };