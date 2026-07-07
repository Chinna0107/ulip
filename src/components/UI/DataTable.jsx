import React, { useState } from 'react';
import { Edit2, Trash2, Plus, X, Save, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './DataTable.css';

const DataTable = ({ columns, data, title, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(false);
  };

  const handleFormChange = (e, accessor) => {
    setFormData({ ...formData, [accessor]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await onEdit(editingId, formData);
      } else {
        await onAdd(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const displayData = data ? [...data].reverse() : [];

  const handleExportExcel = () => {
    if (!displayData || displayData.length === 0) return;
    
    // Map data to use column headers as keys
    const exportData = displayData.map(row => {
      const rowData = {};
      columns.forEach(col => {
        rowData[col.header] = row[col.accessor] || '';
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${title || 'Export'}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!displayData || displayData.length === 0) return;
    const doc = new jsPDF();
    const tableColumn = columns.map(col => col.header);
    const tableRows = displayData.map(row => columns.map(col => {
      const val = row[col.accessor];
      return val !== null && val !== undefined ? String(val) : '';
    }));
    
    doc.text(title || 'Export', 14, 15);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });
    doc.save(`${title || 'Export'}.pdf`);
  };

  const totalEntries = displayData.length;
  let grandTotal = 0;
  let hasTotalColumn = false;
  
  if (columns && displayData.length > 0) {
    const totalColumn = columns.find(col => 
      col.header.toLowerCase().includes('total') || 
      col.header.toLowerCase().includes('amount') ||
      col.header.toLowerCase().includes('price')
    );
    if (totalColumn) {
      hasTotalColumn = true;
      grandTotal = displayData.reduce((sum, row) => {
        const val = parseFloat(row[totalColumn.accessor]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    }
  }

  return (
    <div className="data-table-container glass animate-fade-in">
      <div className="data-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="data-table-title">{title}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {columns && columns.length > 0 && (
            <>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportExcel}>
                <FileSpreadsheet size={16} /> Excel
              </button>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportPDF}>
                <FileText size={16} /> PDF
              </button>
            </>
          )}
          {columns && columns.length > 0 && onAdd && (
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleOpenAddModal}>
              <Plus size={16} /> Add Record
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '3rem', padding: '1rem 1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>No. of Entries</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem' }}>{totalEntries}</span>
        </div>
        {hasTotalColumn && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Grand Total</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              {grandTotal.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
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
            {displayData && displayData.length > 0 ? (
              displayData.map((row, rowIndex) => (
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
                <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={isSaving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <><Save size={16} style={{ marginRight: '0.5rem' }} /> Save</>
                  )}
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
