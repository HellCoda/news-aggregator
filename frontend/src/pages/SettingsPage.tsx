import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiRefreshCw } from 'react-icons/fi';
import { HiDownload } from 'react-icons/hi';
import DocumentationViewer from '../components/documentation/DocumentationViewer';
import { PanoptiqueLogo } from '../components/common/PanoptiqueLogo';
import { Button } from '../components/ui';

const SettingsPage: React.FC = () => {
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const appVersion = '1.0.0';
  const year = new Date().getFullYear();

  // Écouter l'événement beforeinstallprompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher l'affichage automatique du prompt
      e.preventDefault();
      // Sauvegarder l'événement pour pouvoir l'utiliser plus tard
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('L\'application est déjà installée ou n\'est pas disponible à l\'installation');
      return;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('L\'utilisateur a accepté l\'installation');
    } else {
      console.log('L\'utilisateur a refusé l\'installation');
    }
    
    // Réinitialiser le prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleCheckUpdates = () => {
    // Pour une PWA, on peut vérifier si une nouvelle version est disponible
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      alert('Vérification des mises à jour...');
      window.location.reload();
    } else {
      alert('Vous utilisez la dernière version de PANOPTIQUE');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-8 inline-block"
          >
            <PanoptiqueLogo size={128} showText={false} />
          </motion.div>

          {/* App Name */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#f104a6] to-[#ff56c9] bg-clip-text text-transparent"
          >
            PANOPTIQUE
          </motion.h1>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-6"
          >
            Version {appVersion}
          </motion.p>

          {/* Developer & Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Développé par <span className="font-semibold text-gray-700 dark:text-gray-300">HellCoda</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {year}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 mb-8"
          >
            <Button
              onClick={() => setShowDocumentation(true)}
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <FiBook className="w-5 h-5" />
              Consulter la documentation
            </Button>

            {isInstallable && (
              <Button
                onClick={handleInstallPWA}
                variant="secondary"
                size="lg"
                className="w-full flex items-center justify-center gap-2"
              >
                <HiDownload className="w-5 h-5" />
                Installer l'application
              </Button>
            )}

            <Button
              onClick={handleCheckUpdates}
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-5 h-5" />
              Vérifier les mises à jour
            </Button>
          </motion.div>

          {/* PWA Status Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Application Web Progressive (PWA)
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Documentation Modal */}
      {showDocumentation && (
        <DocumentationViewer onClose={() => setShowDocumentation(false)} />
      )}
    </div>
  );
};

export default SettingsPage;
