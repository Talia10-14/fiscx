# ✅ FiscX — TODO (v2, basé sur le setup réel)
> Gap analysis : BACKEND_SETUP.md actuel vs Cahier des Charges v2.0
> Mis à jour : Mars 2026

---

## 🔍 ÉTAT ACTUEL VS REQUIS

| Composant | État actuel | Requis | Action |
|-----------|-------------|--------|--------|
| ORM | `db/` (raw pg ?) | Prisma 5.7.1 | 🔴 Migrer |
| JWT | `JWT_SECRET` (HS256) | RS256 asymétrique | 🔴 Changer |
| Prefix routes | `/api/...` | `/api/...` | ✅ OK |
| Hash Chain | ❌ absent | Immuabilité légale | 🔴 Créer |
| Audit Logs | ❌ absent | Chaque action critique | 🔴 Créer |
| NO DELETE DB | ❌ absent | Règle PostgreSQL moteur | 🔴 Ajouter |
| RLS | ❌ absent | Isolation utilisateurs | 🔴 Activer |
| Stock | ❌ absent | Calculé à la volée | 🔴 Créer |
| Sync Offline | ❌ absent | Idempotence UUID | 🔴 Créer |
| Moteur Fiscal | ❌ absent | Table `tax_rules` | 🔴 Créer |
| PDF + QR | ❌ absent | Puppeteer + HMAC | 🔴 Créer |
| Score Crédit | `/api/credit/my-score` basique | 5 critères explicables | 🟡 Refactorer |
| Prêts | `/api/loans` basique | KYC + consentement requis | 🟡 Compléter |
| Consentements | ❌ absent | Scope bancaire 90j | 🔴 Créer |
| Banker routes | ❌ absent | Dashboard + RLS | 🔴 Créer |
| Admin | ❌ absent | Back-office complet | 🔴 Créer |
| DGI | ❌ absent | Agrégats anonymisés | 🔴 Créer |
| KYC | ❌ absent | Smile Identity / Onfido | 🔴 Créer |
| Rate Limiting | ❌ non mentionné | Redis-backed | 🔴 Ajouter |
| Device UUID | ❌ absent | SHA-256 pseudonyme | 🔴 Ajouter |

---

## 🔴 SPRINT 0 — Migration & Fondations (3-4 jours)
> ⚠️ Ces tâches BLOQUENT tout le reste. Traiter en priorité absolue.

### S0.1 — Migration Prisma (remplace `db/` et `models/`)
- [ ] **S0-P-01** `npm install prisma @prisma/client` dans `backend/`
- [ ] **S0-P-02** `npx prisma init` — génère `prisma/schema.prisma` + configure `DATABASE_URL`
- [ ] **S0-P-03** Écrire le schéma complet (voir modèles listés en bas de ce fichier)
- [ ] **S0-P-04** `npx prisma migrate dev --name init` — première migration
- [ ] **S0-P-05** Remplacer tous les appels `db/` dans les routes existantes par `prisma.XXX`
- [ ] **S0-P-06** Créer `prisma/seed.js` — 3 users : admin, merchant (+22993001234/5678), banker
- [ ] **S0-P-07** Ajouter `"prisma:seed": "node prisma/seed.js"` dans `package.json`
- [ ] **S0-P-08** Supprimer `src/db/` et `src/models/` une fois migration validée

### S0.2 — JWT RS256 (breaking change)
- [ ] **S0-J-01** Générer clés RSA : `openssl genrsa -out private.pem 2048` et `openssl rsa -in private.pem -pubout -out public.pem`
- [ ] **S0-J-02** Ajouter dans `.env` : `JWT_PRIVATE_KEY` (PEM inline \n), `JWT_PUBLIC_KEY` (PEM inline \n)
- [ ] **S0-J-03** Refactorer `src/utils/jwt.js` : `sign(payload)` utilise `privateKey + algorithm: 'RS256'`; `verify(token)` utilise `publicKey`
- [ ] **S0-J-04** Access token 7 jours, refresh token 30 jours stocké dans Redis (révocable)
- [ ] **S0-J-05** Supprimer `JWT_SECRET` du `.env` et du code
- [ ] **S0-J-06** Mettre à jour le middleware `src/middleware/auth.js` pour RS256

