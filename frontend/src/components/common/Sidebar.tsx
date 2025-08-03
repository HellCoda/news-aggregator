import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "../../hooks/useCategories";
import { PanoptiqueLogo } from "./PanoptiqueLogo";
import {
  FiHome,
  FiFileText,
  FiRss,
  FiStar,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiFolder,
  FiBookmark,
} from "react-icons/fi";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const { categories } = useCategories();

  const navItems = [
    { path: "/", icon: FiHome, label: "Accueil" },
    {
      path: "/articles",
      icon: FiFileText,
      label: "Articles",
      hasSubmenu: true,
      submenu: categories.map((cat) => ({
        path: `/articles?category=${cat.id}`,
        label: cat.name,
        count: cat.article_count || 0,
      })),
    },
    { path: "/sources", icon: FiRss, label: "Sources" },
    { path: "/favorites", icon: FiStar, label: "Favoris" },
    { path: "/saved", icon: FiBookmark, label: "Sauvegardés" },
    { path: "/settings", icon: FiSettings, label: "Paramètres" },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-background-card flex flex-col h-full relative"
    >
      {/* Bordure droite comme élément séparé */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-border-primary" />
      {/* Header avec Logo */}
      <div className="p-3 border-b border-border-primary">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "" : "gap-3"} overflow-hidden`}
          >
            <motion.div
              animate={{ scale: isCollapsed ? 1 : 1 }}
              transition={{ duration: 0.2 }}
              className={isCollapsed ? "mx-auto" : ""}
            >
              <PanoptiqueLogo size={isCollapsed ? 40 : 40} showText={false} />
            </motion.div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold bg-gradient-to-r from-[#f104a6] to-[#ff56c9] bg-clip-text text-transparent whitespace-nowrap"
                >
                  PANOPTIQUE
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-background-hover transition-colors text-text-secondary hover:text-text-primary"
              title={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
            >
              <FiChevronLeft size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.hasSubmenu ? (
                // Élément avec sous-menu
                <>
                  <button
                    onClick={() => toggleCategory(item.path)}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-text-secondary hover:bg-background-hover hover:text-text-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.submenu && (
                      <motion.div
                        animate={{
                          rotate: expandedCategories.includes(item.path)
                            ? 90
                            : 0,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight size={16} />
                      </motion.div>
                    )}
                  </button>

                  {/* Sous-menu */}
                  <AnimatePresence>
                    {!isCollapsed &&
                      expandedCategories.includes(item.path) &&
                      item.submenu && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-9 mt-1 space-y-1"
                        >
                          {item.submenu.map((subItem) => (
                            <li key={subItem.path}>
                              <NavLink
                                to={subItem.path}
                                className={({ isActive }) =>
                                  `flex items-center justify-between p-2 rounded-md text-sm transition-all ${
                                    isActive
                                      ? "bg-accent-primary/20 text-accent-primary font-medium"
                                      : "text-text-tertiary hover:bg-background-hover hover:text-text-secondary"
                                  }`
                                }
                              >
                                <span>{subItem.label}</span>
                                {subItem.count && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {subItem.count}
                                  </span>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                  </AnimatePresence>
                </>
              ) : (
                // Élément simple
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-accent-primary/20 text-accent-primary font-medium"
                        : "text-text-secondary hover:bg-background-hover hover:text-text-primary"
                    }`
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-primary">
        {isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg hover:bg-background-hover transition-colors text-text-secondary hover:text-text-primary"
              title="Ouvrir le menu"
            >
              <FiChevronRight size={20} />
            </button>
            <span className="text-xs text-text-tertiary">v1.0</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="text-xs text-text-tertiary">Version 1.0.0</div>
            <div className="text-xs text-text-tertiary">© 2025 PANOPTIQUE</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
