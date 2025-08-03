import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronRight, FiBook, FiHome, FiLayers, FiZap, FiHelpCircle, FiTool } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { Button } from '../ui';

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

interface DocumentationViewerProps {
  onClose: () => void;
}

const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ onClose }) => {
  const [selectedSection, setSelectedSection] = useState('introduction');
  const [documentationContent, setDocumentationContent] = useState<Record<string, string>>({});

  const sections: DocumentationSection[] = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: <FiHome className="w-4 h-4" />,
      content: ''
    },
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: <FiZap className="w-4 h-4" />,
      content: ''
    },
    {
      id: 'sources',
      title: 'Gestion des sources',
      icon: <FiLayers className="w-4 h-4" />,
      content: ''
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      icon: <FiBook className="w-4 h-4" />,
      content: ''
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <FiHelpCircle className="w-4 h-4" />,
      content: ''
    }
  ];

  // Charger le contenu de la documentation
  useEffect(() => {
    const docs: Record<string, string> = {};
    
    docs['introduction'] = `# Bienvenue dans PANOPTIQUE

**PANOPTIQUE** est votre agrégateur de news personnel, conçu pour centraliser toutes vos sources d'information en un seul endroit.

## Qu'est-ce que PANOPTIQUE ?

PANOPTIQUE est une application desktop qui vous permet de :
- 📰 Agréger des flux RSS de multiples sources
- 📁 Organiser vos articles par catégories
- ⭐ Marquer vos articles favoris
- 💾 Sauvegarder des articles pour une lecture hors ligne
- 🔄 Synchroniser automatiquement vos sources

## Pourquoi PANOPTIQUE ?

- **Privé** : Toutes vos données restent sur votre machine
- **Sans publicité** : Aucune distraction, juste votre contenu
- **Personnalisable** : Adaptez l'interface à vos besoins
- **Rapide** : Base de données locale pour des performances optimales`;

    docs['getting-started'] = `# Démarrage rapide

## 1. Ajouter votre première source

1. Cliquez sur **"Sources"** dans le menu latéral
2. Cliquez sur **"Ajouter une source"**
3. Entrez l'URL du site ou du flux RSS
4. Choisissez une catégorie
5. Cliquez sur **"Ajouter"**

## 2. Lire vos articles

- Les nouveaux articles apparaissent automatiquement
- Cliquez sur un article pour le lire
- Les articles non lus sont marqués d'un point bleu

## 3. Organiser votre lecture

- ⭐ **Favoris** : Cliquez sur l'étoile pour marquer un favori
- 💾 **Sauvegarder** : Gardez des articles même si la source disparaît
- 🗂️ **Catégories** : Filtrez par catégorie dans le menu latéral

## 4. Personnaliser l'affichage

Trois modes de vue sont disponibles :
- **Liste** : Vue compacte sans images
- **Grille 3** : 3 colonnes avec images
- **Grille 4** : 4 colonnes pour plus de contenu`;

    docs['sources'] = `# Gestion des sources

## Types de sources supportés

### Flux RSS/Atom
- La plupart des blogs et sites d'actualités
- URL se terminant généralement par \`/feed\`, \`/rss\`, \`.xml\`
- Détection automatique du format

## Ajouter une source

1. **URL du site** : L'adresse principale du site
2. **URL RSS** (optionnel) : Le flux RSS si différent
3. **Catégorie** : Pour organiser vos sources
4. **Fréquence** : Intervalle de synchronisation

## Gérer vos sources

- **Activer/Désactiver** : Mettez en pause sans supprimer
- **Modifier** : Changez les paramètres
- **Supprimer** : Retire la source et ses articles
- **Synchroniser** : Force une mise à jour

## Résolution des problèmes

- **"Aucun article trouvé"** : Vérifiez l'URL RSS
- **"Erreur de connexion"** : Vérifiez votre connexion internet
- **"Format non supporté"** : Le site nécessite peut-être une configuration spéciale`;

    docs['features'] = `# Fonctionnalités

## Lecture d'articles

- **Mode lecture** : Interface épurée pour une lecture confortable
- **Zoom** : Ctrl + molette pour ajuster la taille du texte

## Organisation

### Catégories
- Créez vos propres catégories
- Assignez une couleur distinctive
- Filtrez rapidement vos articles

### Favoris
- Accès rapide à vos articles préférés
- Recherche dans les favoris
- Export possible

### Articles sauvegardés
- Conservation permanente
- Ajout de notes personnelles
- Organisation par tags

## Recherche

- Recherche contextuelle selon la page
- Recherche dans le titre et le contenu
- Filtres avancés disponibles

## Synchronisation

- Automatique ou manuelle
- Indicateur de progression
- Historique des synchronisations`;

    docs['faq'] = `# Questions fréquentes

## Général

**Q: Où sont stockées mes données ?**
R: Toutes vos données sont stockées localement dans une base SQLite sur votre ordinateur.

**Q: Puis-je synchroniser entre plusieurs appareils ?**
R: Actuellement, PANOPTIQUE fonctionne localement. Une synchronisation cloud pourrait être ajoutée dans le futur.

**Q: L'application fonctionne-t-elle hors ligne ?**
R: Oui, vous pouvez lire tous les articles déjà téléchargés sans connexion internet.

## Sources et articles

**Q: Combien de sources puis-je ajouter ?**
R: Il n'y a pas de limite technique, mais les performances peuvent diminuer au-delà de 100 sources actives.

**Q: Les articles sont-ils supprimés automatiquement ?**
R: Par défaut, non. Vous pouvez configurer une suppression automatique dans les paramètres.

**Q: Puis-je récupérer des articles supprimés ?**
R: Non, sauf si vous avez fait une sauvegarde de votre base de données.

## Problèmes techniques

**Q: L'application est lente**
R: Essayez de :
- Réduire le nombre d'articles affichés par page
- Nettoyer les anciens articles
- Désactiver les sources inutilisées

**Q: Erreur 429 lors de la synchronisation**
R: Trop de requêtes simultanées. Espacez les synchronisations ou réduisez leur fréquence.

**Q: Les images ne s'affichent pas**
R: Vérifiez votre connexion internet et les paramètres de pare-feu.

## Contact et support

Pour toute question non couverte ici, consultez les logs de l'application ou contactez le développeur.`;

    setDocumentationContent(docs);
  }, []);

  const currentContent = documentationContent[selectedSection] || 'Chargement...';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${selectedSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {section.icon}
                  <span>{section.title}</span>
                  {selectedSection === section.id && (
                    <FiChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-8 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {sections.find(s => s.id === selectedSection)?.title}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hidden lg:flex"
              >
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            {/* Documentation content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-200">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-medium mt-6 mb-3 text-gray-700 dark:text-gray-300">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-400">{children}</ol>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>
                    ),
                  }}
                >
                  {currentContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DocumentationViewer;
