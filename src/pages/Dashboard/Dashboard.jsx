import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Users, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';
import apiClient from '../../api/client';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGrants: 0,
    ccIndents: 0,
    capitalEquipments: 0,
    manpower: 0,
    tada: 0,
    ore: 0
  });
  const [allocations, setAllocations] = useState({
    org: 130000000,
    cc: 0,
    capital: 0,
    techHr: 0,
    tada: 0,
    ore: 130000000
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
        const savedAllocations = localStorage.getItem('budgetAllocations');
        if (savedAllocations) {
          setAllocations(JSON.parse(savedAllocations));
        }

        const [grantsRes, ccRes, capRes, mpRes, tadaRes, oreRes] = await Promise.all([
          apiClient.get(`/records/${encodeURIComponent('Start up Grant ')}`),
          apiClient.get(`/records/${encodeURIComponent('C&C Indents')}`),
          apiClient.get(`/records/${encodeURIComponent('Capital')}`),
          apiClient.get(`/records/${encodeURIComponent('Manpower ')}`),
          apiClient.get(`/records/${encodeURIComponent('TADA Indents')}`),
          apiClient.get(`/records/${encodeURIComponent('ORE')}`)
        ]);
        
        const calculateTotal = (res, columnKeywords) => {
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
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  const StatCard = ({ title, allocated, indented, icon: Icon, trend, isPositive, colorClass }) => {
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
      <div className={`stat-card glass animate-fade-in ${colorClass}`}>
        <div className="stat-card-header">
          <div className="stat-icon-wrapper">
            <Icon size={24} />
          </div>
          <div className={`stat-trend ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{trend}</span>
          </div>
        </div>
        <div className="stat-body" style={{ marginTop: '1rem' }}>
          <h3 className="stat-title" style={{ marginBottom: '0.5rem' }}>{title}</h3>
          <div className="stat-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Allocated:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {loading ? 'Loading...' : formatCurrency(allocatedNum)}
              </strong>
            </div>
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
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">CSIR - IICT ULIP</h1>
          <p className="text-secondary mt-2">Unit Lab & Inhouse Projects</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '250px' }}>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Project Leader : Dr Pravin R Likhar</p>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Co- PI : Dr S Sreelatha</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          title="ORE" 
          allocated={allocations.ore !== undefined ? allocations.ore : 130000000}
          indented={stats.ore} 
          icon={Activity} 
          trend="+5%" 
          isPositive={true}
          colorClass="accent-rose"
        />
        <StatCard 
          title="Chemicals and consumables" 
          allocated={allocations.cc}
          indented={stats.ccIndents} 
          icon={TrendingUp} 
          trend="+5%" 
          isPositive={true}
          colorClass="accent-emerald"
        />
        <StatCard 
          title="Capital Equipments" 
          allocated={allocations.capital}
          indented={stats.capitalEquipments} 
          icon={DollarSign} 
          trend="-2%" 
          isPositive={false}
          colorClass="accent-amber"
        />
        <StatCard 
          title="Tech HR" 
          allocated={allocations.techHr}
          indented={stats.manpower} 
          icon={Users} 
          trend="+18%" 
          isPositive={true}
          colorClass="accent-rose"
        />
        <StatCard 
          title="TADA" 
          allocated={allocations.tada}
          indented={stats.tada} 
          icon={Clock} 
          trend="+0%" 
          isPositive={true}
          colorClass="accent-indigo"
        />
      </div>

      {/* <div className="charts-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="chart-card glass">
          <div className="chart-header">
            <h3>Budget vs Expenditure</h3>
            <span className="badge">YTD 2026</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="budget" name="Allocated Budget" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Actual Spent" fill="var(--text-muted)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass">
          <div className="chart-header">
            <h3>Fund Distribution</h3>
            <span className="badge">Categories</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {distributionData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[index] }}></span>
                  <span className="legend-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

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

export default Dashboard;
