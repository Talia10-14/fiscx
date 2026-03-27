# FiscX Backend API

API REST pour la gestion financière certifiée des commerçants béninois.

## Structure

```
src/
├── index.js           # Application principal
├── routes/            # Routes API
├── middleware/        # Middlewares
├── utils/             # Utilitaires
├── db/                # Base de données
├── config/            # Configuration
└── models/            # Models métier
```

## Variables d'environnement

- `NODE_ENV` - Environnement (dev, staging, prod)
- `DATABASE_URL` - URL PostgreSQL
- `REDIS_URL` - URL Redis
- `JWT_SECRET` - Clé secrète JWT
- `PORT` - Port du serveur (défaut: 3000)

## Endpoints principaux

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir token

### Transactions
- `GET /api/transactions` - Lister transactions
- `POST /api/transactions` - Créer transaction
- `GET /api/transactions/stats` - Statistiques

### Crédit
- `GET /api/credit/my-score` - Score personnel
- `GET /api/credit/breakdown` - Décomposition score

### Prêts
- `POST /api/loans` - Créer demande prêt
- `GET /api/loans` - Lister prêts
