import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Users, UserPlus, Mail, Lock, Key } from 'lucide-react';
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
    if (!name || !email || !password) return;

    setFormLoading(true);
    setFormMessage('');

    try {
      await apiClient.post('/users', { name, email, password, role });
      setFormMessage({ type: 'success', text: 'User created successfully!' });
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setFormMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to create user.' 
      });
    } finally {
      setFormLoading(false);
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
            <h2>Create New User</h2>
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
                  placeholder="Secure password" 
                  required 
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

            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create User'}
            </button>
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
