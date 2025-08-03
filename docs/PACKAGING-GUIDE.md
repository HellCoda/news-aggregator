# 📦 Guide de Packaging Multiplateforme - PANOPTIQUE

## 🎯 Vue d'ensemble

PANOPTIQUE utilise **electron-builder** pour créer des distributions natives sur Windows, macOS et Linux. L'application s'exécute comme une vraie application desktop sans terminal ni navigateur.

## 🚀 Étapes de build

### 1. Préparation (une seule fois)

```bash
# Depuis la racine du projet
cd news-aggregator

# 1. Build du backend
cd backend
npm run build

# 2. Build du frontend  
cd ../frontend
npm run build

# 3. Préparer les assets Electron
cd ../electron
```

### 2. Créer les icônes (si pas déjà fait)

#### Windows (icon.ico)
- Créez un fichier `.ico` contenant les tailles : 16x16, 32x32, 48x48, 256x256
- Placez-le dans `electron/assets/icon.ico`

#### macOS (icon.icns)
- Utilisez `iconutil` ou un outil en ligne pour créer un `.icns`
- Placez-le dans `electron/assets/icon.icns`

#### Linux (icon.png)
- Une image PNG de 512x512 pixels
- Placez-la dans `electron/assets/icon.png`

### 3. Build par plateforme

```bash
cd electron

# Windows seulement (installateur + portable)
npm run dist:win

# macOS seulement (DMG + ZIP)
npm run dist:mac

# Linux seulement (AppImage + DEB + Snap)
npm run dist:linux

# Toutes les plateformes
npm run dist:all
```

## 📁 Fichiers générés

Après le build, vous trouverez dans `electron/dist-electron/` :

### Windows
- `PANOPTIQUE Setup 1.0.0.exe` - Installateur NSIS (~80MB)
- `PANOPTIQUE-1.0.0-portable.exe` - Version portable sans installation (~75MB)

### macOS
- `PANOPTIQUE-1.0.0.dmg` - Image disque pour installation (~85MB)
- `PANOPTIQUE-1.0.0-mac.zip` - Archive ZIP (~85MB)

### Linux
- `PANOPTIQUE-1.0.0.AppImage` - Exécutable universel (~90MB)
- `panoptique_1.0.0_amd64.deb` - Package Debian/Ubuntu (~75MB)
- `panoptique_1.0.0_amd64.snap` - Package Snap (~80MB)

## 🛠️ Scripts de build complet

Créez un fichier `build-all.sh` (Linux/Mac) ou `build-all.bat` (Windows) :

### Windows (build-all.bat)
```batch
@echo off
echo === Building PANOPTIQUE for Production ===

echo [1/4] Building backend...
cd backend
call npm run build
cd ..

echo [2/4] Building frontend...
cd frontend
call npm run build
cd ..

echo [3/4] Building Electron...
cd electron
call npm run build

echo [4/4] Creating distributions...
call npm run dist:win

echo === Build complete! ===
echo Check electron/dist-electron/ for the installers
pause
```

### Linux/macOS (build-all.sh)
```bash
#!/bin/bash
echo "=== Building PANOPTIQUE for Production ==="

echo "[1/4] Building backend..."
cd backend && npm run build && cd ..

echo "[2/4] Building frontend..."
cd frontend && npm run build && cd ..

echo "[3/4] Building Electron..."
cd electron && npm run build

echo "[4/4] Creating distributions..."
npm run dist:all

echo "=== Build complete! ==="
echo "Check electron/dist-electron/ for the installers"
```

## 🎯 Distribution recommandée

### Pour vous-même
- **Windows** : Utilisez la version portable (pas d'installation requise)
- **macOS** : Utilisez le DMG
- **Linux** : Utilisez l'AppImage

### Pour GitHub Release

Uploadez ces fichiers :

```
Windows:
- PANOPTIQUE-Setup-1.0.0.exe (installateur)
- PANOPTIQUE-1.0.0-portable.exe (portable)

macOS:
- PANOPTIQUE-1.0.0.dmg (Intel + Apple Silicon)
- PANOPTIQUE-1.0.0-mac.zip (alternative)

Linux:
- PANOPTIQUE-1.0.0.AppImage (universel)
- panoptique_1.0.0_amd64.deb (Debian/Ubuntu)
```

## ⚡ Auto-update (optionnel)

Pour activer les mises à jour automatiques via GitHub :

1. Modifiez `electron/package.json` :
```json
"publish": [{
  "provider": "github",
  "owner": "votre-username",
  "repo": "panoptique"
}]
```

2. Dans `electron/src/main.ts`, ajoutez :
```typescript
import { autoUpdater } from 'electron-updater';

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

## 🔧 Troubleshooting

### Erreur de signature sur macOS
- Pour distribuer sur macOS sans compte développeur Apple, désactivez la vérification :
  ```json
  "mac": {
    "gatekeeperAssess": false,
    "hardenedRuntime": false
  }
  ```

### Erreur de permissions sur Linux
```bash
chmod +x PANOPTIQUE-1.0.0.AppImage
```

### Windows SmartScreen
- L'application n'est pas signée numériquement
- Les utilisateurs devront cliquer sur "Plus d'infos" → "Exécuter quand même"
- Solution : Acheter un certificat de signature de code (~200€/an)

## ✅ Checklist finale

- [ ] Backend compilé (`backend/dist/`)
- [ ] Frontend buildé (`frontend/build/`)
- [ ] Icônes créées (`.ico`, `.icns`, `.png`)
- [ ] Version dans `package.json` mise à jour
- [ ] Build Electron réussi
- [ ] Test de l'exécutable sur chaque plateforme
- [ ] Upload sur GitHub Releases

## 🎉 Résultat

Vous avez maintenant une vraie application desktop :
- ✅ Pas de terminal visible
- ✅ Pas de navigateur requis
- ✅ Icône dans la barre des tâches
- ✅ Installation native sur chaque OS
- ✅ Démarrage par simple clic
- ✅ Mise à jour automatique possible
