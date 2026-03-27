import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = {
    MERCHANT: [
      { label: 'Tableau de bord', path: '/dashboard', icon: '📊' },
      { label: 'Ventes', path: '/dashboard?view=sales', icon: '📈' },
      { label: 'Transactions', path: '/dashboard?view=transactions', icon: '💳' },
      { label: 'Score crédit', path: '/dashboard?view=credit', icon: '⭐' },
      { label: 'Paramètres', path: '/dashboard?view=settings', icon: '⚙️' },
    ],
    BANKER: [
      { label: 'Tableau de bord', path: '/banker/dashboard', icon: '📊' },
      { label: 'Demandes de crédit', path: '/banker/dashboard?view=loans', icon: '💰' },
      { label: 'Portefeuille', path: '/banker/dashboard?view=portfolio', icon: '📈' },
      { label: 'Commerçants', path: '/banker/dashboard?view=merchants', icon: '👥' },
      { label: 'Rapports', path: '/banker/dashboard?view=reports', icon: '📄' },
    ],
    ADMIN: [
      { label: 'Tableau de bord', path: '/admin/dashboard', icon: '📊' },
      { label: 'Utilisateurs', path: '/admin/dashboard?view=users', icon: '👥' },
      { label: 'Configuration', path: '/admin/dashboard?view=config', icon: '⚙️' },
      { label: 'Journaux', path: '/admin/dashboard?view=logs', icon: '📋' },
      { label: 'Paramètres', path: '/admin/dashboard?view=settings', icon: '🔧' },
    ],
    DGI: [
      { label: 'Tableau de bord', path: '/dgi/dashboard', icon: '📊' },
      { label: 'Bilans', path: '/dgi/dashboard?view=statements', icon: '📑' },
      { label: 'Conformité', path: '/dgi/dashboard?view=compliance', icon: '✅' },
      { label: 'Déclarations', path: '/dgi/dashboard?view=declarations', icon: '📝' },
      { label: 'Statistiques', path: '/dgi/dashboard?view=stats', icon: '📈' },
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
          fontSize: '1.2rem',
        }}>
          🛡️
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
            <span>{item.icon}</span>
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
