import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiDollarSign, FiCreditCard, FiBarChart2, FiStar, FiTrendingUp, FiPlus, FiUser, FiSettings, FiSearch, FiX, FiCheck, FiFileText, FiUsers } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { showSuccess, showError } from '../utils/toast';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'VENTE',
    amount: '',
    description: '',
  });
  const [creditData, setCreditData] = useState({
    requestedAmount: '',
    reason: '',
    duration: 12,
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
  });

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      if (!formData.amount || formData.amount <= 0) {
        showError('Le montant doit être supérieur à 0');
        return;
      }
      // TODO: Replace with API call
      // const { data } = await api.post('/transactions', formData);
      const newTransaction = {
        id: transactions.length + 1,
        ...formData,
        amount: parseFloat(formData.amount) * (formData.type === 'DÉPENSE' ? -1 : 1),
        date: new Date().toISOString(),
        status: 'COMPLÉTÉ',
      };
      setTransactions([newTransaction, ...transactions]);
      setFormData({ type: 'VENTE', amount: '', description: '' });
      setShowTransactionModal(false);
      showSuccess(`Transaction de ${formatCurrency(newTransaction.amount)} enregistrée !`);
    } catch (error) {
      console.error('Error adding transaction:', error);
      showError('Erreur lors de l\'ajout de la transaction');
    }
  };

  const handleCreditRequest = async (e) => {
    e.preventDefault();
    try {
      if (!creditData.requestedAmount || creditData.requestedAmount <= 0) {
        showError('Le montant doit être supérieur à 0');
        return;
      }
      if (!creditData.reason || creditData.reason.trim().length === 0) {
        showError('Veuillez décrire la raison de la demande');
        return;
      }
      // TODO: Replace with API call
      // await api.post('/credit/request', creditData);
      setCreditData({ requestedAmount: '', reason: '', duration: 12 });
      setShowCreditModal(false);
      showSuccess(`Demande de crédit de ${formatCurrency(creditData.requestedAmount)} soumise !`);
    } catch (error) {
      console.error('Error requesting credit:', error);
      showError('Erreur lors de la demande de crédit');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!profileData.firstName || !profileData.lastName) {
        showError('Le prénom et le nom sont obligatoires');
        return;
      }
      // TODO: Replace with API call
      // await api.put('/profile', profileData);
      setShowProfileModal(false);
      showSuccess('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Erreur lors de la mise à jour du profil');
    }
  };

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

  // Render transactions table before renderView
  const renderTransactionsTable = () => {
    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === '' || t.type === filterType;
      return matchesSearch && matchesType;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    return (
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Transactions récentes</h2>
          
          {/* Search and Filter Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 12 }}>
            <input
              type="text"
              placeholder="🔍 Rechercher une transaction..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <select
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
              style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            >
              <option value="">Tous les types</option>
              <option value="VENTE">Ventes</option>
              <option value="DÉPENSE">Dépenses</option>
              <option value="RETRAIT">Retraits</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>
        ) : paginatedTransactions.length > 0 ? (
          <>
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
                  {paginatedTransactions.map((transaction) => (
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '.875rem' }}>
                <span>{filteredTransactions.length} transaction(s) • Page {currentPage}/{totalPages}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', background: currentPage === 1 ? '#e5e7eb' : '#006b3f', color: currentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '.75rem', fontWeight: 600 }}>
                    ← Précédent
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', background: currentPage === totalPages ? '#e5e7eb' : '#006b3f', color: currentPage === totalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '.75rem', fontWeight: 600 }}>
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiFileText size={32} />
            </div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>Aucune transaction</p>
            <p style={{ fontSize: '.875rem', color: '#9ca3af' }}>{searchTerm ? 'Aucune transaction correspondant à votre recherche' : 'Commencez par enregistrer une transaction'}</p>
          </div>
        )}
      </div>
    );
  };

  // Render different views based on query param
  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'sales', label: 'Mes ventes' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'credit', label: 'Score de crédit' },
    { id: 'settings', label: 'Paramètres' },
  ];

  const getTabIcon = (tabId) => {
    const iconProps = { size: 18, style: { marginRight: 8 } };
    switch (tabId) {
      case 'dashboard': return <FiBarChart2 {...iconProps} />;
      case 'sales': return <FiTrendingUp {...iconProps} />;
      case 'transactions': return <FiCreditCard {...iconProps} />;
      case 'credit': return <FiStar {...iconProps} />;
      case 'settings': return <FiSettings {...iconProps} />;
      default: return null;
    }
  };

  const renderView = () => {
    switch (view) {
      case 'sales':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', margin: 0, display: 'flex', alignItems: 'center' }}>
                <FiTrendingUp size={32} style={{ marginRight: 12 }} />
                Mes ventes
              </h2>
              <button onClick={() => setShowTransactionModal(true)} style={{ padding: '10px 20px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FiPlus size={18} style={{ marginRight: 6 }} />
                Ajouter une vente
              </button>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', margin: 0, display: 'flex', alignItems: 'center' }}>
                <FiCreditCard size={32} style={{ marginRight: 12 }} />
                Toutes les transactions
              </h2>
              <button onClick={() => setShowTransactionModal(true)} style={{ padding: '10px 20px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FiPlus size={18} style={{ marginRight: 6 }} />
                Ajouter une transaction
              </button>
            </div>
            {renderTransactionsTable()}
          </div>
        );
      case 'credit':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiStar size={32} style={{ marginRight: 12 }} />
              Mon score de crédit
            </h2>
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
                    <span style={{ fontSize: '.875rem', color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}><FiBarChart2 size={16} /> CA moyen 3 mois</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#047857' }}>214/300 pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}><FiFileText size={16} /> Régularité saisies</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: '#047857' }}>200/250 pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '.875rem', color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}><FiCheck size={16} /> Taux annulation</span>
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
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiSettings size={32} style={{ marginRight: 12 }} />
              Paramètres
            </h2>
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
                  <button onClick={() => setShowProfileModal(true)} style={{ padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
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
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                <FiUsers size={32} style={{ marginRight: 12 }} />
                Bienvenue, {user?.firstName || 'Commerçant'}
              </h1>
              <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Voici un aperçu de votre activité aujourd'hui</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <Card title="Chiffre d'affaires" value={formatCurrency(stats.dailyRevenue)} icon={<FiDollarSign size={32} />} color="green" />
              <Card title="Solde" value={formatCurrency(stats.balance)} icon={<FiCreditCard size={32} />} color="blue" />
              <Card title="Score de crédit" value={`${stats.creditScore}/1000`} icon={<FiStar size={32} />} color="purple" />
              <Card title="Transactions" value={stats.transactionCount} icon={<FiFileText size={32} />} color="red" />
            </div>

            {/* Actions Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <button onClick={() => setShowTransactionModal(true)} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}><FiPlus size={32} color="#006b3f" /></div>
                <h3 style={{ fontWeight: 600, color: '#111a13', marginBottom: 4 }}>Nouvelle transaction</h3>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Enregistrer une vente ou dépense</p>
              </button>
              <button onClick={() => setShowCreditModal(true)} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}><FiDollarSign size={32} color="#f59e0b" /></div>
                <h3 style={{ fontWeight: 600, color: '#111a13', marginBottom: 4 }}>Demander un crédit</h3>
                <p style={{ fontSize: '.875rem', color: '#6b7280' }}>Accéder à des crédits adaptés</p>
              </button>
              <button style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', textAlign: 'left', cursor: 'pointer', transition: 'all .2s', border: 'none' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,.1)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.1)'}>
                <div style={{ fontSize: '1.875rem', marginBottom: 12 }}><FiBarChart2 size={32} color="#8b5cf6" /></div>
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

  // Modal Styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    background: 'white',
    borderRadius: 16,
    padding: 32,
    maxWidth: 500,
    width: '90%',
    boxShadow: '0 20px 25px rgba(0,0,0,.15)',
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
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => view !== tab.id && (e.currentTarget.style.color = '#111a13')}
              onMouseLeave={e => view !== tab.id && (e.currentTarget.style.color = '#6b7280')}
            >
              {getTabIcon(tab.id)}
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

      {/* Modal: Add Transaction */}
      {showTransactionModal && (
        <div style={modalOverlayStyle} onClick={() => setShowTransactionModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiPlus size={28} style={{ marginRight: 10 }} />
              Nouvelle transaction
            </h2>
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Type de transaction</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit' }}
                >
                  <option value="VENTE">Vente</option>
                  <option value="DÉPENSE">Dépense</option>
                  <option value="RETRAIT">Retrait</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Montant (FCFA)</label>
                <input
                  type="number"
                  step="100"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Vente de pagnes"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowTransactionModal(false)} style={{ flex: 1, padding: '12px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Profile */}
      {showProfileModal && (
        <div style={modalOverlayStyle} onClick={() => setShowProfileModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiUser size={28} style={{ marginRight: 10 }} />
              Modifier mon profil
            </h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Prénom</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder="Jean"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Nom</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder="Dupont"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="jean@example.com"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Téléphone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+229 90 00 00 00"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Adresse</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="123 Rue de la Paix"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Ville</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="Cotonou"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowProfileModal(false)} style={{ flex: 1, padding: '12px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Credit */}
      {showCreditModal && (
        <div style={modalOverlayStyle} onClick={() => setShowCreditModal(false)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiDollarSign size={28} style={{ marginRight: 10 }} />
              Demander un crédit
            </h2>
            <form onSubmit={handleCreditRequest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Montant demandé (FCFA)</label>
                <input
                  type="number"
                  step="1000"
                  value={creditData.requestedAmount}
                  onChange={e => setCreditData({ ...creditData, requestedAmount: e.target.value })}
                  placeholder="Ex: 500000"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Raison de la demande</label>
                <textarea
                  value={creditData.reason}
                  onChange={e => setCreditData({ ...creditData, reason: e.target.value })}
                  placeholder="Décrivez comment vous allez utiliser ce crédit..."
                  rows="4"
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Durée du crédit (mois)</label>
                <select
                  value={creditData.duration}
                  onChange={e => setCreditData({ ...creditData, duration: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit' }}
                >
                  <option value="3">3 mois</option>
                  <option value="6">6 mois</option>
                  <option value="12">12 mois</option>
                  <option value="24">24 mois</option>
                </select>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 12 }}>
                  💡 Votre score de crédit actuel est <span style={{ fontWeight: 600, color: '#006b3f' }}>{stats.creditScore}/1000</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowCreditModal(false)} style={{ flex: 1, padding: '12px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Soumettre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );



  return (
    <>
      <ToastContainer />
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
    </>
  );
}