### S0.3 — Sécurité de base
- [ ] **S0-S-01** `npm install helmet express-rate-limit rate-limit-redis joi` 
- [ ] **S0-S-02** Ajouter `app.use(helmet())` dans `src/index.js`
- [ ] **S0-S-03** Rate limit global 100 req/min/IP avec Redis store
- [ ] **S0-S-04** Rate limit `/api/auth/login` : 5 req/15min par numéro de téléphone
- [ ] **S0-S-05** CORS : `origin: [process.env.FRONTEND_URL, 'http://localhost:5173']`
- [ ] **S0-S-06** Créer `src/middleware/role.js` : `roleMiddleware(allowedRoles[])` vérifie `req.user.role`
- [ ] **S0-S-07** Créer `src/validators/` — schémas Joi pour chaque route (no unknown fields)

### S0.4 — Immuabilité PostgreSQL
- [ ] **S0-I-01** Créer migration SQL raw `prisma/migrations/001_immutability/migration.sql` :
  ```sql
  CREATE RULE no_delete_transactions AS ON DELETE TO "Transaction" DO INSTEAD NOTHING;
  CREATE RULE no_delete_audit_logs AS ON DELETE TO "AuditLog" DO INSTEAD NOTHING;
  ```
- [ ] **S0-I-02** Créer trigger d'audit automatique sur la table `Transaction` (INSERT/UPDATE → AuditLog)
- [ ] **S0-I-03** Activer RLS sur `Transaction`, `AuditLog`, `CreditScore`, `Consent`
- [ ] **S0-I-04** Politique RLS : un user ne lit que ses propres lignes

---

## 🟠 SPRINT 1 — Transactions Complètes (2-3 jours)

### Refactoring de l'existant
- [ ] **S1-T-01** Ajouter `client_uuid` UUID unique sur le modèle `Transaction` (idempotence sync)
- [ ] **S1-T-02** Ajouter `created_offline_at` DateTime? (device time) + `synced_at` DateTime (server UTC)
- [ ] **S1-T-03** Créer `src/services/HashChainService.js` :
  - `compute(txData, prevHash)` → SHA-256(JSON.stringify(data) + prevHash)
  - `getLastHash(userId)` → dernière `hash_chain` de l'utilisateur
  - `verifyChain(userId)` → vérifie toute la chaîne, retourne `{ valid, brokenAt }`
- [ ] **S1-T-04** Créer `src/services/AuditService.js` : `log(userId, action, entityId, old, new, req)`
- [ ] **S1-T-05** Modifier `POST /api/transactions` : calculer + stocker `hash_chain` à chaque création
- [ ] **S1-T-06** Modifier `POST /api/transactions` : appeler `AuditService.log('SALE_CREATE', ...)`
- [ ] **S1-T-07** Bloquer `DELETE /api/transactions/:id` → retourner 405 avec message explicatif
- [ ] **S1-T-08** Restreindre `PATCH /api/transactions/:id` → seulement `description` et `receipt_url`
- [ ] **S1-T-09** Créer `POST /api/transactions/reversal` — écriture d'annulation (type REVERSAL, `original_transaction_id`)
- [ ] **S1-T-10** Ajouter filtres + pagination sur `GET /api/transactions`
- [ ] **S1-T-11** Créer `GET /api/transactions/export?format=csv&from=&to=` — stream CSV

---

## 🟠 SPRINT 2 — Stock & Sync Offline (2 jours)

### Stock (nouveau module)
- [ ] **S2-ST-01** Créer `src/routes/stock.js` et `src/services/StockService.js`
- [ ] **S2-ST-02** `calculateStock(userId, productId)` → agrégation Prisma (SUM purchases - SUM sales + SUM adjustments). **JAMAIS valeur fixe.**
- [ ] **S2-ST-03** `GET /api/products` — liste avec stock temps réel
- [ ] **S2-ST-04** `POST /api/products` — créer produit : nom, unité, prix_revient, prix_vente, seuil_alerte
- [ ] **S2-ST-05** `POST /api/products/:id/adjustment` — écriture d'ajustement tracée
- [ ] **S2-ST-06** `GET /api/products/low-stock` — produits sous le seuil
- [ ] **S2-ST-07** Event Redis `stock:alert:{userId}:{productId}` quand stock < seuil après une SALE

