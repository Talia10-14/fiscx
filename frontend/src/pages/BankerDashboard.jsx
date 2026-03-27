import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiCheck, FiX, FiTrendingUp, FiUsers, FiFileText, FiBarChart2, FiHome, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import { showSuccess, showError } from '../utils/toast';
import api from '../api/client';

export default function BankerDashboard() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get('view') || 'dashboard';

  const [stats, setStats] = useState({
    pendingLoans: 12,
    approvedLoans: 45,
    totalPortfolio: 5200000,
    merchantCount: 234,
  });
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanDecision, setLoanDecision] = useState({
    status: 'APPROVED',
    approvedAmount: '',
    interestRate: 8,
    comment: '',
  });

  useEffect(() => {
    fetchBankerData();
  }, []);

  const handleLoanDecision = async (e) => {
    e.preventDefault();
    try {
      if (loanDecision.status === 'APPROVED' && (!loanDecision.approvedAmount || loanDecision.approvedAmount <= 0)) {
        showError('Le montant approuvé doit être supérieur à 0');
        return;
      }
      if (loanDecision.status === 'APPROVED' && (!loanDecision.interestRate || loanDecision.interestRate < 0)) {
        showError('Le taux d\'intérêt doit être valide');
        return;
      }
      // TODO: Replace with API call
      // await api.post(`/banker/loans/${selectedLoan.id}/decision`, loanDecision);
      showSuccess(`Décision enregistrée: ${loanDecision.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'}`);
      setSelectedLoan(null);
      setLoanDecision({ status: 'APPROVED', approvedAmount: '', interestRate: 8, comment: '' });
    } catch (error) {
      console.error('Error making loan decision:', error);
      showError('Erreur lors de l\'enregistrement de la décision');
    }
  };

  const fetchBankerData = async () => {
    try {
      setLoading(true);
      setLoanRequests([
        {
          id: 1,
          merchantName: 'Aliou Diallo',
          phone: '+22993001234',
          requestedAmount: 500000,
          creditScore: 750,
          status: 'PENDING',
          submittedAt: '2024-01-15T10:30:00',
          businessType: 'Textile',
          monthlyRevenue: 1200000,
        },
        {
          id: 2,
          merchantName: 'Fatou Sow',
          phone: '+22991456789',
          requestedAmount: 250000,
          creditScore: 620,
          status: 'PENDING',
          submittedAt: '2024-01-14T14:15:00',
          businessType: 'Épicerie',
          monthlyRevenue: 850000,
        },
        {
          id: 3,
          merchantName: 'Ibrahim Kante',
          phone: '+22995678901',
          requestedAmount: 750000,
          creditScore: 802,
          status: 'PENDING',
          submittedAt: '2024-01-13T09:45:00',
          businessType: 'Électronique',
          monthlyRevenue: 2100000,
        },
      ]);
    } catch (error) {
      console.error('Error fetching banker data:', error);
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

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'requests', label: 'Demandes en attente' },
    { id: 'portfolio', label: 'Mon portefeuille' },
    { id: 'merchants', label: 'Commerçants' },
  ];

  const getTabIcon = (tabId) => {
    const iconProps = { size: 18, style: { marginRight: 8 } };
    switch (tabId) {
      case 'dashboard': return <FiBarChart2 {...iconProps} />;
      case 'requests': return <FiCheck {...iconProps} />;
      case 'portfolio': return <FiTrendingUp {...iconProps} />;
      case 'merchants': return <FiUsers {...iconProps} />;
      default: return null;
    }
  };

  const renderView = () => {
    switch (view) {
      case 'requests':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiAlertCircle size={32} style={{ marginRight: 12 }} />
              Demandes en attente
            </h2>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>
              ) : loanRequests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Commerçant</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Secteur</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Montant demandé</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Score de crédit</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Date</th>
                        <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanRequests.map((request) => (
                        <tr key={request.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', fontWeight: 500, color: '#111a13' }}>
                            {request.merchantName}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', color: '#6b7280' }}>{request.businessType}</td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>
                            {formatCurrency(request.requestedAmount)}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: '.75rem',
                              fontWeight: 600,
                              background: request.creditScore >= 700 ? '#dcfce7' : request.creditScore >= 600 ? '#fef3c7' : '#fee2e2',
                              color: request.creditScore >= 700 ? '#166534' : request.creditScore >= 600 ? '#92400e' : '#991b1b',
                            }}>
                              {request.creditScore}/1000
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', color: '#6b7280' }}>{formatDate(request.submittedAt)}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedLoan(request)} style={{ padding: '6px 12px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 6, fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all .2s', marginRight: 8 }} onMouseEnter={e => e.currentTarget.style.background = '#005232'} onMouseLeave={e => e.currentTarget.style.background = '#006b3f'}>Examiner</button>
                            <button onClick={() => setSelectedLoan(request)} style={{ padding: '6px 12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 6, fontSize: '.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = '#d1d5db'} onMouseLeave={e => e.currentTarget.style.background = '#e5e7eb'}>Rejeter</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Aucune demande en attente</div>
              )}
            </div>
          </div>
        );
      case 'portfolio':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24 }}>💼 Mon portefeuille</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Crédits approuvés</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{stats.approvedLoans}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Crédits actifs</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Total portefeuille</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{formatCurrency(stats.totalPortfolio)}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Montant en circulation</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Taux de remboursement</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>98.5%</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Excellence de performance</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Crédits en cours</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Commerçant</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Montant</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Remboursé</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { merchant: 'Afi Koudossou', amount: 500000, repaid: 125000, status: 'En cours' },
                      { merchant: 'Moussa Bello', amount: 250000, repaid: 250000, status: 'Remboursé' },
                      { merchant: 'Romuald Akakpo', amount: 750000, repaid: 375000, status: 'En cours' },
                    ].map((credit, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 500 }}>{credit.merchant}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 600 }}>{formatCurrency(credit.amount)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#059669', fontWeight: 600 }}>{formatCurrency(credit.repaid)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem' }}>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: credit.status === 'Remboursé' ? '#dcfce7' : '#fef3c7', color: credit.status === 'Remboursé' ? '#166534' : '#92400e' }}>
                            {credit.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'merchants':
        return (
          <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <FiUsers size={32} style={{ marginRight: 12 }} />
              Commerçants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Total commerçants</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>{stats.merchantCount}</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Partenaires actifs</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Score moyen</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#006b3f', marginBottom: 4 }}>724</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>sur 1000</p>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
                <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 8 }}>Nouveaux ce mois</p>
                <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#059669', marginBottom: 4 }}>+24</div>
                <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>Croissance +8.5%</p>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13', marginBottom: 16 }}>Top commerçants</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Commerçant</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Score</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>CA mensuel</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { merchant: 'Afi Koudossou', score: 782, ca: 1200000, status: 'Actif' },
                      { merchant: 'Moussa Bello', score: 741, ca: 890000, status: 'Actif' },
                      { merchant: 'Romuald Akakpo', score: 698, ca: 1500000, status: 'Actif' },
                      { merchant: 'Fatou Sow', score: 620, ca: 450000, status: 'Actif' },
                      { merchant: 'Ibrahim Kante', score: 802, ca: 2100000, status: 'En attente' },
                    ].map((merchant, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 500 }}>{merchant.merchant}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem' }}>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: merchant.score >= 700 ? '#dcfce7' : merchant.score >= 600 ? '#fef3c7' : '#fee2e2', color: merchant.score >= 700 ? '#166534' : merchant.score >= 600 ? '#92400e' : '#991b1b' }}>
                            {merchant.score}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem', color: '#111a13', fontWeight: 600 }}>{formatCurrency(merchant.ca)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '.875rem' }}>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
                            {merchant.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111a13', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                <FiHome size={32} style={{ marginRight: 12 }} />
                Tableau de bord banquier
              </h1>
              <p style={{ fontSize: '.9rem', color: '#6b7280' }}>Gestion des demandes de crédit et portefeuille</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
              <Card title="Demandes en attente" value={stats.pendingLoans} icon={<FiAlertCircle size={32} />} color="blue" />
              <Card title="Crédits approuvés" value={stats.approvedLoans} icon={<FiCheck size={32} />} color="green" />
              <Card title="Portefeuille total" value={formatCurrency(stats.totalPortfolio)} icon={<FiBarChart2 size={32} />} color="purple" />
              <Card title="Commerçants" value={stats.merchantCount} icon={<FiUsers size={32} />} color="red" />
            </div>

            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.1)', overflow: 'hidden' }}>
              <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111a13' }}>Dernières demandes de crédit</h2>
              </div>

              {loading ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Chargement...</div>
              ) : loanRequests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Commerçant</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Montant</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Score</th>
                        <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: '.875rem', fontWeight: 600, color: '#374151' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loanRequests.slice(0, 5).map((request) => (
                        <tr key={request.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', fontWeight: 500, color: '#111a13' }}>
                            {request.merchantName}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>
                            {formatCurrency(request.requestedAmount)}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '.875rem' }}>
                            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, background: request.creditScore >= 700 ? '#dcfce7' : request.creditScore >= 600 ? '#fef3c7' : '#fee2e2', color: request.creditScore >= 700 ? '#166534' : request.creditScore >= 600 ? '#92400e' : '#991b1b' }}>
                              {request.creditScore}/1000
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button style={{ padding: '6px 12px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 6, fontSize: '.85rem', fontWeight: 500, cursor: 'pointer' }}>Examiner</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>Aucune demande</div>
              )}
            </div>
          </>
        );
    }
  };

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

      {/* Modal: Loan Decision */}
      {selectedLoan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedLoan(null)}>
          <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111a13', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <FiFileText size={28} style={{ marginRight: 10 }} />
              Examiner demande de crédit
            </h2>
            <p style={{ fontSize: '.875rem', color: '#6b7280', marginBottom: 24 }}>{selectedLoan.merchantName} - {selectedLoan.businessType}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, padding: '16px', background: '#f9fafb', borderRadius: 12 }}>
              <div>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 4 }}>Montant demandé</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111a13' }}>{formatCurrency(selectedLoan.requestedAmount)}</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 4 }}>Score crédit</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#006b3f' }}>{selectedLoan.creditScore}/1000</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 4 }}>CA mensuel</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111a13' }}>{formatCurrency(selectedLoan.monthlyRevenue)}</p>
              </div>
              <div>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginBottom: 4 }}>Demandé le</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111a13' }}>{formatDate(selectedLoan.submittedAt).split(' ')[0]}</p>
              </div>
            </div>

            <form onSubmit={handleLoanDecision} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Décision</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setLoanDecision({ ...loanDecision, status: 'APPROVED' })}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: loanDecision.status === 'APPROVED' ? '#dcfce7' : '#f9fafb',
                      color: loanDecision.status === 'APPROVED' ? '#166534' : '#6b7280',
                      border: `2px solid ${loanDecision.status === 'APPROVED' ? '#6ee7b7' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: '.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanDecision({ ...loanDecision, status: 'REJECTED' })}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: loanDecision.status === 'REJECTED' ? '#fee2e2' : '#f9fafb',
                      color: loanDecision.status === 'REJECTED' ? '#991b1b' : '#6b7280',
                      border: `2px solid ${loanDecision.status === 'REJECTED' ? '#fca5a5' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: '.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✗ Rejeter
                  </button>
                </div>
              </div>

              {loanDecision.status === 'APPROVED' && (
                <>
                  <div>
                    <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Montant à approuver (FCFA)</label>
                    <input
                      type="number"
                      step="1000"
                      value={loanDecision.approvedAmount}
                      onChange={e => setLoanDecision({ ...loanDecision, approvedAmount: e.target.value })}
                      placeholder={selectedLoan.requestedAmount}
                      required
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Taux d'intérêt annuel (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="25"
                      value={loanDecision.interestRate}
                      onChange={e => setLoanDecision({ ...loanDecision, interestRate: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13', display: 'block', marginBottom: 8 }}>Commentaires</label>
                <textarea
                  value={loanDecision.comment}
                  onChange={e => setLoanDecision({ ...loanDecision, comment: e.target.value })}
                  placeholder="Justification de votre décision..."
                  rows="4"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '.875rem', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setSelectedLoan(null)} style={{ flex: 1, padding: '12px 16px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px 16px', background: '#006b3f', color: 'white', border: 'none', borderRadius: 8, fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Enregistrer décision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
