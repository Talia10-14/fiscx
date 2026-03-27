import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import api from '../api/client';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'dashboard';

  const [stats, setStats] = useState({
    totalUsers: 2847,
    activeTransactions: 156,
    totalRevenue: 125000000,
    systemHealth: 99.8,
    apiLatency: 45,
    dbConnections: 124,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Mock data
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
    { id: 'users', label: '👥 Utilisateurs', icon: '👥' },
    { id: 'config', label: '⚙️ Configuration', icon: '⚙️' },
    { id: 'audit', label: '📋 Journaux d\'audit', icon: '📋' },
  ];

  const renderView = () => {
    switch (view) {
      case 'users':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>👥 Gestion des utilisateurs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Total utilisateurs</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{stats.totalUsers}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Inscrits depuis le lancement</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Actifs ce mois</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{Math.floor(stats.totalUsers * 0.68)}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Taux d'engagement: 68%</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Nouveaux cette semaine</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>+156</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Croissance: +2.4%</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Rôles et permissions</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Rôle</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Nombre d'utilisateurs</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Permissions</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { role: 'MERCHANT', count: 2100, perms: 'Lecture/Écriture transactions' },
                      { role: 'BANKER', count: 45, perms: 'Gestion portefeuille' },
                      { role: 'DGI', count: 12, perms: 'Certifications et audit' },
                      { role: 'ADMIN', count: 8, perms: 'Accès complet' },
                    ].map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 600 }}>{item.role}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13' }}>{item.count}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#6b7280' }}>{item.perms}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem' }}>
                          <button style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, fontSize: '.75rem', fontWeight: 600, cursor: 'pointer' }}>Éditer</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'config':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>⚙️ Configuration système</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Taux d'imposition</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Impôt synthétique</span>
                    <span style={{ fontWeight: 600, color: '#111a13' }}>7.5%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Taxe patronale</span>
                    <span style={{ fontWeight: 600, color: '#111a13' }}>3.6%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>TVA</span>
                    <span style={{ fontWeight: 600, color: '#111a13' }}>18%</span>
                  </div>
                  <button style={{ marginTop: 12, padding: '8px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 6, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>Mettre à jour les taux</button>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Paramètres API</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Latence API</span>
                    <span style={{ fontWeight: 600, color: '#059669' }}>{stats.apiLatency}ms</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Connexions BD</span>
                    <span style={{ fontWeight: 600, color: '#059669' }}>{stats.dbConnections}/150</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.875rem' }}>
                    <span style={{ color: '#6b7280' }}>Cache enabled</span>
                    <span style={{ fontWeight: 600, color: '#059669' }}>✓ Actif</span>
                  </div>
                  <button style={{ marginTop: 12, padding: '8px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 6, fontSize: '.85rem', fontWeight: 600, cursor: 'pointer' }}>Accéder aux configurations avancées</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'audit':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>📋 Journaux d'audit</h2>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { time: '14:32:15', user: 'admin@fiscx.bj', action: 'Modification taux impôt synthétique', status: '✓' },
                  { time: '13:45:22', user: 'afi.koudossou@example.com', action: 'Téléchargement bilan SYSCOHADA', status: '✓' },
                  { time: '13:22:08', user: 'banker@boa.bj', action: 'Approbation demande crédit', status: '✓' },
                  { time: '12:15:47', user: 'dgi@fiscal.bj', action: 'Certification bilan', status: '✓' },
                  { time: '11:58:33', user: 'moussa.bello@example.com', action: 'Création compte', status: '✓' },
                ].map((log, idx) => (
                  <div key={idx} style={{ padding: 16, background: '#f9fafb', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', marginBottom: 4 }}>{log.action}</div>
                      <div style={{ fontSize: '.75rem', color: '#6b7280' }}>
                        {log.user} • {log.time}
                      </div>
                    </div>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#059669' }}>{log.status}</span>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 16, padding: '10px 16px', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: 6, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>Charger plus de logs</button>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 8 }}>
                Tableau de bord administrateur 👨‍💼
              </h1>
              <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Gestion système et configuration</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <Card title="Utilisateurs actifs" value={stats.totalUsers} icon="👥" color="blue" />
              <Card title="Transactions en cours" value={stats.activeTransactions} icon="📊" color="green" />
              <Card title="Revenu total" value={formatCurrency(stats.totalRevenue)} icon="💰" color="purple" />
              <Card title="Santé système" value={`${stats.systemHealth}%`} icon="⚙️" color="red" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>État du système</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', margin: 0 }}>API Server</p>
                      <p style={{ fontSize: '.75rem', color: '#6b7280', margin: 0 }}>Latence: {stats.apiLatency}ms</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', margin: 0 }}>Base de données</p>
                      <p style={{ fontSize: '.75rem', color: '#6b7280', margin: 0 }}>Connexions: {stats.dbConnections}/150</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', margin: 0 }}>Cache</p>
                      <p style={{ fontSize: '.75rem', color: '#6b7280', margin: 0 }}>Statut: Actif</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Actions rapides</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Générer rapport système</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Performance et statistiques</p>
                  </button>
                  <button style={{ padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', textAlign: 'left', cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <p style={{ fontWeight: 600, color: '#111a13', margin: 0 }}>Sauvegarder la BD</p>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Créer une sauvegarde</p>
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
