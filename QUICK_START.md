# 🚀 FiscX — Guide de démarrage rapide (Quick Start)

## Phase inaugurale : Web (Commerçant + Banques)

Bienvenue dans le projet **FiscX Bénin** ! Ce guide te permet de démarrer en 5 minutes.

---

## 📋 Prérequis

- **Node.js 18+** + npm
- **PostgreSQL 16** (ou Docker)
- **Git**

---

## ⚡ Démarrage rapide (Docker Compose)

### 1️⃣ Clone & navigation

```bash
cd /home/justalie/fiscx-project
```

### 2️⃣ Configuration environnement

```bash
cp .env.example .env
```

Édite `.env` si nécessaire (ports, BD, clés JWT).

### 3️⃣ Démarrage complet (système complet)

```bash
docker-compose up -d
```

Cela démarre :
- ✅ PostgreSQL (port 5432)
- ✅ Redis (port 6379)
- ✅ Backend API (port 3000)
- ✅ Frontend Web (port 5173)

### 4️⃣ Vérifier le statut

```bash
docker-compose ps
docker-compose logs -f backend
```

---

## 🛠️ Démarrage manuel (développement local)

###  Backend

```bash
cd backend
cp ../.env.example .env
npm install
npm run dev
```

L'API démarre sur `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app web démarre sur `http://localhost:5173`

---

## 🧪 Test des endpoints

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@test.bj",
    "password": "password123",
    "profile_type": "merchant",
    "full_name": "Test Merchant"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@test.bj",
    "password": "password123"
  }'
```

---

## 📱 Interface Web

- **Login** : http://localhost:5173/login
- **Dashboard** : http://localhost:5173/dashboard (après conenxion)

---

## 🗂️ Structure du projet

```
fiscx-project/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── routes/       # Endpoints API
│   │   ├── middleware/   # Auth, Errors
│   │   ├── db/           # Connexion BD
│   │   └── utils/        # JWT, validation
│   └── package.json
├── frontend/             # App React
│   ├── src/
│   │   ├── pages/        # Login, Dashboard
│   │   ├── stores/       # Zustand (auth)
│   │   ├── api/          # Client Axios
│   │   └── index.css     # TailwindCSS
│   └── package.json
├── docker/               # Docker configs
├── docs/                 # Documentation
├── docker-compose.yml    # Orchestration
└── README.md
```

---

## 🔑 Variables d'environnement essentielles

```env
# Backend
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://fiscx:fiscx_password@localhost:5432/fiscx_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_1024_bits_minimum

# Frontend
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Dépannage

### PostgreSQL refuse la connexion
```bash
# Vérifier le statut du conteneur
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

### Port 3000 déjà utilisé
```bash
# Tuer le process
lsof -i :3000 | kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Frontend ne se reconnecte pas après API restart
```bash
# Vider le cache du navigateur (F12 → Storage → Clear)
# Puis rafraîchir
```

---

## 📚 Documentation complète

- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Frontend Setup](./docs/FRONTEND_SETUP.md)
- [API Endpoints](./docs/API_ENDPOINTS.md) *(à compléter)*
- [Database Schema](./docs/DATABASE_SCHEMA.md) *(à compléter)*

---

## 🚀 Prochaines étapes

1. **Phase 0** ✅ Fondations (en cours)
   - [x] Estructura projet
   - [x] Auth JWT
   - [x] Base de donnés schema
   - [ ] Tests endpoint
   
2. **Phase 1** (MVP Commerçant)
   - [ ] Saisie transactions complète
   - [ ] Gestion stock
   - [ ] Export CSV
   - [ ] Mode offline (app mobile uniquement)

3. **Phase 2** (Fiscalité)
   - [ ] Moteur Taxe Synthétique
   - [ ] Génération bilans SYSCOHADA
   - [ ] QR code certification

---

## 💬 Questions ?

Voir les documents du projet dans `/Téléchargements/fisc/` :
- `FiscX_Bénin_Roadmap_Complète.docx` — Roadmap complète
- `TaxBridge_Document_Technique.docx` — Architecture détaillée
- `benin_cahier_des_charges.docx` — Spécifications fonctionnelles

---

**Bon développement ! 🎉**
