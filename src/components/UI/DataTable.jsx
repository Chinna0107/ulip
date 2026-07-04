import React, { useState } from 'react';
import { Edit2, Trash2, Plus, X, Save } from 'lucide-react';
import './DataTable.css';

const DataTable = ({ columns, data, title, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const handleOpenAddModal = () => {
    setFormData({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (row) => {
    setFormData({ ...row });
    setEditingId(row.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const handleFormChange = (e, accessor) => {
    setFormData({ ...formData, [accessor]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onEdit(editingId, formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  return (
    <div className="data-table-container glass animate-fade-in">
      <div className="data-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="data-table-title">{title}</h2>
        {columns && columns.length > 0 && onAdd && (
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={handleOpenAddModal}>
            <Plus size={16} /> Add Record
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
              {(onEdit || onDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>{row[col.accessor] || '-'}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons">
                        {onEdit && (
                          <button className="icon-btn edit-btn" onClick={() => handleOpenEditModal(row)}>
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button className="icon-btn delete-btn" onClick={() => onDelete(row.id)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (onEdit ? 1 : 0)} className="no-data">
                  No records found. Click "Add Record" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Record' : 'Add New Record'}</h3>
              <button className="icon-btn" onClick={handleCloseModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {columns.map((col, index) => (
                <div key={index} className="form-group">
                  <label>{col.header}</label>
                  <input
                    type="text"
                    value={formData[col.accessor] || ''}
                    onChange={(e) => handleFormChange(e, col.accessor)}
                    placeholder={`Enter ${col.header}`}
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <Save size={16} style={{ marginRight: '0.5rem' }} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
