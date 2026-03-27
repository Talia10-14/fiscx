import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiTrendingUp, FiCreditCard, FiStar, FiSettings, FiDollarSign, FiUsers, FiFileText, FiGitBranch, FiCheck, FiHome } from 'react-icons/fi';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    MERCHANT: [
      { label: 'Tableau de bord', path: '/dashboard', icon: FiBarChart2 },
      { label: 'Ventes', path: '/dashboard?view=sales', icon: FiTrendingUp },
      { label: 'Transactions', path: '/dashboard?view=transactions', icon: FiCreditCard },
      { label: 'Score crédit', path: '/dashboard?view=credit', icon: FiStar },
      { label: 'Paramètres', path: '/dashboard?view=settings', icon: FiSettings },
    ],
    BANKER: [
      { label: 'Tableau de bord', path: '/banker/dashboard', icon: FiBarChart2 },
      { label: 'Demandes de crédit', path: '/banker/dashboard?view=loans', icon: FiDollarSign },
      { label: 'Portefeuille', path: '/banker/dashboard?view=portfolio', icon: FiTrendingUp },
      { label: 'Commerçants', path: '/banker/dashboard?view=merchants', icon: FiUsers },
      { label: 'Rapports', path: '/banker/dashboard?view=reports', icon: FiFileText },
    ],
    ADMIN: [
      { label: 'Tableau de bord', path: '/admin/dashboard', icon: FiBarChart2 },
      { label: 'Utilisateurs', path: '/admin/dashboard?view=users', icon: FiUsers },
      { label: 'Configuration', path: '/admin/dashboard?view=config', icon: FiSettings },
      { label: 'Journaux', path: '/admin/dashboard?view=logs', icon: FiFileText },
      { label: 'Paramètres', path: '/admin/dashboard?view=settings', icon: FiSettings },
    ],
    DGI: [
      { label: 'Tableau de bord', path: '/dgi/dashboard', icon: FiBarChart2 },
      { label: 'Bilans', path: '/dgi/dashboard?view=statements', icon: FiFileText },
      { label: 'Conformité', path: '/dgi/dashboard?view=compliance', icon: FiCheck },
      { label: 'Déclarations', path: '/dgi/dashboard?view=declarations', icon: FiFileText },
      { label: 'Statistiques', path: '/dgi/dashboard?view=stats', icon: FiTrendingUp },
    ],
  };

  const items = menuItems[user?.role] || [];

  return (
    <aside style={{
      width: 240,
      background: '#006b3f',
      color: 'white',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40,
          background: 'rgba(255,255,255,.2)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FiHome size={24} color="white" />
        </div>
        <span style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-.02em' }}>FiscX</span>
      </div>

      {/* Menu Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: location.pathname === item.path || location.pathname === item.path.split('?')[0]
                ? 'rgba(255,255,255,.2)'
                : 'transparent',
              color: 'white',
              fontSize: '.9rem',
              fontWeight: location.pathname === item.path || location.pathname === item.path.split('?')[0] ? 600 : 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all .2s',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
            onMouseEnter={e => !e.currentTarget.style.backgroundColor && (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            onMouseLeave={e => {
              if (!(location.pathname === item.path || location.pathname === item.path.split('?')[0])) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {React.createElement(item.icon, { size: 18 })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Info */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,.1)',
        fontSize: '.75rem',
        color: 'rgba(255,255,255,.6)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>FiscX v1.0</div>
        <div>© 2026 République du Bénin</div>
      </div>
    </aside>
  );
}
