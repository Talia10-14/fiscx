# 📋 CHANGELOG — FiscX Backend
> Format : Keep a Changelog — Versioning Sémantique

---

## [Unreleased] — En cours de construction

### 🔜 À faire (Sprint 0 — priorité absolue)
- Migration `db/` → Prisma ORM avec schéma versionné
- JWT HS256 → RS256 (paire de clés asymétrique)
- Hash Chain sur transactions (immuabilité légale)
- NO DELETE PostgreSQL au niveau moteur
- RLS (Row-Level Security) isolation utilisateurs
- Rate limiting Redis-backed

---

## [0.1.0] — Mars 2026 — Setup Initial ✅

### ✅ Existant (confirmé par BACKEND_SETUP.md)

**Structure**
- `src/index.js` — point d'entrée Express
- `src/routes/` — routes Auth, Transactions, Crédit, Prêts
- `src/middleware/` — auth, errors
- `src/utils/` — JWT, validation
- `src/db/` — connexion base de données (raw pg ou knex)
- `src/models/` — modèles métier
- `src/config/` — configuration

**Endpoints fonctionnels**
- `POST /api/auth/register` — inscription
- `POST /api/auth/login` — connexion
- `POST /api/auth/refresh` — rafraîchir token
- `GET /api/transactions` — liste transactions
- `POST /api/transactions` — créer transaction
- `GET /api/transactions/stats` — statistiques basiques
- `GET /api/credit/my-score` — score (implémentation basique)
- `GET /api/credit/breakdown` — décomposition score (basique)
- `POST /api/loans` — créer demande prêt
- `GET /api/loans` — liste prêts

### ⚠️ Problèmes Critiques Identifiés (à corriger Sprint 0)

| # | Problème | Impact | Sprint |
|---|----------|--------|--------|
| 1 | `JWT_SECRET` (HS256) au lieu de RS256 | Sécurité insuffisante — clé symétrique | S0 |
| 2 | `db/` raw au lieu de Prisma | Pas de migrations versionnées, pas de type safety | S0 |
| 3 | Pas de hash_chain sur transactions | Données non immuables légalement | S0 |
| 4 | Pas de table audit_logs | Aucune traçabilité des actions | S0 |
| 5 | Pas de règle NO DELETE moteur DB | Suppression possible (fraude) | S0 |
| 6 | Pas de RLS PostgreSQL | Un user peut voir données d'un autre | S0 |
| 7 | Pas de rate limiting | Attaques brute-force possibles | S0 |
| 8 | Score crédit non explicable | Non conforme CdC v2 (transparence algorithmique) | S4 |
| 9 | Pas de device fingerprint | Manque traçabilité légale appareil | S0 |
| 10 | Prêts sans vérification KYC/consentement | Non conforme BCEAO | S5 |

---

## [0.0.1] — Février 2026 — Cahier des Charges v1

### 📝 Décisions initiales
- Cible : commerçants informels Bénin / Afrique subsaharienne
- Stack choisie : Node.js + Express + PostgreSQL + Redis
- 6 profils : Merchant, Accountant, Banker, DGI, Admin, KYC Partner

### ❌ Problèmes v1 (corrigés dans CdC v2.0)
- **IMEI dans logs** : illégal RGPD, bloqué Android 10+ → remplacé par Device UUID SHA-256
- **Pas de stratégie offline/sync** → idempotence UUID ajoutée
- **Score opaque** → grille 5 critères transparents et explicables
- **Langues locales au MVP** → irréaliste techniquement, décalé Phase 4
- **Volumétrie documents ignorée** → politique WebP + R2 + rétention 7 ans
- **Planning 3 mois** → révisé à 4,5 mois

---

## 📌 Architecture Decision Records (ADR)

### ADR-001 — Prisma vs Raw SQL
**Décision** : Migrer vers Prisma (depuis `db/` actuel)
**Raison** : Migrations versionnées, type safety, introspection PostgreSQL, écosystème mature.
**Migration** : Remplacer progressivement en commençant par les nouvelles routes.

### ADR-002 — JWT RS256 vs HS256
**Décision** : Passer RS256 (clé privée signe, clé publique vérifie)
**Raison** : Clé publique partageable avec services tiers (banques, KYC). HS256 nécessite de partager le secret.
**Attention** : Breaking change — invalider tous les tokens existants lors du déploiement.

### ADR-003 — Hash Chain vs Blockchain
**Décision** : Hash Chain en PostgreSQL
**Raison** : Proportionné au MVP. Reconnu légalement. Vérifiable sans outillage spécialisé.
**Révision** : Phase 4 si régulateur BCEAO exige blockchain.

### ADR-004 — Stock calculé à la volée
**Décision** : `stock = SUM(PURCHASE) - SUM(SALE) + SUM(ADJUSTMENT)` par agrégation Prisma
**Raison** : Cohérence avec immuabilité. Évite conflits sync offline. Source de vérité unique.
**Coût** : Requête agrégée à chaque consultation — accepter avec index sur `(user_id, product_id, type)`.

### ADR-005 — Cloudflare R2 pour stockage
**Décision** : R2 (15 $/TB/mois, 0 $ egress) vs S3 (23 $/TB + 90 $/TB egress)
**Raison** : Coût egress nul critique pour 9 TB/an (10k users × 5 reçus/jour).

### ADR-006 — Consentement bancaire 90 jours
**Décision** : Scopes granulaires + TTL 90 jours + révocable immédiatement
**Raison** : Conformité BCEAO. Chaque accès banquier loggé dans audit_logs.

### ADR-007 — Pas d'IMEI (Android 10+)
**Décision** : `device_uuid = SHA-256(hardware_id + app_signature + installation_salt)`
**Raison** : IMEI interdit RGPD, bloqué Android 10+. UUID pseudonyme + IP + GPS = valeur légale équivalente.

---

## 🗓️ Releases Prévues

| Version | Cible | Contenu |
|---------|-------|---------|
| 0.2.0 | Fin avril 2026 | Sprint 0 : Prisma + RS256 + Hash Chain + RLS + NO DELETE |
| 0.3.0 | Mi-mai 2026 | Sprint 1-2 : Transactions complètes + Stock + Sync |
| 0.4.0 | Fin mai 2026 | Sprint 3-4 : Fiscal + PDF/QR + Score refactoré |
| 0.5.0 | Mi-juin 2026 | Sprint 5-6 : Banques + Consentements + Admin + DGI |
| 1.0.0-beta | Juillet 2026 | Pilote 10 commerçants réels |
| 1.0.0 | Septembre 2026 | Lancement production |
