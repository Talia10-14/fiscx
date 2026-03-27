import React from 'react';

export default function Card({ title, value, icon, color = 'blue' }) {
  const colorMap = {
    blue: '#1e40af',
    green: '#059669',
    purple: '#7c3aed',
    red: '#dc2626',
    amber: '#d97706',
  };

  const bgColorMap = {
    blue: '#eff6ff',
    green: '#f0fdf4',
    purple: '#f5f3ff',
    red: '#fef2f2',
    amber: '#fffbeb',
  };

  return (
    <div style={{
      background: bgColorMap[color] || bgColorMap.blue,
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      border: `1px solid ${colorMap[color]}20`,
    }}>
      <div style={{
        fontSize: '2rem',
        lineHeight: 1,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '.875rem',
          color: '#6b7280',
          fontWeight: 500,
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          color: colorMap[color] || colorMap.blue,
          fontFamily: "'JetBrains Mono','monospace'",
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
