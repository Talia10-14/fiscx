import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleIcons = {
    MERCHANT: '🛍️',
    BANKER: '🏦',
    ADMIN: '👨‍💼',
    DGI: '📋',
  };

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111a13', margin: 0 }}>
          {roleIcons[user?.role]} Dashboard
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: '#f0faf5',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 600,
            color: '#006b3f',
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '.875rem', fontWeight: 600, color: '#111a13' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '.75rem', color: '#9aa394' }}>
              {user?.role === 'MERCHANT' && 'Commerçant'}
              {user?.role === 'BANKER' && 'Banquier'}
              {user?.role === 'ADMIN' && 'Administrateur'}
              {user?.role === 'DGI' && 'Agent DGI'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #d8ddd4',
            background: 'white',
            color: '#1a2318',
            fontSize: '.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all .2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#006b3f';
            e.currentTarget.style.color = '#006b3f';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#d8ddd4';
            e.currentTarget.style.color = '#1a2318';
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
