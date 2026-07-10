import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Users, UserPlus, Mail, Lock, Key, Edit2, Trash2, X } from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email) return; // password can be optional on edit

    setFormLoading(true);
    setFormMessage('');

    try {
      if (editingUserId) {
        await apiClient.put(`/users/${editingUserId}`, { name, email, password, role });
        setFormMessage({ type: 'success', text: 'User updated successfully!' });
      } else {
        if (!password) {
          setFormMessage({ type: 'error', text: 'Password is required for new users.' });
          setFormLoading(false);
          return;
        }
        await apiClient.post('/users', { name, email, password, role });
        setFormMessage({ type: 'success', text: 'User created successfully!' });
      }
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setEditingUserId(null);
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setFormMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save user.' 
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setFormMessage('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('user');
    setPassword('');
    setFormMessage('');
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="users-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-secondary mt-2">Create and manage access for the ULIP portal.</p>
        </div>
      </div>

      <div className="users-grid">
        {/* Create User Form */}
        <div className="create-user-card glass">
          <div className="card-header">
            <UserPlus size={20} className="card-icon" />
            <h2>{editingUserId ? 'Edit User' : 'Create New User'}</h2>
          </div>
          
          <form onSubmit={handleCreateUser} className="create-user-form">
            {formMessage && (
              <div className={`form-message ${formMessage.type}`}>
                {formMessage.text}
              </div>
            )}
            
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <Users size={16} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="John Doe" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="user@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder={editingUserId ? "Leave blank to keep current" : "Secure password"} 
                  required={!editingUserId} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="input-wrapper">
                <Key size={16} />
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={formLoading} style={{ flex: 1 }}>
                {formLoading ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
              </button>
              {editingUserId && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Users List */}
        <div className="users-list-card glass">
          <div className="card-header">
            <Users size={20} className="card-icon" />
            <h2>Existing Users</h2>
          </div>

          <div className="users-list-content">
            {loading ? (
              <p className="loading-text">Loading users...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : users.length === 0 ? (
              <p className="empty-text">No users found.</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleEditClick(u)} title="Edit User" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} title="Delete User" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
