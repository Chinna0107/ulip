import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import './Allocations.css';

const Payments = () => {
  const [payments, setPayments] = useState({
    org: '130000000',
    cc: '0',
    capital: '0',
    techHr: '0',
    tada: '0',
    ore: '130000000',
    dpg: '0',
    srg: '0'
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await apiClient.get('/settings/budgetPayments');
        if (response.data && response.data.value) {
          setPayments(response.data.value);
        }
      } catch (error) {
        console.error("Failed to fetch payments from DB", error);
      }
    };
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayments(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await apiClient.put('/settings/budgetPayments', { value: payments });
      if (response.data) {
        alert('Payments saved successfully to database!');
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error("Save error:", error);
      alert('Failed to save payments to database. Please try again.');
    }
  };

  return (
    <div className="allocations-page animate-fade-in">
      <div className="page-header animate-slide-left">
        <h1 className="page-title">Budget Payments</h1>
        <p className="text-secondary mt-2">Manage budget payments for various categories.</p>
      </div>

      <div className="allocations-container glass">
        <div className="form-group">
          <label>Departmental Grant (DPG) Payments</label>
          <input 
            type="number" 
            name="dpg" 
            value={payments.dpg || ''} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Start Up Grant (SRG) Payments</label>
          <input 
            type="number" 
            name="srg" 
            value={payments.srg || ''} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>ORE Payments</label>
          <input 
            type="number" 
            name="ore" 
            value={payments.ore} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>


        <div className="form-group">
          <label>Chemicals and consumables (formerly C&C Indents) Payments</label>
          <input 
            type="number" 
            name="cc" 
            value={payments.cc} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Capital Equipments Payments</label>
          <input 
            type="number" 
            name="capital" 
            value={payments.capital} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Tech HR (formerly Manpower Resources) Payments</label>
          <input 
            type="number" 
            name="techHr" 
            value={payments.techHr} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>TADA Payments</label>
          <input 
            type="number" 
            name="tada" 
            value={payments.tada} 
            onChange={handleChange} 
            className="form-control"
          />
        </div>

        <button onClick={handleSave} className="btn-primary mt-4">
          Save Payments
        </button>
      </div>
    </div>
  );
};

export default Payments;
