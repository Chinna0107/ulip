import React, { useState, useEffect } from 'react';
import DataTable from '../components/UI/DataTable';
import apiClient from '../api/client';

const GenericPage = ({ title, sheetName }) => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dynamic data from the backend
      const response = await apiClient.get(`/records/${encodeURIComponent(sheetName)}`);
      if (response.data) {
        setColumns(response.data.columns || []);
        setData(response.data.data || []);
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
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const response = await apiClient.put(`/records/${encodeURIComponent(sheetName)}/${id}`, updatedData);
      setData(data.map(item => item.id === id ? response.data : item));
    } catch (err) {
      console.error("Failed to update record", err);
      alert("Failed to update record.");
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
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default GenericPage;
