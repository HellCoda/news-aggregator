# 🔍 PANOPTIQUE - News Aggregator PWA

<p align="center">
  <img src="frontend/public/logo192.png" alt="Panoptique Logo" width="128" height="128">
</p>

**PANOPTIQUE** est une Progressive Web App (PWA) qui centralise toutes vos sources d'actualités en un seul endroit. Fonctionne sur tous les appareils et même hors ligne !

## ✨ Fonctionnalités

- 📰 **Agrégation RSS** : Collecte automatique d'articles depuis vos flux RSS préférés
- 🌐 **Web Scraping** : Extraction d'articles depuis des sites sans RSS
- 📱 **PWA** : Installable comme une app native sur mobile et desktop
- 🔌 **Mode hors ligne** : Consultez vos articles même sans connexion
- 🎨 **Interface moderne** : Design élégant avec mode sombre
- 📊 **Organisation** : Catégorisation et filtrage des articles
- ⭐ **Favoris** : Sauvegardez vos articles préférés
- 🔔 **Notifications** : Soyez alerté des nouveaux articles

## 🚀 Installation rapide

### Prérequis

- Node.js 18+ et npm
- Git

### Installation

PANOPTIQUE v1.0.0 - Première Release

https://github.com/HellCoda/news-aggregator/releases/tag/v1.0.0

1. **Cloner le projet**
   ```bash
   git clone https://github.com/[HellCoda]/news-aggregator.git
   cd news-aggregator
   ```

2. **Installer les dépendances**
   ```bash
   # Depuis la racine du projet
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Configuration**
   
   Créer le fichier `backend/.env` :
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_PATH=../database/news.db
   ```

   Créer le fichier `frontend/.env` :
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:3001

## 📱 Installation PWA

1. Ouvrez l'application dans Chrome/Edge
2. Cliquez sur le bouton "Installer l'application" dans les paramètres
3. Ou utilisez l'icône d'installation dans la barre d'adresse

## 🛠️ Commandes disponibles

```bash
# Développement
npm run dev              # Lance frontend + backend

# Production
cd frontend && npm run build    # Build de production
npx serve -s build             # Servir le build

# Nettoyage
npm run clean           # Nettoie node_modules et cache
```

## 📂 Structure du projet

```
panoptique/
├── backend/           # API Node.js/Express
├── frontend/          # Interface React PWA
├── database/          # Base de données SQLite
└── docs/             # Documentation
```

## 🔧 Technologies utilisées

- **Frontend** : React, TypeScript, Tailwind CSS, PWA
- **Backend** : Node.js, Express, TypeScript
- **Database** : SQLite
- **Scraping** : Cheerio, RSS Parser

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une PR.

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE)

## 👨‍💻 Auteur

Développé avec ❤️ par **HellCoda**

---

<p align="center">
  <strong>PANOPTIQUE</strong> - Votre regard sur l'actualité
</p>
