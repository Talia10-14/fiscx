# 📊 Guide des Dashboards FiscX

## 🚀 Comment accéder aux dashboards

Tous les dashboards sont accessibles après authentification via la page de connexion améliorée.

### 1️⃣ **Commerçant Dashboard** 🛍️
**Route:** `/dashboard`

**Identifiants:**
- Téléphone: `97 00 00 00`
- PIN: `123456`
- Rôle: `MERCHANT`

**Fonctionnalités:**
- Voir vos ventes du jour
- Solde et transactions
- Score de crédit
- Ajouter une nouvelle vente
- Historique d'activité

#### Accès:
1. Allez sur http://localhost:5174/login
2. Sélectionnez "🛍️ Commerçant"
3. Cliquez "Se connecter au tableau de bord →"
4. Vous serez redirigé vers `/dashboard`

---

### 2️⃣ **Banquier Dashboard** 🏦
**Route:** `/banker/dashboard`

**Identifiants:**
- Téléphone: `97 00 00 00`
- PIN: `123456`
- Rôle: `BANKER`

**Fonctionnalités:**
- Demandes de crédit en attente
- Crédits approuvés
- Portefeuille total
- Nombre de commerçants
- Évaluation des demandes de crédit

#### Accès:
1. Allez sur http://localhost:5174/login
2. Sélectionnez "🏦 Banquier"
3. Cliquez "Se connecter au tableau de bord →"
4. Vous serez redirigé vers `/banker/dashboard`

---

### 3️⃣ **Admin Dashboard** 👨‍💼
**Route:** `/admin/dashboard`

**Identifiants:**
- Téléphone: `97 00 00 00`
- PIN: `123456`
- Rôle: `ADMIN`

**Fonctionnalités:**
- Gestion des utilisateurs
- Configuration du système
- Journaux d'audit
- Statistiques globales

#### Accès:
1. Allez sur http://localhost:5174/login
2. Sélectionnez "👨‍💼 Admin"
3. Cliquez "Se connecter au tableau de bord →"
4. Vous serez redirigé vers `/admin/dashboard`

---

### 4️⃣ **DGI Agent Dashboard** 📋
**Route:** `/dgi/dashboard`

**Identifiants:**
- Téléphone: `97 00 00 00`
- PIN: `123456`
- Rôle: `DGI`

**Fonctionnalités:**
- Vérification des bilans comptables
- Conformité DGI/SYSCOHADA
- Validation des dossiers
- Rapports de certification

#### Accès:
1. Allez sur http://localhost:5174/login
2. Sélectionnez "📋 DGI Agent"
3. Cliquez "Se connecter au tableau de bord →"
4. Vous serez redirigé vers `/dgi/dashboard`

---

## 🔐 Système d'Authentification

### Stockage
- **Token:** Stocké dans `localStorage['access_token']`
- **Utilisateur:** Stocké dans `localStorage['user']` avec le rôle

### Pages Protégées
Toutes les routes `/dashboard`, `/banker/dashboard`, `/admin/dashboard`, `/dgi/dashboard` sont protégées par le composant `ProtectedRoute` qui vérifie:
1. La présence d'un token valide
2. Le rôle de l'utilisateur
3. L'accès autorisé pour ce rôle

### Redirection
- Si vous n'êtes pas authentifié → Redirect à `/login`
- Si votre rôle n'est pas autorisé → Redirect à `/login`

---

## 📱 Déconnexion

**Route:** `/login?logout=true`

Cliquez sur le bouton "Déconnexion" dans le header du dashboard pour revenir à la page login.

---

## 🧪 Mode Test

La page de login v2 est en **mode test** avec:
- ✅ Identifiants pré-remplis
- ✅ Sélection facile du rôle
- ✅ Connexion et redirection instantanées
- ✅ Données simulées dans les dashboards

---

## 📝 Notes Développeur

### Structure des Dashboards

```
/pages/
  └─ MerchantDashboard.jsx      → Dashboard commerçant
  └─ BankerDashboard.jsx        → Dashboard banquier
  └─ AdminDashboard.jsx         → Dashboard admin
  └─ DGIDashboard.jsx           → Dashboard DGI
```

### Structure du User
```javascript
{
  id: "user_...",
  phone: "97 00 00 00",
  role: "MERCHANT" | "BANKER" | "ADMIN" | "DGI",
  firstName: "Test",
  lastName: "User",
  email: "test.merchant@fiscx.bj",
  creditScore: 750
}
```

### Routes Protégées
```javascript
ProtectedRoute allowedRoles={['MERCHANT']}  → Seul merchant
ProtectedRoute allowedRoles={['BANKER']}    → Seul banker
ProtectedRoute allowedRoles={['ADMIN']}     → Seul admin
ProtectedRoute allowedRoles={['DGI']}       → Seul DGI
```

---

## 🔄 Flux Complet

1. **Page d'accueil** → Cliquez "Commencer gratuitement" ou "Se connecter"
2. **Page login v2** → Sélectionnez votre rôle (commerçant, banquier, etc.)
3. **Dashboard** → Vous êtes authentifié et redirigé
4. **Déconnexion** → Cliquez le bouton déconnexion pour revenir à la page login

---

## 🚨 Troubleshooting

### Je ne vois pas les dashboards?
- ✅ Vérifiez que vous êtes connecté (token dans localStorage)
- ✅ Vérifiez que `/dashboard` `/banker/dashboard` etc. matchent votre rôle

### Le rôle n'est pas appliqué?
- ✅ Vérifiez que `user.role` est défini dans localStorage
- ✅ Reloadez la page (`Ctrl+R`)

### Les données ne s'affichent pas?
- ✅ Vérifiez la console (F12) pour les erreurs API
- ✅ Les dashboards utilisent des données simulées pour le moment

---

**Version:** v2 (avec support des rôles)  
**Dernière mise à jour:** 26 mars 2026
