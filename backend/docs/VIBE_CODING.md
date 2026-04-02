# 🎵 VIBE CODING — FiscX Backend
## Guide session par session pour Cursor IDE
> Lis ce fichier avant de commencer. Il te dit **quoi faire, dans quel ordre, et avec quel prompt Cursor**.

---

## 🧠 Mindset

Tu construis l'infrastructure financière de 800 000 commerçants béninois.
Chaque bug peut signifier un prêt refusé ou une fraude non détectée.

**Ce qui existe déjà** (ne pas casser) :
- `src/routes/` — auth, transactions, credit, loans (basique mais fonctionnel)
- `src/middleware/` — auth, errors
- `src/utils/jwt.js` — JWT (HS256 à migrer vers RS256)
- `src/db/` — connexion DB (à remplacer par Prisma progressivement)

**Ce qui manque** (à construire) :
Prisma, RS256, hash chain, audit logs, immuabilité DB, stock, sync, tax, PDF, QR, consentements, banker, admin, DGI, KYC

---

## ⚡ SESSION 0A — Migration Prisma (2-3h, BLOQUANT)

> **Ouvre le terminal Cursor (`Ctrl+\``) — ne pas fermer les fichiers existants**

### Étape 1 — Installer Prisma
```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

### Prompt Cursor (ouvrir `prisma/schema.prisma`) :
```
Remplace le contenu de schema.prisma par le schéma complet FiscX avec ces modèles :
User (id uuid, phone unique, pin_hash, role, kyc_status, created_at),
Transaction (id uuid, client_uuid String @unique, user_id, type, amount, product_id?, quantity?, description?, receipt_url?, hash_chain String, original_transaction_id?, created_offline_at DateTime?, synced_at DateTime @default(now())),
AuditLog (id uuid, user_id, action, entity_id?, ip_address?, device_uuid?, old_value Json?, new_value Json?, created_at @default(now())),
Product (id uuid, user_id, name, unit, cost_price Float, sale_price Float, alert_threshold Float),
Consent (id uuid, merchant_id, banker_id, scope, status @default("ACTIVE"), expires_at, revoked_at?, created_at @default(now())),
CreditScore (id uuid, user_id, total Int, score_revenue Int, score_regularity Int, score_cancellation Int, score_seniority Int, score_diversity Int, computed_at @default(now())),
Loan (id uuid, user_id, bank_id, amount, status @default("PENDING"), dossier_url?, created_at @default(now())),
TaxRule (id uuid, country, year Int, regime_name, ca_min Float, ca_max Float, rate Float?, fixed_amount Float?),
Document (id uuid, user_id, type, url, hash_sha256, qr_token @unique, generated_at @default(now())),
Bank (id uuid, name, webhook_url?, status @default("ACTIVE"), created_at @default(now())).
Utilise PostgreSQL provider.
```

### Étape 2 — Générer la migration + migration d'immuabilité
```bash
npx prisma migrate dev --name init
```

Ensuite créer `prisma/migrations/001_immutability.sql` :
```sql
-- Politique NO DELETE au niveau moteur PostgreSQL
CREATE RULE no_delete_transactions 
  AS ON DELETE TO "Transaction" DO INSTEAD NOTHING;

CREATE RULE no_delete_audit_logs 
  AS ON DELETE TO "AuditLog" DO INSTEAD NOTHING;

