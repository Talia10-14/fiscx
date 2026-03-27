import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/transactions/stats');
        setStats(data);
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-fiscx-green text-2xl font-bold">FiscX</h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost"
          >
            Déconnexion
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Tableau de bord</h2>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 mb-2">Ventes totales (30j)</p>
              <p className="text-3xl font-bold text-fiscx-green">
                {(stats.total_sales / 1000).toFixed(0)}K FCFA
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 mb-2">Dépenses totales (30j)</p>
              <p className="text-3xl font-bold text-red-600">
                {(stats.total_expenses / 1000).toFixed(0)}K FCFA
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 mb-2">Bilan net (30j)</p>
              <p className="text-3xl font-bold text-fiscx-navy">
                {((stats.total_sales - stats.total_expenses) / 1000).toFixed(0)}K FCFA
              </p>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
