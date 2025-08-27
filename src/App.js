import './App.css';
import React, { useState, useEffect } from 'react';
import DynamicForm from './components/DynamicForm';

function App() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/invoice-metadata.json')
      .then(response => response.json())
      .then(data => {
        setConfig(data);
      })
      .catch(error => {
        console.error('Error loading meta model:', error);
      });
  }, []);

  const handleFormSubmit = (data) => {
    console.log("Data ==================>:", data);
  };

  if (!config) {
    return <div className="loading">Loading...</div>;
  }

  console.log("Config ==================>", config);

  return (
    <div className="App">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="form-wrapper">
                <div className="form-header">
                  <h2>Invoice Form</h2>
                </div>
                <div className="form-body">
                  <DynamicForm
                    config={config}
                    onSubmit={handleFormSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
