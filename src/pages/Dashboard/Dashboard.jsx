import React from 'react';
import DataTable from '../../components/UI/DataTable';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="text-secondary mt-2">Welcome to the ULIP Admin Portal.</p>
      </div>
      
      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3>Total Grants</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>124</p>
        </div>
        <div className="card">
          <h3>Active Projects</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>42</p>
        </div>
        <div className="card">
          <h3>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning)' }}>18</p>
        </div>
      </div>

      <DataTable 
        title="Recent Activity (Placeholder)"
        columns={[
          { header: 'ID', accessor: 'id' },
          { header: 'Type', accessor: 'type' },
          { header: 'Date', accessor: 'date' },
          { header: 'Status', accessor: 'status' }
        ]}
        data={[
          { id: '1001', type: 'C&C Indent', date: '2023-10-27', status: 'Approved' },
          { id: '1002', type: 'Capital Request', date: '2023-10-26', status: 'Pending' },
        ]}
      />
    </div>
  );
};

export default Dashboard;