-- Trigger d'audit automatique
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "AuditLog"(id, user_id, action, entity_id, old_value, new_value, created_at)
  VALUES (
    gen_random_uuid(),
    NEW.user_id,
    TG_OP || '_TRANSACTION',
    NEW.id,
    to_jsonb(OLD),
    to_jsonb(NEW),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_audit_trigger
AFTER INSERT OR UPDATE ON "Transaction"
FOR EACH ROW EXECUTE FUNCTION log_transaction_changes();
```

### Étape 3 — Créer la seed

### Prompt Cursor (ouvrir `prisma/seed.js`) :
```
Crée prisma/seed.js pour FiscX.
Crée 3 utilisateurs avec @prisma/client :
1. Admin : phone "+22901000001", role "ADMIN", pin_hash bcrypt de "000000" (coût 12)
2. Merchant : phone "+22993001234", role "MERCHANT", pin_hash bcrypt de "5678" (coût 12), kyc_status "VERIFIED"
3. Banker : phone "+22901000002", role "BANKER", pin_hash bcrypt de "1234" (coût 12), kyc_status "VERIFIED"
Aussi créer 3 TaxRule pour le Bénin (country "BJ", year 2026) :
- Taxe Synthétique : ca_min 0, ca_max 20000000, fixed_amount 50000
- Réel Simplifié : ca_min 20000001, ca_max 100000000, rate 0.05
- Réel Normal : ca_min 100000001, ca_max 999999999, rate 0.25
Ajouter "prisma": { "seed": "node prisma/seed.js" } dans package.json.
```

```bash
npm install bcrypt
npx prisma db seed
```

---

## ⚡ SESSION 0B — JWT RS256 (1h, BLOQUANT)

```bash
# Générer les clés dans backend/
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
# Ne jamais commiter ces fichiers ! Ajouter *.pem au .gitignore
```

### Prompt Cursor (ouvrir `src/utils/jwt.js`) :
```
Refactore src/utils/jwt.js pour FiscX de HS256 vers RS256.
La clé privée vient de process.env.JWT_PRIVATE_KEY (PEM avec \n → remplacer par vrais sauts de ligne).
La clé publique vient de process.env.JWT_PUBLIC_KEY.

Exporter :
- signAccessToken(payload) → RS256, expiresIn '7d'
- signRefreshToken(payload) → RS256, expiresIn '30d'  
- verifyToken(token) → vérifie avec publicKey, algorithms: ['RS256'], throw si invalide

Supprimer toute référence à JWT_SECRET.

Créer src/middleware/role.js :
- export roleMiddleware(allowedRoles[]) → middleware qui vérifie req.user.role
- Si rôle non autorisé → res.status(403).json({ error: 'FORBIDDEN', message: 'Accès refusé' })

Créer src/middleware/rateLimit.js :
- Rate limit global 100 req/min via express-rate-limit avec RedisStore
- Rate limit auth : 5 req/15min par IP sur les routes /api/auth/login et /api/auth/register
- Exporter rateLimitGlobal et rateLimitAuth
```

```bash
npm install express-rate-limit rate-limit-redis
```

Mettre à jour `.env` :
```env
JWT_PRIVATE_KEY=<contenu de private.pem sur une ligne avec \n>
JWT_PUBLIC_KEY=<contenu de public.pem sur une ligne avec \n>
# Supprimer JWT_SECRET
```

---

## ⚡ SESSION 1 — Hash Chain & Transactions Complètes (3h)

### Prompt Cursor (nouveau fichier `src/services/HashChainService.js`) :
```
Crée src/services/HashChainService.js pour FiscX.
Importer crypto natif Node.js et @prisma/client.

Méthodes statiques :
1. compute(txData, previousHash) :
   - payload = JSON.stringify({ id, user_id, amount, type, synced_at })
   - return SHA-256(payload + (previousHash || ''))
   
2. async getLastHash(userId) :
   - findFirst Transaction de cet userId, orderBy synced_at desc
   - return transaction?.hash_chain || null

3. async verifyChain(userId) :
   - findMany toutes les transactions de userId, orderBy synced_at asc
   - Recalculer hash_chain pour chacune
   - Comparer avec la valeur stockée
   - Return { valid: boolean, brokenAt: uuid|null, totalChecked: number }

Créer src/services/AuditService.js :
Méthode statique async log({ user_id, action, entity_id, ip_address, device_uuid, old_value, new_value }) :
- INSERT dans AuditLog via prisma
- Ne jamais logger : pin_hash, token, données personnelles brutes
```

### Prompt Cursor (ouvrir `src/routes/transactions.js`) :
```
Mets à jour src/routes/transactions.js pour FiscX.
Importer HashChainService, AuditService, authMiddleware, roleMiddleware, prisma.

POST /api/transactions :
- Protéger avec authMiddleware + roleMiddleware(['MERCHANT', 'ACCOUNTANT'])
- Valider avec Joi : type (enum SALE|EXPENSE|PURCHASE), amount (number > 0), client_uuid (uuid requis), product_id (optionnel), quantity (optionnel), created_offline_at (date ISO optionnel), description (string optionnel)
- Vérifier idempotence : si client_uuid existe déjà → retourner { data: existingTx, meta: { already_exists: true } } 200
- Calculer hash_chain via HashChainService
- synced_at = new Date() (pas le client_timestamp)
- Insérer en prisma.$transaction atomique avec AuditService.log('SALE_CREATE')
- Alerte si |created_offline_at - new Date()| > 48h → log console.warn

POST /api/transactions/reversal :
- Vérifier que l'original existe et appartient au user
- Créer transaction type REVERSAL avec amount = -original.amount, lier original_transaction_id
- AuditService.log('REVERSAL_CREATE')

DELETE /api/transactions/:id :
- Toujours retourner 405 : { error: 'METHOD_NOT_ALLOWED', message: 'Les transactions ne peuvent pas être supprimées. Créez une écriture d annulation.' }

PATCH /api/transactions/:id :
- Autoriser uniquement description et receipt_url
- Rejeter toute tentative de modifier amount, type, product_id → 400

GET /api/transactions :
- Filtres : date_from, date_to, type, product_id, amount_min, amount_max
- Pagination : page, per_page (défaut 20, max 100)
- Toujours filtrer par user_id: req.user.id

GET /api/transactions/export :
- query params: format (csv uniquement), from, to
- Stream CSV des transactions de la période
- Columns: id, type, amount, description, synced_at, hash_chain
```

---

## ⚡ SESSION 2 — Stock & Sync Offline (2h)

### Prompt Cursor (nouveaux fichiers) :
```
Crée src/services/StockService.js et src/routes/stock.js pour FiscX.

StockService.js :
async calculateStock(userId, productId) :
  - groupBy type sur Transaction où user_id=userId, product_id=productId
  - stock = SUM(PURCHASE.quantity) - SUM(SALE.quantity) + SUM(STOCK_ADJUSTMENT.quantity)
  - JAMAIS de valeur fixe en DB — toujours recalculer
  - return { productId, currentStock, lastUpdated }

async checkAlerts(userId, productId, currentStock) :
  - Lire Product.alert_threshold
  - Si stock < seuil → publier event Redis 'stock:alert:{userId}:{productId}'

Routes /api/products :
GET /api/products → liste produits avec stock calculé en temps réel (appel calculateStock pour chaque)
POST /api/products → créer : name, unit, cost_price, sale_price, alert_threshold
GET /api/products/:id/stock → stock actuel + 20 derniers mouvements
POST /api/products/:id/adjustment → créer Transaction type STOCK_ADJUSTMENT, quantité signée (+ ou -)
GET /api/products/low-stock → produits où stock calculé < alert_threshold

Toutes les routes : authMiddleware + roleMiddleware(['MERCHANT', 'ACCOUNTANT']) + filtrer par user_id.

---

Crée src/services/SyncService.js et src/routes/sync.js pour FiscX.

SyncService.processBatch(userId, transactions[]) :
Pour chaque transaction :
1. Vérifier client_uuid avec findUnique → si existe : push à skipped, continue
2. Calculer synced_at = new Date()
3. Vérifier écart timestamps : si > 48h → console.warn + push à warnings
4. Calculer hash_chain (getLastHash + compute)
5. Insérer via prisma.$transaction avec audit log
6. Push à synced
Return { synced: [...ids], skipped: [...client_uuids], errors: [...], warnings: [...] }

Routes :
POST /api/sync → body { transactions: [...] }, max 100 par batch
GET /api/sync/status → { pending: 0, last_sync: datetime }
```

---

## ⚡ SESSION 3 — Moteur Fiscal + PDF + QR (4h)

### Prompt Cursor :
```
Crée src/services/TaxEngine.js pour FiscX.

async detectRegime(userId, year) :
- Calculer CA annuel : SUM(SALE.amount) WHERE user_id=userId, year=year
- Chercher TaxRule WHERE country='BJ', year=year, ca_min <= ca <= ca_max
- Return { regime_name, rate, fixed_amount, ca_annual, tax_due }

async estimateTax(userId) :
- CA depuis début de l'année courante
- Appeler detectRegime pour l'année courante
- Return { current_ca, estimated_tax, regime, days_remaining_in_year }

async checkThresholdAlert(userId) :
- Si CA actuel > 80% du ca_max du régime actuel → return true

Routes src/routes/tax.js :
GET /api/tax/regime → régime actuel + seuils
GET /api/tax/estimate → estimation impôt
PUT /api/admin/tax-rules → roleMiddleware(['ADMIN']), UPSERT dans TaxRule

---

Crée src/services/QRCertification.js pour FiscX.
Importer crypto natif.

sign(documentId, documentHash) :
- HMAC-SHA256 de (documentId + ':' + documentHash) avec process.env.QR_HMAC_SECRET
- Return token hexadécimal

generateURL(token) → `${process.env.FRONTEND_URL}/verify/${token}`

verify(token, documentId, documentHash) :
- Recalculer HMAC, comparer en time-safe
- Return { valid: boolean }

---

Crée src/services/PDFGenerator.js pour FiscX avec Puppeteer.
npm install puppeteer

Méthodes :
generateCashJournal(userId, date) → template HTML liste transactions du jour, QR en footer
generateIncomeStatement(userId, month, year) → CA - Dépenses = Résultat net, QR en footer
generateAnnualReport(userId, year) → bilan annuel certifié complet, QR obligatoire
generateTaxDeclaration(userId, year) → formulaire pré-rempli avec montants

Pour chaque PDF :
- Générer via Puppeteer headless
- Calculer SHA-256 du buffer PDF
- Signer avec QRCertification.sign(docId, sha256)
- Uploader sur R2 via StorageService
- Sauvegarder dans Document table
- Return { url, qr_token, hash_sha256 }

Routes src/routes/reports.js :
POST /api/reports/generate → { type: 'cash_journal'|'income_statement'|'annual_report'|'tax_declaration', date|month|year }
GET /api/reports → liste des rapports de l'utilisateur
GET /api/verify/:token → PUBLIC sans auth → vérifie QR token → retourne { valid, document_type, generated_at } ou alerte rouge

Crée src/services/StorageService.js :
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
Utiliser S3Client avec endpoint Cloudflare R2.
upload(key, buffer, contentType) → PutObjectCommand
getSignedUrl(key, expiresIn=3600) → GetObjectCommand presigned
Vars env : R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
```

---

## ⚡ SESSION 4 — Score Crédit Refactoré (1.5h)

### Prompt Cursor :
```
Refactore le score de crédit dans src/services/CreditScorer.js pour FiscX.
Remplacer l'implémentation actuelle dans src/routes/credit.js.

CreditScorer.calculate(userId) → retourne { total: 0-1000, breakdown, explanations }

Algorithme 5 critères (total 1000 points) :
1. CA moyen 3 mois (300 pts max) :
   avg = SUM(SALE.amount, 90 derniers jours) / 3
   score = Math.min(avg / 500000 * 300, 300)  // 500k XOF = cible mensuelle

2. Régularité saisies (250 pts max) :
   active_days = COUNT DISTINCT DATE(synced_at) sur 30 derniers jours
   score = (active_days / 30) * 250

3. Taux annulation (200 pts max) :
   total = COUNT transactions 90 derniers jours
   reversals = COUNT type='REVERSAL' 90 derniers jours
   rate = reversals / total (ou 0 si total=0)
   score = Math.max(0, (1 - rate * 5) * 200)  // x5 car taux élevé = signal fraude fort

4. Ancienneté (150 pts max) :
   days = (now - user.created_at) / 86400000
   score = Math.min(days / 365 * 150, 150)

5. Diversité produits (100 pts max) :
   distinct = COUNT DISTINCT product_id 90 derniers jours
   score = Math.min(distinct / 5 * 100, 100)  // 5 produits = max

total = score1 + score2 + score3 + score4 + score5

explanations = tableau de strings en français :
- Si score_regularity < 150 → "Saisissez vos transactions chaque jour pour améliorer votre score"
- Si score_cancellation < 100 → "Réduisez les annulations pour augmenter votre crédibilité"
- Si score_revenue < 150 → "Augmentez votre chiffre d'affaires pour améliorer votre profil"
- Si score_diversity < 50 → "Diversifiez vos produits vendus"
- Si score_seniority < 75 → "Continuez à utiliser FiscX régulièrement"

INTERDIRE dans le calcul : gender, location, ethnicity, age, phone

Cron quotidien (node-cron) : tous les jours à minuit → calculer score de tous les users MERCHANT actifs → INSERT CreditScore

Mettre à jour src/routes/credit.js :
GET /api/credit/my-score → { data: { total, breakdown, explanations, computed_at } }
GET /api/credit/breakdown → détail complet avec explications
POST /api/credit/dispute → { reason, detail } → créer entrée dans AuditLog action='SCORE_DISPUTE', SLA 15j
```

---

## ⚡ SESSION 5 — Banques, Consentements & Prêts (2.5h)

### Prompt Cursor :
```
Crée src/services/ConsentService.js et src/routes/consents.js pour FiscX.

ConsentService :
async grant(merchantId, bankerId, scope) :
  - Vérifier scope ∈ ['score_only', 'history_3m', 'history_full']
  - expires_at = new Date() + 90 jours
  - Désactiver consentements précédents merchant/banker si existants
  - INSERT Consent
  - AuditService.log('CONSENT_GRANT')

async revoke(merchantId, consentId) :
  - Vérifier ownership (merchant_id = merchantId)
  - UPDATE status='REVOKED', revoked_at=now()
  - AuditService.log('CONSENT_REVOKE')
  - Return immédiatement

async check(merchantId, bankerId) :
  - findFirst ACTIVE + expires_at > now() pour ce duo
  - Return { hasConsent, scope, expiresAt } | null

Cron quotidien : UPDATE Consent SET status='EXPIRED' WHERE expires_at < NOW() AND status='ACTIVE'

Routes /api/consents :
POST → grant (roleMiddleware MERCHANT)
GET → liste mes consentements actifs
DELETE /:id → revoke (roleMiddleware MERCHANT)

---

Crée src/routes/banker.js pour FiscX (roleMiddleware BANKER uniquement).

Middleware requis sur toutes les routes banker :
- Vérifier consentement actif via ConsentService.check(merchantId, bankerId)
- Si absent → 403 CONSENT_REQUIRED
- Logger chaque accès : AuditService.log('BANKER_VIEW', ...)

GET /api/banker/dossiers :
- Liste les Consent actifs du banker (req.user.id)
- Join avec User (merchant) pour afficher score + date dernière transaction
- Retourne { merchants: [{ id, score, last_activity, consent_scope, consent_expires }] }

GET /api/banker/dossiers/:merchantId :
- Vérifier consentement actif
- Selon scope :
  - 'score_only' → { credit_score }
  - 'history_3m' → { credit_score, transactions: 90 derniers jours }
  - 'history_full' → { credit_score, transactions: tout }
- Logger BANKER_VIEW avec scope utilisé

---

Complète src/routes/loans.js pour FiscX.

POST /api/loans :
- Vérifier user.kyc_status === 'VERIFIED' → sinon 403 KYC_REQUIRED
- Vérifier consentement accordé à la banque → sinon 403 CONSENT_REQUIRED
- Récupérer CreditScore le plus récent
- Générer dossier PDF via PDFGenerator.generateAnnualReport
- INSERT Loan avec dossier_url
- AuditService.log('LOAN_REQUEST')
- Si webhook_url de la banque → POST vers webhook avec dossier

PATCH /api/loans/:id/status :
- roleMiddleware(['BANKER'])
- Valider status ∈ ['APPROVED', 'REJECTED', 'MORE_INFO_NEEDED']
- UPDATE Loan status
- AuditService.log('LOAN_STATUS_UPDATE')
- Si Bank.webhook_url → notifier changement statut
```

---

## ⚡ SESSION 6 — Admin, DGI & KYC (2h)

### Prompt Cursor :
```
Crée src/routes/admin.js pour FiscX (roleMiddleware ADMIN).

GET /api/admin/stats :
- users actifs (last transaction < 30j) COUNT
- volume total transactions ce mois
- nombre prêts par statut
- nombre documents générés

GET /api/admin/users?role=&status=&page= → liste paginée
PATCH /api/admin/users/:id/status → { status: 'ACTIVE'|'SUSPENDED' }
POST /api/admin/reset-pin/:userId :
- Vérifier KYC validé avant reset
- bcrypt nouveau PIN temporaire '000000'
- AuditService.log('PIN_RESET')
GET /api/admin/audit-logs?action=&userId=&from=&to= → journal filtrable paginé
GET /api/admin/security-alerts :
  - Users avec > 3 tentatives login échouées (depuis Redis)
  - Users avec taux annulation > 30% ce mois
  - Transactions > AML_THRESHOLD
POST /api/admin/banks → créer Bank
PATCH /api/admin/banks/:id → status, webhook_url

---

Crée src/routes/dgi.js pour FiscX (roleMiddleware DGI).
AUCUNE donnée nominative. AUCUN user_id brut. Uniquement agrégats anonymisés.

GET /api/dgi/aggregates :
- Total CA agrégé par mois, par régime fiscal, par secteur d'activité
- Nombre de contribuables par tranche de CA (sans identifier qui)
- Impôt estimé agrégé

GET /api/dgi/declarations :
- Déclarations pré-agrégées par région et secteur
- Format compatible export CSV

---

Crée src/routes/kyc.js et src/services/KYCService.js pour FiscX.

POST /api/kyc/initiate :
- Créer session KYC via Smile Identity API (ou mock si KYC_PROVIDER=mock)
- Return { session_id, redirect_url }

GET /api/kyc/status :
- Return user.kyc_status : PENDING | VERIFIED | REJECTED

POST /api/kyc/webhook (sans auth, sécurisé par signature HMAC Smile Identity) :
- Valider signature webhook
- Mettre à jour user.kyc_status
- AuditService.log('KYC_VERIFIED' ou 'KYC_REJECTED')

Créer script scripts/verify-hash-chain.js :
- Lire userId depuis args (process.argv[2])
- Appeler HashChainService.verifyChain(userId)
- Afficher résultat dans le terminal avec couleurs
- Exit code 1 si chaîne cassée (pour CI/CD)
```

---

## ⚡ SESSION FINALE — Sécurité & Health (1h)

### Prompt Cursor :
```
Finalise la sécurité dans src/index.js pour FiscX.

1. Ajouter dans l'ordre :
   app.use(helmet())
   app.use(rateLimitGlobal)
   app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:5173'], credentials: true }))
   app.use(express.json({ limit: '10mb' }))

2. Sur /api/auth/login et /api/auth/register : appliquer rateLimitAuth

3. GET /api/health :
   { status: 'ok', uptime: process.uptime(), timestamp: new Date() }

4. GET /api/health/db :
   - Ping Prisma : prisma.$queryRaw`SELECT 1`
   - Ping Redis : redisClient.ping()
   - Return { status: 'ok', db: 'connected', redis: 'connected', prisma_version: ... }

5. Middleware détection AML dans src/middleware/aml.js :
   - Si transaction.amount > process.env.AML_THRESHOLD_BJ → INSERT AuditLog action='AML_ALERT'
   - Ne pas bloquer la transaction (signalement seulement)

6. RGPD POST /api/account/delete :
   - Anonymiser : phone → '[ANONYMIZED-{uuid}]', pin_hash → 'ANONYMIZED'
   - NE PAS supprimer : Transaction, AuditLog, Document (obligation légale 7 ans)
   - AuditService.log('ACCOUNT_ANONYMIZED')
```

---

## 🧪 TEST RAPIDE APRÈS CHAQUE SESSION

```bash
# Démarrer
docker-compose up -d
docker-compose logs -f backend

# Test auth RS256
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+22993001234", "pin": "5678"}'
# → Doit retourner { data: { token: "eyJ..." }, ... }

# Test immuabilité — DELETE interdit
export TOKEN="eyJ..."
curl -X DELETE http://localhost:3000/api/transactions/some-id \
  -H "Authorization: Bearer $TOKEN"
# → Doit retourner 405 Method Not Allowed

# Test idempotence
UUID="550e8400-e29b-41d4-a716-446655440001"
for i in 1 2 3; do
  curl -X POST http://localhost:3000/api/transactions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"SALE\",\"amount\":5000,\"client_uuid\":\"$UUID\"}"
done
# → La 2e et 3e doivent retourner already_exists: true

# Vérifier hash chain
node scripts/verify-hash-chain.js <userId>
# → { valid: true, brokenAt: null, totalChecked: 1 }
```

---

## 📊 ORDRE DE BUILD RECOMMANDÉ

```
Jour 1 matin  → Session 0A (Prisma migration)
Jour 1 après  → Session 0B (JWT RS256)
Jour 2        → Session 1 (Hash Chain + Transactions)
Jour 3 matin  → Session 2 (Stock + Sync)
Jour 3 après  → Session 3A (Tax Engine)
Jour 4        → Session 3B (PDF + QR + Storage)
Jour 5 matin  → Session 4 (Score Crédit)
Jour 5 après  → Session 5A (Consentements)
Jour 6 matin  → Session 5B (Banker + Loans)
Jour 6 après  → Session 6 (Admin + DGI + KYC)
Jour 7        → Session Finale + Tests
```

---

*🇧🇯 FiscX — Construire un pont entre l'informel et le formel*
