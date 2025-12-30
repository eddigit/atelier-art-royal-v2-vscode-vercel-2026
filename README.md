# 🎭 Atelier Art Royal - E-commerce Haute Couture Maçonnique

Application e-commerce Next.js 14 pour la vente de décors maçonniques (tabliers, sautoirs, bijoux).

## 🚀 Quick Start

### 1. Installation

```bash
# Cloner le repo
git clone https://github.com/VOTRE_USER/artroyal-nextjs.git
cd artroyal-nextjs

# Installer les dépendances
npm install
```

### 2. Configuration

Copier `.env.example` en `.env.local` et remplir les valeurs :

```bash
cp .env.example .env.local
```

**Variables requises :**
- `MONGODB_URI` : Connexion MongoDB Atlas ✅ (déjà configuré)
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `SUMUP_API_KEY` : Clé API SumUp pour les paiements

### 3. Migration des données Base44

Le fichier `data/backup.json` contient toutes les données exportées de Base44.

```bash
# Lancer le script de migration
npm run seed
```

Cela va importer :
- ✅ 53 produits
- ✅ 9 rites
- ✅ 7 obédiences
- ✅ 20 degrés
- ✅ 10 catégories
- ✅ 13 commandes
- ✅ 5 utilisateurs

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du Projet

```
artroyal-nextjs/
├── src/
│   ├── app/                    # App Router Next.js 14
│   │   ├── api/               # API Routes
│   │   │   ├── products/      # CRUD produits
│   │   │   ├── cart/          # Gestion panier
│   │   │   ├── checkout/      # Paiement SumUp
│   │   │   └── orders/        # Commandes
│   │   ├── (shop)/            # Pages boutique (public)
│   │   └── (admin)/           # Pages admin (protégées)
│   ├── components/            # Composants React
│   │   ├── ui/               # shadcn/ui
│   │   ├── catalog/          # Composants catalogue
│   │   ├── cart/             # Composants panier
│   │   └── admin/            # Composants admin
│   ├── models/               # Schémas Mongoose
│   ├── lib/                  # Utilitaires (mongodb, utils)
│   ├── hooks/                # Custom hooks
│   └── stores/               # Zustand stores
├── scripts/
│   └── seed.mjs              # Script de migration
├── data/
│   └── backup.json           # Données Base44 exportées
└── public/                   # Assets statiques
```

---

## 🔧 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 14 (App Router) |
| Base de données | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js |
| Styling | Tailwind CSS + shadcn/ui |
| Paiements | SumUp |
| State | Zustand |
| Déploiement | Vercel |

---

## 📡 API Endpoints

### Produits
- `GET /api/products` - Liste des produits (avec filtres)
- `GET /api/products/[id]` - Détail d'un produit
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/[id]` - Modifier un produit (admin)
- `DELETE /api/products/[id]` - Supprimer un produit (admin)

### Panier
- `GET /api/cart` - Récupérer le panier
- `POST /api/cart` - Ajouter au panier
- `DELETE /api/cart` - Vider le panier

### Checkout
- `POST /api/checkout` - Créer une session de paiement SumUp

### Commandes
- `GET /api/orders` - Liste des commandes (user)
- `GET /api/orders/[id]` - Détail d'une commande

---

## 🔐 Connexion MongoDB

```
Host: cluster0.wvavunv.mongodb.net
Database: atelier-art-royal
User: coach_global_user
```

---

## 🚀 Déploiement Vercel

1. Push sur GitHub
2. Connecter le repo à Vercel
3. Ajouter les variables d'environnement :
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL de prod)
   - `SUMUP_API_KEY`
   - `NEXT_PUBLIC_APP_URL`

4. Déployer !

---

## 📋 TODO

- [ ] Implémenter NextAuth complet
- [ ] Page catalogue avec filtres
- [ ] Page détail produit
- [ ] Tunnel de checkout
- [ ] Dashboard admin
- [ ] Gestion des commandes admin
- [ ] Emails transactionnels (Resend)
- [ ] Upload images (Cloudflare R2)

---

## 📞 Contact

Développé par **GILLES KORZEC** pour Atelier Art Royal.
