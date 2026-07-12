import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import DataTable from '../../components/UI/DataTable';
import { FileText, Database, ArrowDownCircle } from 'lucide-react';
import iictLogo from '../../assets/iict-logo.png';
import '../Dashboard/Dashboard.css'; // Reusing Dashboard styles

const Home = () => {
  const [stats, setStats] = useState({
    dpg: 0,
    prioritizedEquipments: 0
  });
  const [allocations, setAllocations] = useState({
    dpg: 0,
    srg: 0
  });
  const [dpgData, setDpgData] = useState({ columns: [], data: [] });
  const [peData, setPeData] = useState({ columns: [], data: [] });
  const [srgData, setSrgData] = useState({ columns: [], data: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeStats = async () => {
      try {
        let currentAllocations = { dpg: 0, srg: 0 };
        try {
          const settingsRes = await apiClient.get('/settings/budgetAllocations');
          if (settingsRes.data && settingsRes.data.value) {
            currentAllocations = settingsRes.data.value;
            setAllocations(currentAllocations);
          }
        } catch (dbError) {
          console.error("Failed to fetch allocations from DB", dbError);
        }

        const [dpgRes, peRes, srgRes] = await Promise.all([
          apiClient.get(`/records/${encodeURIComponent('Department Grant ')}`),
          apiClient.get(`/records/${encodeURIComponent('Prioritized  Equipments')}`),
          apiClient.get(`/records/${encodeURIComponent('Start up Grant ')}`)
        ]);

        if (dpgRes.data) {
          setDpgData({ columns: dpgRes.data.columns || [], data: dpgRes.data.data || [] });
        }
        if (peRes.data) {
          setPeData({ columns: peRes.data.columns || [], data: peRes.data.data || [] });
        }
        if (srgRes.data) {
          setSrgData({ columns: srgRes.data.columns || [], data: srgRes.data.data || [] });
        }
        
        const calculateTotal = (res, columnKeywords) => {
          if (!res.data || !res.data.columns || !res.data.data) return 0;
          const { columns, data } = res.data;
          
          let totalKey = null;
          for (const keyword of columnKeywords) {
            let col = columns.find(c => c.header && c.header.trim().toLowerCase() === keyword.toLowerCase());
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
          dpg: calculateTotal(dpgRes, ['Grand Total', 'Total Amount', 'Amount']),
          prioritizedEquipments: calculateTotal(peRes, ['Grand Total', 'Total Amount', 'Amount', 'Cost']),
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeStats();
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
    { name: 'DPG', allocated: allocations.dpg || 0, indented: stats.dpg || 0 },
    { name: 'Prioritized Equipments', allocated: 0, indented: stats.prioritizedEquipments || 0 }, // We assume 0 allocated for now
  ];

  return (
    <div className="dashboard-container">
      <div className="page-header animate-slide-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={iictLogo} alt="CSIR-IICT Logo" style={{ height: '60px' }} className="animate-float" />
          <div>
            <h1 className="page-title">CSIR - IICT ULIP User Dashboard</h1>
            <p className="text-secondary mt-2">Unit Lab & Inhouse Projects</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minWidth: '250px' }}>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Project Leader : Dr Pravin R Likhar</p>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Co- PI : Dr S Sreelatha</p>
        </div>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          title="Departmental Grant (DPG)" 
          allocated={allocations.dpg}
          indented={stats.dpg} 
          colorClass="accent-emerald"
        />
        <StatCard 
          title="Prioritized Equipments" 
          allocated={0} // As there's no explicit allocation field yet
          indented={stats.prioritizedEquipments} 
          colorClass="accent-indigo"
          showOnlyAllocated={false}
        />
      </div>

      <div className="charts-grid animate-slide-right" style={{ animationDelay: '0.1s' }}>
        <div className="chart-card glass" style={{ gridColumn: '1 / -1' }}>
          <div className="chart-header">
            <h3>Budget vs Indented</h3>
            <span className="badge">User Categories</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{fill: 'var(--text-muted)'}} 
                  width={100}
                  tickFormatter={(value) => new Intl.NumberFormat('en-IN', { notation: "compact", compactDisplay: "short" }).format(value)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}
                />
                <Bar dataKey="allocated" name="Allocated Budget" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="indented" name="Indented" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div id="dpg-table" style={{ marginTop: '2rem' }} className="animate-fade-in">
        <DataTable 
          title="4. Department Grant Data" 
          columns={dpgData.columns} 
          data={dpgData.data} 
        />
      </div>

      <div id="srg-table" style={{ marginTop: '2rem' }} className="animate-fade-in">
        <DataTable 
          title="5. Start Up Grant Data" 
          columns={srgData.columns} 
          data={srgData.data} 
        />
      </div>

      <div id="pe-table" style={{ marginTop: '2rem' }} className="animate-fade-in">
        <DataTable 
          title="3. Prioritized Equipments Data" 
          columns={peData.columns} 
          data={peData.data} 
        />
      </div>
    </div>
  );
};

export default Home;
