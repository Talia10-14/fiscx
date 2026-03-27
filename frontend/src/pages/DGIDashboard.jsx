import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import api from '../api/client';

export default function DGIDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'dashboard';

  const [stats, setStats] = useState({
    registeredMerchants: 2847,
    declaredRevenue: 425000000,
    taxCollected: 51000000,
    complianceRate: 87.3,
    bilansVerified: 1247,
    bilansAudit: 89,
    bilansNonCompliant: 14,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDGIData();
  }, []);

  const fetchDGIData = async () => {
    try {
      setLoading(true);
      // Mock data
    } catch (error) {
      console.error('Error fetching DGI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-BJ', {
      style: 'currency',
      currency: 'XOF',
    }).format(value);
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord', icon: '📊' },
    { id: 'bilans', label: '📝 Bilans SYSCOHADA', icon: '📝' },
    { id: 'declarations', label: '📋 Déclarations', icon: '📋' },
    { id: 'analytics', label: '📈 Analytique', icon: '📈' },
  ];

  const renderView = () => {
    switch (view) {
      case 'bilans':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>📝 Bilans SYSCOHADA</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 24, border: '2px solid #86efac' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Bilans certifiés</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>{stats.bilansVerified}</div>
                <p style={{ fontSize: '.75rem', color: '#047857' }}>✓ Certifications acceptées</p>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: 12, padding: 24, border: '2px solid #fcd34d' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>En audit</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#d97706', marginBottom: 4 }}>{stats.bilansAudit}</div>
                <p style={{ fontSize: '.75rem', color: '#92400e' }}>En cours de vérification</p>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: 12, padding: 24, border: '2px solid #fca5a5' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Non-conformes</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>{stats.bilansNonCompliant}</div>
                <p style={{ fontSize: '.75rem', color: '#991b1b' }}>Nécessitent corrections</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Derniers bilans à certifier</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { merchant: 'Afi Koudossou', date: '2024-01-15', period: 'Jan 2024', status: 'En attente' },
                  { merchant: 'Moussa Bello', date: '2024-01-14', period: 'Jan 2024', status: 'En attente' },
                  { merchant: 'Romuald Akakpo', date: '2024-01-13', period: 'Déc 2023', status: 'En attente' },
                  { merchant: 'Fatou Sow', date: '2024-01-12', period: 'Déc 2023', status: 'En attente' },
                  { merchant: 'Ibrahim Kante', date: '2024-01-11', period: 'Déc 2023', status: 'Certifié' },
                ].map((record, idx) => (
                  <div key={idx} style={{ padding: 12, background: '#f9fafb', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', margin: 0 }}>{record.merchant}</p>
                      <p style={{ fontSize: '.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>Période: {record.period} • Reçu: {record.date}</p>
                    </div>
                    <button style={{ padding: '6px 12px', background: record.status === 'Certifié' ? '#dcfce7' : '#fef3c7', color: record.status === 'Certifié' ? '#166534' : '#92400e', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}>
                      {record.status === 'Certifié' ? '✓ Certifié' : 'Certifier'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'declarations':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>📋 Déclarations d'impôts</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>À traiter</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>28</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Déclarations en attente</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Approuvées</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>1,850</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Ce mois</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Taux de conformité</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{stats.complianceRate}%</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Global</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Files par statut</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Statut</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Nombre</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Montant total</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { status: 'Reçue', count: 28, amount: 28500000 },
                      { status: 'En vérification', count: 15, amount: 18200000 },
                      { status: 'Approuvée', count: 1850, amount: 425000000 },
                      { status: 'Rejetée', count: 5, amount: 1200000 },
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 600 }}>{row.status}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13' }}>{row.count}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', fontWeight: 600, color: '#006b3f' }}>{formatCurrency(row.amount)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem' }}>
                          <button style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}>Voir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>📈 Analytique et rapports</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Revenu mensuel moyen</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{formatCurrency(stats.declaredRevenue / 12)}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>par commerçant</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Taux d'imposition moyen</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>11.2%</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Synthétique + cotisations</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Croissance YoY</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>+18.3%</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Comparé année précédente</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Secteurs activité</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { sector: 'Commerce textile', count: 1245, revenue: 245000000 },
                    { sector: 'Épicerie/GMS', count: 856, revenue: 125000000 },
                    { sector: 'Alimentation', count: 432, revenue: 89000000 },
                    { sector: 'Électronique', count: 234, revenue: 95000000 },
                    { sector: 'Services', count: 80, revenue: 12000000 },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', paddingBottom: 12, borderBottom: idx < 4 ? '1px solid #e5e7eb' : 'none' }}>
                      <span style={{ color: '#111a13', fontWeight: 500 }}>{item.sector}</span>
                      <span style={{ color: '#6b7280' }}>{item.count} commerçants</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Actions rapides</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Générer rapport mensuel</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Impôts collectés et conformité</p>
                  </button>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Exporter statistiques</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Format CSV/PDF - APDP conforme</p>
                  </button>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Analyser non-conformité</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Commerçants à relancer</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 8 }}>
                Tableau de bord DGI 📋
              </h1>
              <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Gestion des déclarations et conformité SYSCOHADA</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <Card title="Commerçants enregistrés" value={stats.registeredMerchants} icon="👥" color="blue" />
              <Card title="Revenu déclaré" value={formatCurrency(stats.declaredRevenue)} icon="💰" color="green" />
              <Card title="Impôts collectés" value={formatCurrency(stats.taxCollected)} icon="🏦" color="purple" />
              <Card title="Taux conformité" value={`${stats.complianceRate}%`} icon="✅" color="red" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Aperçu de conformité</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10 }}>
                    <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Certifiés</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#059669' }}>{stats.bilansVerified}</p>
                  </div>
                  <div style={{ padding: 16, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10 }}>
                    <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>En audit</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#d97706' }}>{stats.bilansAudit}</p>
                  </div>
                  <div style={{ padding: 16, background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10 }}>
                    <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>Non-conformes</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#dc2626' }}>{stats.bilansNonCompliant}</p>
                  </div>
                  <div style={{ padding: 16, background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: 10 }}>
                    <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>À traiter</p>
                    <p style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1e40af' }}>28</p>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Actions rapides</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Certifier 42 bilans</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>SYSCOHADA en attente</p>
                  </button>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Valider 28 déclarations</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Déclarations d'impôts reçues</p>
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        
        {/* Tabs Navigation */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(`?view=${tab.id}`)}
              style={{
                padding: '16px 24px',
                fontSize: '.875rem',
                fontWeight: 600,
                color: view === tab.id ? '#006b3f' : '#6b7280',
                background: 'transparent',
                border: 'none',
                borderBottom: view === tab.id ? '3px solid #006b3f' : '3px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .2s',
              }}
              onMouseEnter={e => view !== tab.id && (e.currentTarget.style.color = '#111a13')}
              onMouseLeave={e => view !== tab.id && (e.currentTarget.style.color = '#6b7280')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 16px 32px 32px' }}>
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