### Sync Offline (nouveau module)
- [ ] **S2-SY-01** Créer `src/routes/sync.js` et `src/services/SyncService.js`
- [ ] **S2-SY-02** `POST /api/sync` — body `{ transactions: [...] }`, retour `{ synced, skipped, errors }`
- [ ] **S2-SY-03** Idempotence : `findUnique({ where: { client_uuid } })` → skip silencieux si existe
- [ ] **S2-SY-04** Alerte si `|created_offline_at - new Date()| > 48h`
- [ ] **S2-SY-05** `GET /api/sync/status` — état de la file de sync

---

## 🟡 SPRINT 3 — Fiscal & PDF (3-4 jours)

### Moteur Fiscal
- [ ] **S3-TX-01** Créer `src/services/TaxEngine.js` et `src/routes/tax.js`
- [ ] **S3-TX-02** `detectRegime(userId, year)` → calcule CA annuel, matche dans table `TaxRule`
- [ ] **S3-TX-03** `GET /api/tax/regime` — régime actuel + seuils
- [ ] **S3-TX-04** `GET /api/tax/estimate` — estimation impôt période courante
- [ ] **S3-TX-05** `PUT /api/admin/tax-rules` — CRUD barèmes sans redéploiement (admin only)

### PDF, QR & Stockage
- [ ] **S3-PD-01** `npm install puppeteer @aws-sdk/client-s3`
- [ ] **S3-PD-02** Créer `src/services/StorageService.js` — R2/S3 : `upload()`, `getSignedUrl()`, `delete()`
- [ ] **S3-PD-03** Créer `src/services/QRCertification.js` — `sign(docId)` HMAC-SHA256 + URL `/api/verify/:token`
- [ ] **S3-PD-04** Créer `src/services/PDFGenerator.js` (Puppeteer) — 4 templates : journal, compte résultat, bilan annuel, déclaration fiscale
- [ ] **S3-PD-05** Créer `src/routes/reports.js` : `POST /api/reports/generate`, `GET /api/reports`
- [ ] **S3-PD-06** `GET /api/verify/:token` — **PUBLIC, sans auth**, vérification document
- [ ] **S3-PD-07** `POST /api/documents/upload` — image → WebP compression → R2 (vérifier quota 500MB)

---

## 🟡 SPRINT 4 — Score Crédit Refactoré (1-2 jours)

- [ ] **S4-CR-01** Créer `src/services/CreditScorer.js` — algorithme 5 critères :
  - CA moyen 3 mois (30%) → `score_revenue`
  - Régularité saisies (25%) → `score_regularity`
  - Taux annulation (20%) → `score_cancellation`
  - Ancienneté (15%) → `score_seniority`
  - Diversité produits (10%) → `score_diversity`
- [ ] **S4-CR-02** **Interdire** dans le calcul : genre, ethnie, localisation fine, âge
- [ ] **S4-CR-03** Mettre à jour `GET /api/credit/my-score` → format `{ total, breakdown, explanations }`
- [ ] **S4-CR-04** Mettre à jour `GET /api/credit/breakdown` → textes explicatifs en français
- [ ] **S4-CR-05** Cron quotidien `node-cron` : recalcul + INSERT `CreditScore`
- [ ] **S4-CR-06** `POST /api/credit/dispute` — contestation (SLA 15 jours)

---

## 🟢 SPRINT 5 — Banques, Consentements & Prêts (2-3 jours)

- [ ] **S5-CO-01** Créer `src/routes/consents.js` + `src/services/ConsentService.js`
- [ ] **S5-CO-02** `POST /api/consents` — `{ banker_id, scope }` + expires 90j
- [ ] **S5-CO-03** `GET /api/consents` — mes consentements actifs
- [ ] **S5-CO-04** `DELETE /api/consents/:id` — révocation immédiate, tracée
- [ ] **S5-BK-01** Créer `src/routes/banker.js` avec `roleMiddleware(['BANKER'])`
- [ ] **S5-BK-02** `GET /api/banker/dossiers` — dossiers avec consentement actif pour ce banker
- [ ] **S5-BK-03** `GET /api/banker/dossiers/:merchantId` — données selon scope + log AuditService
- [ ] **S5-LO-01** Bloquer `POST /api/loans` si KYC non vérifié ou consentement absent
- [ ] **S5-LO-02** `PATCH /api/loans/:id/status` — banker only, statuts APPROVED|REJECTED
- [ ] **S5-LO-03** Webhook sortant à chaque changement de statut prêt

