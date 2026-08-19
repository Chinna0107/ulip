import React, { useState, useEffect } from 'react';
import DataTable from '../components/UI/DataTable';
import apiClient from '../api/client';

const mapSheetToAllocationKey = (sheetName) => {
  if (sheetName === 'Department Grant ') return 'dpg';
  if (sheetName === 'Start up Grant ') return 'srg';
  if (sheetName === 'C&C Indents') return 'cc';
  if (sheetName === 'Capital') return 'capital';
  if (sheetName === 'Manpower ') return 'techHr';
  if (sheetName === 'TADA Indents') return 'tada';
  if (sheetName === 'ORE') return 'ore';
  return null;
};

const getSumKey = (columns) => {
  // Try exact matches first
  const exactKeywords = ['grand total', 'total amount', 'amount', 'total', 'estimated cost', 'budget'];
  for (const keyword of exactKeywords) {
    const col = columns.find(c => c.header && c.header.trim().toLowerCase() === keyword);
    if (col) return col.accessor;
  }
  
  // Fallback to partial matches
  for (const keyword of exactKeywords) {
    const col = columns.find(c => c.header && c.header.toLowerCase().includes(keyword));
    if (col) return col.accessor;
  }
  return null;
};

const formatCurrency = (num) => {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
};

const GenericPage = ({ title, sheetName }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [allocations, setAllocations] = useState({
    cc: 0,
    capital: 0,
    techHr: 0,
    tada: 0,
    ore: 130000000,
    dpg: 0,
    srg: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsRes, allocRes] = await Promise.all([
        apiClient.get(`/records/${encodeURIComponent(sheetName)}`),
        apiClient.get('/settings/budgetAllocations').catch(() => ({ data: { value: null } }))
      ]);
      
      if (recordsRes.data) {
        setColumns(recordsRes.data.columns || []);
        setData(recordsRes.data.data || []);
      }
      if (allocRes.data && allocRes.data.value) {
        setAllocations(allocRes.data.value);
      }
    } catch (err) {
      console.error("Failed to load records", err);
      setError("Failed to load data from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sheetName) {
      fetchRecords();
    } else {
      setLoading(false);
    }
  }, [sheetName]);

  const handleAdd = async (newData) => {
    try {
      const response = await apiClient.post(`/records/${encodeURIComponent(sheetName)}`, newData);
      setData([...data, response.data]);
    } catch (err) {
      console.error("Failed to add record", err);
      alert("Failed to add record.");
      throw err;
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const response = await apiClient.put(`/records/${encodeURIComponent(sheetName)}/${id}`, updatedData);
      setData(data.map(item => item.id === id ? response.data : item));
    } catch (err) {
      console.error("Failed to update record", err);
      alert("Failed to update record.");
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await apiClient.delete(`/records/${encodeURIComponent(sheetName)}/${id}`);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete record", err);
      alert("Failed to delete record.");
    }
  };

  const userRole = localStorage.getItem('ulip_user_role') || 'user';
  const isAdmin = userRole === 'admin';

  return (
    <div className="generic-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {error ? (
          <p style={{ color: 'var(--error)', marginTop: '0.5rem' }}>
            {error}
          </p>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Managing data for "{sheetName}".
          </p>
        )}
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading data...
        </div>
      ) : (
        <DataTable 
          title={`${title} Data`}
          columns={columns} 
          data={data}
          onAdd={isAdmin ? handleAdd : undefined}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          budgetLimit={(mapSheetToAllocationKey(sheetName) && allocations[mapSheetToAllocationKey(sheetName)] !== undefined) ? Number(allocations[mapSheetToAllocationKey(sheetName)]) : null}
          sumKey={getSumKey(columns)}
        />
      )}
    </div>
  );
};

export default GenericPage;
