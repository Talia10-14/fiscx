import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import api from '../api/client';

export default function MerchantDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'dashboard';
  
  const [stats, setStats] = useState({
    dailyRevenue: 85000,
    balance: 125000,
    creditScore: 750,
    transactionCount: 24,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      // const { data: statsData } = await api.get('/merchant/stats');
      // const { data: transactionsData } = await api.get('/merchant/transactions');
      // setStats(statsData);
      // setTransactions(transactionsData);
      
      // Mock data for demo
      setTransactions([
        {
          id: 1,
          type: 'VENTE',
          amount: 45000,
          description: 'Vente de marchandises',
          date: '2024-01-15T14:30:00',
          status: 'COMPLÉTÉ',
        },
        {
          id: 2,
          type: 'DÉPENSE',
          amount: -12000,
          description: 'Achat de stock',
          date: '2024-01-15T10:15:00',
          status: 'COMPLÉTÉ',
        },
        {
          id: 3,
          type: 'RETRAIT',
          amount: -8000,
          description: 'Retrait en espèces',
          date: '2024-01-14T16:45:00',
          status: 'COMPLÉTÉ',
        },
      ]);
    } catch (error) {
      console.error('Error fetching merchant data:', error);
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

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-BJ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  // Render different views based on query param
  const tabs = [
    { id: 'dashboard', label: '📊 Tableau de bord', icon: '📊' },
    { id: 'sales', label: '📈 Mes ventes', icon: '📈' },
    { id: 'transactions', label: '💳 Transactions', icon: '💳' },
    { id: 'credit', label: '⭐ Score de crédit', icon: '⭐' },
    { id: 'settings', label: '⚙️ Paramètres', icon: '⚙️' },
  ];

  const renderView = () => {
    switch (view) {
      case 'sales':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>📈 Mes ventes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Ventes ce mois</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{formatCurrency(stats.dailyRevenue)}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Nombre de transactions: {stats.transactionCount}</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Moyenne par vente</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{formatCurrency(stats.dailyRevenue / stats.transactionCount)}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Calcul: Total / Nombre</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Croissance</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>+12.5%</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>par rapport au mois dernier</p>
              </div>
            </div>
            {renderTransactionsTable()}
          </div>
        );
      case 'transactions':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>💳 Toutes les transactions</h2>
            {renderTransactionsTable()}
          </div>
        );
      case 'credit':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>⭐ Mon score de crédit</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 16 }}>Score actuel</p>
                <div style={{ fontSize: '3.75rem', fontWeight: 700, color: '#006b3f', marginBottom: 8 }}>{stats.creditScore}</div>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>sur 1000 - <span style={{ color: '#059669', fontWeight: 600 }}>Bon profil ✓</span></p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: 12, padding: 24, border: '2px solid #6ee7b7' }}>
                <p style={{ fontSize: '.875rem', color: '#065f46', fontWeight: 600, marginBottom: 16 }}>Facteurs principaux</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#047857' }}>📊 CA moyen 3 mois</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#047857' }}>214/300 pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#047857' }}>📝 Régularité saisies</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#047857' }}>200/250 pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#047857' }}>✅ Taux annulation</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#047857' }}>170/200 pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>⚙️ Paramètres</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Profil</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 4 }}>Nom complet</p>
                    <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 4 }}>Email</p>
                    <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>{user?.email || 'non renseigné'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 4 }}>Téléphone</p>
                    <p style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>{user?.phone || '+229 90 00 00 00'}</p>
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Compte</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 4 }}>Rôle</p>
                    <span style={{ display: 'inline-block', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>Commerçant</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 4 }}>Statut</p>
                    <span style={{ display: 'inline-block', padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: 20, fontSize: '.75rem', fontWeight: 600 }}>Actif</span>
                  </div>
                  <button style={{ padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                    Modifier le profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Welcome Section */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 8 }}>
                Bienvenue, {user?.firstName || 'Commerçant'} 👋
              </h1>
              <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Voici un aperçu de votre activité aujourd'hui</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <Card title="Chiffre d'affaires" value={formatCurrency(stats.dailyRevenue)} icon="💰" color="green" />
              <Card title="Solde" value={formatCurrency(stats.balance)} icon="💳" color="blue" />
              <Card title="Score de crédit" value={`${stats.creditScore}/1000`} icon="📊" color="purple" />
              <Card title="Transactions" value={stats.transactionCount} icon="📝" color="red" />
            </div>

            {/* Actions Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <button style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}>➕</div>
                <h3 style={{ fontWeight: 600, color: '#111a13', marginBottom: 4 }}>Nouvelle transaction</h3>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Enregistrer une vente ou dépense</p>
              </button>
              <button style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}>💰</div>
                <h3 style={{ fontWeight: 600, color: '#111a13', marginBottom: 4 }}>Demander un crédit</h3>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Accéder à des crédits adaptés</p>
              </button>
              <button style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}>📋</div>
                <h3 style={{ fontWeight: 600, color: '#111a13', marginBottom: 4 }}>Mes documents</h3>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Consulter vos documents certifiés</p>
              </button>
            </div>

            {/* Recent Transactions */}
            {renderTransactionsTable()}
          </>
        );
    }
  };

  const renderTransactionsTable = () => (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13' }}>Transactions récentes</h2>
      </div>
      
      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>
      ) : transactions.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Type</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Description</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Montant</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Date</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 24px', fontSize: '.875rem' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: '.75rem',
                      fontWeight: 600,
                      background: transaction.type === 'VENTE' ? '#dcfce7' : transaction.type === 'DÉPENSE' ? '#fee2e2' : '#dbeafe',
                      color: transaction.type === 'VENTE' ? '#166534' : transaction.type === 'DÉPENSE' ? '#991b1b' : '#1e40af',
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '.875rem', color: '#111a13' }}>{transaction.description}</td>
                  <td style={{ padding: '16px 24px', fontSize: '.875rem', fontWeight: 600, color: transaction.amount > 0 ? '#059669' : '#dc2626' }}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '.875rem', color: '#6b7280' }}>{formatDate(transaction.date)}</td>
                  <td style={{ padding: '16px 24px', fontSize: '.875rem' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Aucune transaction pour le moment</div>
      )}
    </div>
  );

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
