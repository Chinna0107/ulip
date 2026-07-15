import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import apiClient from '../api/client';
import iictLogo from '../assets/iict-logo.png';
import './Dashboard/Dashboard.css';

const PublicDashboard = () => {
  const [stats, setStats] = useState({
    totalGrants: 0,
    ccIndents: 0,
    capitalEquipments: 0,
    manpower: 0,
    tada: 0,
    ore: 0,
    dpg: 0,
    srg: 0
  });
  const [allocations, setAllocations] = useState({
    org: 130000000,
    cc: 0,
    capital: 0,
    techHr: 0,
    tada: 0,
    ore: 130000000
  });
  const [payments, setPayments] = useState({
    org: 0,
    cc: 0,
    capital: 0,
    techHr: 0,
    tada: 0,
    ore: 0,
    dpg: 0,
    srg: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const budgetData = [
    { name: 'Jan', budget: 4000, spent: 2400 },
    { name: 'Feb', budget: 3000, spent: 1398 },
    { name: 'Mar', budget: 2000, spent: 9800 },
    { name: 'Apr', budget: 2780, spent: 3908 },
    { name: 'May', budget: 1890, spent: 4800 },
    { name: 'Jun', budget: 2390, spent: 3800 },
  ];

  const distributionData = [
    { name: 'C&C', value: 400 },
    { name: 'Capital', value: 300 },
    { name: 'Manpower', value: 300 },
    { name: 'Overheads', value: 200 },
  ];
  
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        let currentAllocations = { ...allocations };
        try {
          const [settingsRes, paymentsRes] = await Promise.all([
            apiClient.get('/settings/budgetAllocations').catch(() => ({ data: null })),
            apiClient.get('/settings/budgetPayments').catch(() => ({ data: null }))
          ]);
          
          if (settingsRes.data && settingsRes.data.value) {
            currentAllocations = settingsRes.data.value;
            setAllocations(currentAllocations);
          }
          if (paymentsRes.data && paymentsRes.data.value) {
            setPayments(paymentsRes.data.value);
          }
        } catch (dbError) {
          console.error("Failed to fetch settings from DB", dbError);
        }

        const [grantsRes, ccRes, capRes, mpRes, tadaRes, oreRes, dpgRes] = await Promise.all([
          apiClient.get(`/records/${encodeURIComponent('Start up Grant ')}`),
          apiClient.get(`/records/${encodeURIComponent('C&C Indents')}`),
          apiClient.get(`/records/${encodeURIComponent('Capital')}`),
          apiClient.get(`/records/${encodeURIComponent('Manpower ')}`),
          apiClient.get(`/records/${encodeURIComponent('TADA Indents')}`),
          apiClient.get(`/records/${encodeURIComponent('ORE')}`),
          apiClient.get(`/records/${encodeURIComponent('Department Grant ')}`)
        ]);
        
        const calculateTotal = (res, columnKeywords, filterKey = null, filterValue = null) => {
          if (!res.data || !res.data.columns || !res.data.data) return 0;
          const { columns, data } = res.data;
          
          let totalKey = null;
          for (const keyword of columnKeywords) {
            // First try exact match
            let col = columns.find(c => c.header && c.header.trim().toLowerCase() === keyword.toLowerCase());
            
            // If no exact match, try includes
            if (!col) {
              col = columns.find(c => c.header && c.header.toLowerCase().includes(keyword.toLowerCase()));
            }

            if (col) {
              totalKey = col.accessor;
              break;
            }
          }
          
          if (!totalKey) return 0;
          
          return data.reduce((sum, row) => {
            if (filterKey && filterValue && row[filterKey] !== filterValue) {
               return sum;
            }
            const val = parseFloat(row[totalKey]);
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
        };

        setStats({
          totalGrants: calculateTotal(grantsRes, ['Total Budget Approved', 'Budget', 'Grand Total']),
          ccIndents: calculateTotal(ccRes, ['Grand Total', 'Total Amount']),
          capitalEquipments: calculateTotal(capRes, ['Grand Total', 'Total Amount']),
          manpower: calculateTotal(mpRes, ['Total Amount per month', 'Total Amount', 'Grand Total']),
          tada: calculateTotal(tadaRes, ['Amount', 'Total']),
          ore: calculateTotal(oreRes, ['Grand Total', 'Total']),
          dpg: calculateTotal(ccRes, ['Grand Total', 'Total Amount'], 'type', 'Department Grant'),
          srg: calculateTotal(ccRes, ['Grand Total', 'Total Amount'], 'type', 'Startup Grant'),
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, allocated, indented, colorClass, showOnlyAllocated }) => {
    const allocatedNum = Number(allocated) || 0;
    const indentedNum = Number(indented) || 0;
    const balanceNum = allocatedNum - indentedNum;

    const formatCurrency = (num) => {
      if (isNaN(num)) return '0';
      return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0
      }).format(num);
    };

    return (
      <div className={`stat-card glass animate-scale-up ${colorClass}`}>
        <div className="stat-body" style={{ marginTop: '1rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '0.5rem' }}>{title}</h3>
          <div className="stat-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Allocated:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {loading ? 'Loading...' : formatCurrency(allocatedNum)}
              </strong>
            </div>
            {!showOnlyAllocated && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Indented:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {loading ? 'Loading...' : formatCurrency(indentedNum)}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Balance:</span>
                  <strong style={{ color: balanceNum >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                    {loading ? 'Loading...' : formatCurrency(balanceNum)}
                  </strong>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const chartData = [
    { name: 'ORE', allocated: allocations.ore !== undefined ? allocations.ore : 130000000, indented: stats.ore || 0, payments: payments.ore || 0 },
    { name: 'C&C', allocated: allocations.cc || 0, indented: stats.ccIndents || 0, payments: payments.cc || 0 },
    { name: 'Capital', allocated: allocations.capital || 0, indented: stats.capitalEquipments || 0, payments: payments.capital || 0 },
    { name: 'Tech HR', allocated: allocations.techHr || 0, indented: stats.manpower || 0, payments: payments.techHr || 0 },
    { name: 'TADA', allocated: allocations.tada || 0, indented: stats.tada || 0, payments: payments.tada || 0 },
  ];

  return (
    <div className="dashboard-container" style={{ padding: '0 1rem' }}>
      
      {/* Project Details Banner */}
      <div className="animate-slide-down" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 1rem 0' }}>
        <div className="glass" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem 3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Project Leader</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>Dr. Pravin R Likhar</p>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 1rem' }} className="hide-on-mobile"></div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Co-PI</span>
            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: 'var(--emerald)', fontSize: '1.2rem' }}>Dr. S Sreelatha</p>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '2rem' }}>
        <StatCard 
          title="ORE" 
          allocated={allocations.ore !== undefined ? allocations.ore : 130000000}
          indented={stats.ore} 
          colorClass="accent-rose"
        />
        <StatCard 
          title="Chemicals and consumables" 
          allocated={allocations.cc}
          indented={stats.ccIndents} 
          colorClass="accent-emerald"
        />
        <StatCard 
          title="Capital Equipments" 
          allocated={allocations.capital}
          indented={stats.capitalEquipments} 
          colorClass="accent-amber"
        />
        <StatCard 
          title="Tech HR" 
          allocated={allocations.techHr}
          indented={stats.manpower} 
          colorClass="accent-rose"
        />
        <StatCard 
          title="TADA" 
          allocated={allocations.tada}
          indented={stats.tada} 
          colorClass="accent-indigo"
        />
      </div>

      <div className="charts-grid animate-slide-right" style={{ animationDelay: '0.1s', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="chart-card glass">
          <div className="chart-header">
            <h3>Allocated vs Indented</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} tickMargin={10} />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{fill: 'var(--text-muted)'}} 
                  width={80}
                  tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(value)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: '500' }}
                  formatter={(value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="allocated" name="Allocated Budget" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="indented" name="Indented" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-header">
            <h3>Allocated vs Payments</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} tickMargin={10} />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{fill: 'var(--text-muted)'}} 
                  width={80}
                  tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(value)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}
                  itemStyle={{ color: 'var(--text-primary)', fontWeight: '500' }}
                  formatter={(value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="allocated" name="Allocated Budget" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="payments" name="Payments" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* <div className="recent-activity-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="card glass">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Recent System Activity</h3>
            <button className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon bg-emerald-light text-emerald"><TrendingUp size={16} /></div>
              <div className="activity-content">
                <p className="activity-text">New <strong>C&C Indent</strong> added for Department of Science.</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-amber-light text-amber"><DollarSign size={16} /></div>
              <div className="activity-content">
                <p className="activity-text"><strong>Capital Equipment</strong> budget updated for 2026.</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-indigo-light text-indigo"><Users size={16} /></div>
              <div className="activity-content">
                <p className="activity-text"><strong>Manpower</strong> allocation approved for Project X.</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PublicDashboard;
