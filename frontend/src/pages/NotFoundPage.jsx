import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fiscx-green to-fiscx-dark">
      <div className="text-center">
        <div className="text-6xl font-bold text-white mb-4">404</div>
        <h1 className="text-4xl font-bold text-white mb-2">Page non trouvée</h1>
        <p className="text-lg text-white/80 mb-8">
          La page que vous recherchez n'existe pas ou a été supprimée.
        </p>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-white text-fiscx-green font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}
