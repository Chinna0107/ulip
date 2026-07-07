import React, { useState, useEffect } from 'react';
import './Allocations.css';

const Allocations = () => {
  const [allocations, setAllocations] = useState({
    org: '130000000',
    cc: '0',
    capital: '0',
    techHr: '0',
    tada: '0',
    ore: '130000000'
  });

  useEffect(() => {
    const savedAllocations = localStorage.getItem('budgetAllocations');
    if (savedAllocations) {
      setAllocations(JSON.parse(savedAllocations));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAllocations(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('budgetAllocations', JSON.stringify(allocations));
    alert('Allocations saved successfully!');
  };

  return (
    <div className="allocations-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Budget Allocations</h1>
        <p className="text-secondary mt-2">Manage budget allocations for various categories.</p>
      </div>

      <div className="allocations-container glass">
        <div className="form-group">
          <label>ORE Allocation</label>
          <input 
            type="number" 
            name="ore" 
            value={allocations.ore} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>


        <div className="form-group">
          <label>Chemicals and consumables (formerly C&C Indents) Allocation</label>
          <input 
            type="number" 
            name="cc" 
            value={allocations.cc} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Capital Equipments Allocation</label>
          <input 
            type="number" 
            name="capital" 
            value={allocations.capital} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Tech HR (formerly Manpower Resources) Allocation</label>
          <input 
            type="number" 
            name="techHr" 
            value={allocations.techHr} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>TADA Allocation</label>
          <input 
            type="number" 
            name="tada" 
            value={allocations.tada} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <button onClick={handleSave} className="btn-primary mt-4">
          Save Allocations
        </button>
      </div>
    </div>
  );
};

export default Allocations;
