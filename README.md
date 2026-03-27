# 🏦 FiscX — Gestion Financière Certifiée du Secteur Informel Béninois

> **Digitaliser la comptabilité des 800 000+ commerçants béninois** → Accès aux prêts bancaires & conformité fiscale

![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/node->=18-green?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue?style=flat-square)
![Prisma](https://img.shields.io/badge/prisma-5.7.1-blue?style=flat-square)

---

## 📋 Vue d'ensemble

**FiscX** est une **plateforme complète** (web + mobile) pour moderniser la gestion financière béninoise :

✅ **Commerçants** — Enregistrer ventes/dépenses, générer bilans certifiés, demander prêts
✅ **Banquiers** — Consulter dossiers certifiés, scorer clients, traiter prêts
✅ **État (DGI)** — Agrégats fiscaux anonymisés, déclarations automatiques
✅ **Comptables** — Gérer 50+ clients, batch certifications

---

## 🛠️ Stack Technique

### Backend
- **Node.js 18+** + Express.js
- **PostgreSQL 16** + **Prisma ORM** (schema complet)
- **Redis** (cache & sessions)
- **JWT RS256** + bcrypt PIN
- **Docker & Docker Compose**

### Frontend
- **React 18** + Vite (HMR rapide)
- **Tailwind CSS v4** (design system béninois)
- **Zustand** (état global)
- **Axios** (client HTTP)

### Conformité & Sécurité
- **SYSCOHADA** (comptabilité béninoise)
- **CGI Bénin** (règles fiscales)
- **BIC-UEMOA** (score crédit)
- **QR Code anti-falsification**
- **APDP Bénin** (protection données)

---

## 🏗️ Structure du projet

```
fiscx/
├── backend/                    # 🟢 Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # 📊 Schema complet (Users, Transactions, Loans, Certs, etc.)
│   │   ├── migrations/0_init/  # 📝 Migration initiale
│   │   └── seed.js             # 🌱 Données de test (admin, commerçant, banquier)
│   ├── src/
│   │   ├── middleware/         # Auth, Errors, Logging
│   │   ├── routes/             # Auth, Transactions, Loans, Credit, etc.
│   │   ├── utils/              # JWT, Validation
│   │   └── index.js
│   ├── package.json            # 📦 Prisma + Dépendances
│   └── Dockerfile
│
├── frontend/                   # ⚛️ React + Vite
│   ├── src/
│   │   ├── pages/              # Dashboards (Merchant, Banker, Admin)
│   │   ├── components/         # UI réutilisables
│   │   ├── stores/             # Zustand stores
│   │   ├── api/                # Client HTTP (axios)
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docker/
│   ├── Dockerfile.backend      # Multi-stage build + Prisma
│   ├── Dockerfile.frontend
│   ├── entrypoint.sh           # Script migrations auto
│   └── init.sql                # Legacy (remplacé par Prisma)
│
├── docs/
│   ├── BACKEND_SETUP.md
│   └── FRONTEND_SETUP.md
│
├── docker-compose.yml          # PostgreSQL, Redis, Backend, Frontend
├── .env.example                # Variables d'env complètes
└── README.md
```

---

## 🚀 Démarrage rapide

### Option 1️⃣ — Docker (Recommandé)

```bash
# 1. Naviguer dans le bon dossier
cd /home/justalie/Téléchargements/fisc

# 2. Configurer l'env
cp .env.example .env
# Éditer .env si besoin (JWT_SECRET, etc.)

# 3. Démarrer avec Docker Compose
docker-compose up -d

# 4. Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# ✅ Résultats
# Backend API  : http://localhost:3000
# Frontend Web : http://localhost:5173
# Admin DB     : Accès via Prisma Studio (voir ci-dessous)
```

**Test login**
- Phone: `+22993001234`
- PIN: `5678`

### Option 2️⃣ — Développement local (sans Docker)

**Terminal 1 — PostgreSQL**
```bash
# Démarrer PostgreSQL localement ou:
docker-compose up postgres redis
```

**Terminal 2 — Backend**
```bash
cd backend
npm install
npm run dev
# API start sur http://localhost:3000
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm install
npm run dev
# App sur http://localhost:5173
```

---

## 📊 Prisma — Gestion de la DB

### Voir le schéma
```bash
cd backend
npx prisma studio
# Ouvre http://localhost:5555 (UI visuelle)
```

### Créer une migration
```bash
npx prisma migrate dev --name your_migration_name
# Crée la migration + applique
```

### Seeder les données de test
```bash
npm run prisma:seed
# Crée admin, commerçant, banquier test
```

### Reset la DB (⚠️ perte de données)
```bash
npx prisma migrate reset
```

---

## 🔌 API Endpoints

### Auth
```
POST   /auth/register          Inscription OTP
POST   /auth/login             Connexion JWT
GET    /auth/me                Profil du user
POST   /auth/refresh           Nouveau JWT
```

### Transactions
```
GET    /transactions            Lister (avec filtres)
POST   /transactions            Créer (vente/dépense)
GET    /transactions/:id        Détails
PATCH  /transactions/:id         Modifier
DELETE /transactions/:id         Annuler (soft delete)
```

### Loans
```
POST   /loans                  Demander un prêt
GET    /loans                  Mes demandes
GET    /loans/:id              Détails
```

### Credit Score
```
GET    /credit                 Mon score
GET    /credit/breakdown       Détail du scoring
```

### Health
```
GET    /health                 Status API
GET    /health/db              Status DB + Prisma
```

---

## 🔐 Variables d'environnement essentielles

Voir `.env.example` pour la liste complète.

```env
# Database
DATABASE_URL=postgresql://fiscx:fiscx_password@postgres:5432/fiscx_dev

# Auth
JWT_SECRET=your_128_char_min_secret_key
JWT_REFRESH_SECRET=your_128_char_min_secret_key

# API
NODE_ENV=development
PORT=3000
```

---

## 🐳 Commandes Docker

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Arrêter + supprimer volumes (⚠️ perte données)
docker-compose down -v

# Rebuild
docker-compose build --no-cache

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Accéder au backend
docker-compose exec backend sh
```

---

## ✅ Checklist Démarrage

- [ ] Cloner / naviguer dans `/home/justalie/Téléchargements/fisc`
- [ ] `cp .env.example .env`
- [ ] `docker-compose up -d`
- [ ] Attendre 30s (migrations Prisma)
- [ ] Ouvrir http://localhost:5173
- [ ] Login avec +22993001234 / 5678

---

## 📚 Documentation complète

- **Backend Setup** → [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md)
- **Frontend Setup** → [docs/FRONTEND_SETUP.md](docs/FRONTEND_SETUP.md)
- **Roadmap** → [FiscX_Bénin_Roadmap_Complète.docx](FiscX_Bénin_Roadmap_Complète.docx)
- **Specs** → [benin_cahier_des_charges.docx](benin_cahier_des_charges.docx)

---

## 📞 Support

- 📧 contact@fiscx.bj
- 🐛 Issues / PRs bienvenues
- 💬 Passer locale Bénin

---

## 📄 License

MIT © 2026 FiscX

**🇧🇯 Made with ❤️ for Benin**

- Python 3.9+ (scripts)
- PostgreSQL 16
- Docker & Docker Compose

### Installation Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

L'API sera disponible sur `http://localhost:3000`

### Installation Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

---

## 📱 6 Profils Utilisateurs

| Profil | Interface | Rôle |
|--------|-----------|------|
| 🛒 **Commerçant** | App Web | Saisit ventes/dépenses, consulte score |
| 👨‍💼 **Comptable** | App Web | Gère 50+ commerçants, génère bilans masse |
| 🏦 **Agent Bancaire** | Dashboard Web | Consulte dossiers certifiés |
| 🏛️ **Régulateur (DGI)** | Portail Web | Agrégats anonymisés |
| ⚙️ **Admin** | Back-Office | Gère configuration, règles fiscales |
| 🤝 **Partenaire KYC** | API | Vérification identité |

---

## 📅 Roadmap (18 mois)

- **Phase 0** (2 sem) : Fondations techniques ✅
- **Phase 1** (6 sem) : MVP Web Commerçant 🚧
- **Phase 2** (4 sem) : Fiscalité & SYSCOHADA
- **Phase 3** (5 sem) : Score Crédit & Banques
- **Phase 4** (4 sem) : Régulateur (DGI)
- **Phase 5** (4 sem) : Multilingue (Fon, Yoruba, Bariba)

---

## 🔐 Conformité & Sécurité

✅ **APDP Bénin** — Protection données  
✅ **DGI Bénin** — Taxe Synthétique CGI  
✅ **SYSCOHADA Révisé** — Normes comptables OHADA  
✅ **BIC-UEMOA** — Scoring crédit  
✅ **ISO 27001** — Sécurité information  

---

## 📖 Documentation

- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Frontend Setup](./docs/FRONTEND_SETUP.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Endpoints](./docs/API_ENDPOINTS.md)
- [Compliance](./docs/COMPLIANCE.md)

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📄 Licence

*À définir — Licensing gouvernemental Bénin*

© 2026 FiscX — République du Bénin