---

## 🔵 SPRINT 6 — Admin, DGI, KYC (2 jours)

- [ ] **S6-AD-01** Créer `src/routes/admin.js` — stats, users CRUD, audit-logs, security-alerts, banks CRUD
- [ ] **S6-DG-01** Créer `src/routes/dgi.js` — agrégats anonymisés (aucun identifiant individuel)
- [ ] **S6-KY-01** Créer `src/routes/kyc.js` + `src/services/KYCService.js`
- [ ] **S6-KY-02** Intégrer Smile Identity ou Onfido via API
- [ ] **S6-KY-03** Webhook entrant résultat KYC → `user.kyc_status`

---

## 📐 MODÈLES PRISMA CIBLES

```prisma
model User {
  id           String   @id @default(uuid())
  phone        String   @unique
  pin_hash     String
  role         String   // MERCHANT | BANKER | ADMIN | DGI | ACCOUNTANT
  kyc_status   String   @default("PENDING") // PENDING | VERIFIED | REJECTED
  created_at   DateTime @default(now())
  transactions Transaction[]
  credit_scores CreditScore[]
  consents_given Consent[] @relation("MerchantConsents")
}

model Transaction {
  id                     String    @id @default(uuid())
  client_uuid            String    @unique // idempotence offline
  user_id                String
  type                   String    // SALE | EXPENSE | PURCHASE | REVERSAL | STOCK_ADJUSTMENT
  amount                 Float
  product_id             String?
  quantity               Float?
  description            String?
  receipt_url            String?
  hash_chain             String    // SHA-256, obligatoire
  original_transaction_id String?  // pour REVERSAL
  created_offline_at     DateTime? // device time
  synced_at              DateTime  @default(now()) // server UTC — fait foi
  user                   User      @relation(fields: [user_id], references: [id])
}

model AuditLog {
  id          String   @id @default(uuid())
  user_id     String
  action      String   // LOGIN | SALE_CREATE | REVERSAL_CREATE | EXPORT_BILAN | LOAN_REQUEST | CONSENT_GRANT | CONSENT_REVOKE | BANKER_VIEW
  entity_id   String?
  ip_address  String?
  device_uuid String?
  old_value   Json?
  new_value   Json?
  created_at  DateTime @default(now())
}

model Product {
  id              String  @id @default(uuid())
  user_id         String
  name            String
  unit            String  // kg | pièce | litre | etc.
  cost_price      Float
  sale_price      Float
  alert_threshold Float
}

model Consent {
  id          String    @id @default(uuid())
  merchant_id String
  banker_id   String
  scope       String    // score_only | history_3m | history_full
  status      String    @default("ACTIVE") // ACTIVE | EXPIRED | REVOKED
  expires_at  DateTime
  revoked_at  DateTime?
  created_at  DateTime  @default(now())
  merchant    User      @relation("MerchantConsents", fields: [merchant_id], references: [id])
}

model CreditScore {
  id                  String   @id @default(uuid())
  user_id             String
  total               Int      // 0-1000
  score_revenue       Int
  score_regularity    Int
  score_cancellation  Int
  score_seniority     Int
  score_diversity     Int
  computed_at         DateTime @default(now())
  user                User     @relation(fields: [user_id], references: [id])
}

model Loan {
  id          String   @id @default(uuid())
  user_id     String
  bank_id     String
  amount      Float
  status      String   @default("PENDING") // PENDING | APPROVED | REJECTED | MORE_INFO
  dossier_url String?
  created_at  DateTime @default(now())
}

model TaxRule {
  id           String  @id @default(uuid())
  country      String  // BJ | SN | CI | etc.
  year         Int
  regime_name  String  // Taxe Synthétique | Réel Simplifié
  ca_min       Float
  ca_max       Float
  rate         Float?
  fixed_amount Float?
}

model Document {
  id           String   @id @default(uuid())
  user_id      String
  type         String   // cash_journal | income_statement | annual_report | tax_declaration
  url          String
  hash_sha256  String
  qr_token     String   @unique
  generated_at DateTime @default(now())
}

model Bank {
  id          String   @id @default(uuid())
  name        String
  webhook_url String?
  status      String   @default("ACTIVE") // ACTIVE | SUSPENDED
  created_at  DateTime @default(now())
}
```
