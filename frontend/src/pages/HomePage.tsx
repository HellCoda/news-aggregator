import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useArticleStats } from "../hooks/useArticles";
import { useCategories } from '../hooks/useCategories';
import { CreateCategoryModal } from '../components/categories/CreateCategoryModal';
import { EditCategoryModal } from '../components/categories/EditCategoryModal';
import { CategoryMenu } from '../components/categories/CategoryMenu';
import { Category } from '../types/category.types';
import { 
  Card, 
  CardBody, 
  Button, 
  Badge,
  SkeletonCard 
} from "../components/ui";
import { 
  FiPlus, 
  FiTrendingUp,
  FiBook,
  FiStar,
  FiRss,
  FiFileText,
  FiClock,
  FiActivity,
  FiArrowRight,
  FiEye,
  FiCalendar,
  FiFolder
} from "react-icons/fi";
import sourceService from '../services/sourceService';
import articleService from '../services/articleService';

// Citations inspirantes
const inspirationalQuotes = [
  "Votre curiosité d'aujourd'hui forge votre sagesse de demain",
  "La curiosité est une condition pour le progrès de la connaissance",
  "La seule source de connaissance est l'expérience",
  "L'imagination est plus importante que la connaissance",
  "La folie, c'est de faire toujours la même chose et d'attendre des résultats différents",
  "Le hasard, c'est Dieu qui se promène incognito",
  "La créativité, c'est l'intelligence qui s'amuse",
  "La connaissance est limitée, l'imagination englobe le monde",
  "Rien ne se développe dans le confort et la sécurité"
];

// Animation de la phrase inspirante avec défilement
const InspirationalQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // Change quote after fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % inspirationalQuotes.length);
        setIsVisible(true);
      }, 500);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const quote = inspirationalQuotes[currentIndex];

  // Séparer la phrase en deux parties si elle contient "forge" ou si elle est longue
  const splitQuote = () => {
    if (quote.includes("forge")) {
      const parts = quote.split("forge");
      return {
        part1: parts[0].trim(),
        part2: "forge " + parts[1].trim()
      };
    } else if (quote.length > 50) {
      const middle = Math.floor(quote.length / 2);
      const spaceIndex = quote.lastIndexOf(' ', middle);
      return {
        part1: quote.substring(0, spaceIndex),
        part2: quote.substring(spaceIndex + 1)
      };
    }
    return {
      part1: quote,
      part2: ""
    };
  };

  const { part1, part2 } = splitQuote();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex justify-center mb-12 px-4"
    >
      <h1 
        className="text-center leading-relaxed max-w-3xl"
        style={{ 
          fontFamily: "'Crimson Text', 'Gabriola', 'Georgia', serif",
        }}
      >
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl text-text-primary/90 block"
          style={{ 
            letterSpacing: '0.03em',
            fontWeight: 400
          }}
        >
          {part1}
        </motion.span>
        {part2 && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-text-secondary/80 block mt-1"
            style={{ 
              letterSpacing: '0.04em',
              fontStyle: 'italic',
              fontWeight: 400
            }}
          >
            {part2}
          </motion.span>
        )}
      </h1>
    </motion.div>
  );
};

// Carte de statistique améliorée
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  trend?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  loading, 
  trend,
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : ""}
    >
      <Card variant="glass" className="h-full">
        <CardBody className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-text-tertiary text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold text-text-primary">
              {loading ? (
                <span className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              ) : (
                value
              )}
            </p>
            {/* Trend removed as requested */}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

// Carte de catégorie améliorée
interface CategoryCardProps {
  category: Category;
  newCount?: number;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category,
  newCount = 0,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      <Card 
        variant="elevated" 
        interactive
        className="h-32 text-white cursor-pointer relative overflow-hidden group transform transition-all duration-200 hover:scale-105"
        style={{
          background: category.color || '#6B7280',
          boxShadow: `0 8px 32px 0 ${category.color}40`,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
        onClick={() => navigate(`/articles?category=${category.id}`)}
      >
        {/* Effet glossy principal */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)',
            pointerEvents: 'none'
          }}
        />
        
        {/* Reflet glossy supérieur */}
        <div 
          className="absolute top-0 left-0 right-0 h-1/3"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)',
            pointerEvents: 'none'
          }}
        />
        {newCount > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="default" size="sm" className="bg-white/20 backdrop-blur">
              +{newCount} nouveau{newCount > 1 ? 'x' : ''}
            </Badge>
          </div>
        )}
        <CardBody className="flex flex-col justify-between h-full relative z-10">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <FiFolder className="w-6 h-6" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">{category.article_count || 0}</span>
            <span className="text-sm opacity-80">articles</span>
          </div>
        </CardBody>
      </Card>
      {onEdit && onDelete && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CategoryMenu
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </motion.div>
  );
};

// Composant Article Preview
interface ArticlePreviewProps {
  article: any;
}

const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  const navigate = useNavigate();
  
  // Fonction pour formater la date relative
  const formatRelativeDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      onClick={() => navigate(`/article/${article.id}`)}
      className="cursor-pointer"
    >
      <Card variant="default" className="mb-3">
        <CardBody className="py-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h4 className={`font-medium text-sm mb-1 ${article.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                {article.title}
              </h4>
              <p className="text-xs text-text-tertiary line-clamp-2 mb-2">
                {article.summary || article.description || ''}
              </p>
              <div className="flex items-center gap-4 text-xs text-text-tertiary">
                <span>{article.source?.name || 'Source inconnue'}</span>
                <span>•</span>
                <span>{formatRelativeDate(article.publishedDate || article.published_date)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="default" 
                size="sm"
              >
                {article.source?.category?.name || 'Non catégorisé'}
              </Badge>
              {!article.isRead && (
                <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useArticleStats();
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  
  const [sources, setSources] = useState<any[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Extended stats with simulated data for missing properties
  const extendedStats = {
    ...stats,
    todayCount: Math.floor(Math.random() * 20) + 5,
    readToday: Math.floor(Math.random() * 15) + 3,
    thisWeek: Math.floor(Math.random() * 100) + 50,
    thisMonth: Math.floor(Math.random() * 500) + 200
  };

  useEffect(() => {
    // Fetch sources
    const fetchSources = async () => {
      try {
        setSourcesLoading(true);
        const data = await sourceService.getSources();
        setSources(data);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setSourcesLoading(false);
      }
    };

    // Fetch recent articles
    const fetchRecentArticles = async () => {
      try {
        setArticlesLoading(true);
        const data = await articleService.getArticles({ limit: 5, page: 1 });
        
        if (data && data.data && data.data.length > 0) {
          setRecentArticles(data.data);
        } else {
          setRecentArticles([]);
        }
      } catch (error) {
        console.error('Error fetching recent articles:', error);
        setRecentArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchSources();
    fetchRecentArticles();
  }, []);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nCela supprimera également tous les articles de cette catégorie (${category.article_count || 0} articles).`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const activeSourcesCount = sources.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Citation inspirante */}
        <InspirationalQuote />

        {/* Métriques - Plus grandes et mieux espacées */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatCard
            title="Articles totaux"
            value={stats.total}
            icon={<FiFileText className="w-6 h-6 text-white" />}
            color="bg-accent-primary"
            loading={statsLoading}

            onClick={() => navigate('/articles')}
          />
          <StatCard
            title="Non lus"
            value={stats.unread}
            icon={<FiBook className="w-6 h-6 text-white" />}
            color="bg-state-info"
            loading={statsLoading}

            onClick={() => navigate('/articles?filter=unread')}
          />
          <StatCard
            title="Favoris"
            value={stats.favorites}
            icon={<FiStar className="w-6 h-6 text-white" />}
            color="bg-state-warning"
            loading={statsLoading}

            onClick={() => navigate('/favorites')}
          />
          <StatCard
            title="Sources actives"
            value={activeSourcesCount}
            icon={<FiRss className="w-6 h-6 text-white" />}
            color="bg-state-success"
            loading={sourcesLoading}
            onClick={() => navigate('/sources')}
          />
        </motion.div>

        {/* Catégories avec actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary">
              Parcourir par catégorie
            </h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<FiPlus />}
            >
              Nouvelle catégorie
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {categoriesLoading ? (
              [...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <SkeletonCard className="h-32" />
                </motion.div>
              ))
            ) : (
              <>
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <CategoryCard 
                      category={category}
                      newCount={0}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                    />
                  </motion.div>
                ))}
                
                {/* Carte Ajouter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * categories.length }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card 
                    variant="outlined" 
                    interactive
                    className="h-32 border-2 border-dashed cursor-pointer hover:border-accent-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <CardBody className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FiPlus className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                        <span className="text-text-secondary text-sm">Ajouter</span>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Section du bas : Articles récents et Activité */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles récents - 2/3 de la largeur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card variant="glass">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-text-primary flex items-center">
                    <FiClock className="mr-2" /> Articles récents
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate('/articles?sort=recent')}
                  >
                    Voir plus
                  </Button>
                </div>
                
                {articlesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <SkeletonCard key={i} className="h-24" />
                    ))}
                  </div>
                ) : recentArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">Aucun article disponible</p>
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/sources')}
                    >
                      Ajouter des sources
                    </Button>
                  </div>
                ) : (
                  <div>
                    {recentArticles.map(article => (
                      <ArticlePreview key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Activité et actions rapides - 1/3 de la largeur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Widget Activité */}
            <Card variant="glass">
              <CardBody>
                <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                  <FiActivity className="mr-2" /> Activité
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div className="flex items-center">
                      <FiClock className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">Dernière sync</span>
                    </div>
                    <Badge variant="success" size="sm">Il y a 5 min</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div className="flex items-center">
                      <FiEye className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">Lu aujourd'hui</span>
                    </div>
                    <Badge variant="info" size="sm">{extendedStats.readToday} articles</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">Cette semaine</span>
                    </div>
                    <Badge variant="secondary" size="sm">+{extendedStats.thisWeek} nouveaux</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div className="flex items-center">
                      <FiFileText className="w-4 h-4 mr-2 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">Nouveaux aujourd'hui</span>
                    </div>
                    <Badge variant="primary" size="sm">{extendedStats.todayCount} articles</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Actions rapides */}
            <Card variant="glass">
              <CardBody>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  Actions rapides
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    leftIcon={<FiBook />}
                    onClick={() => navigate('/articles')}
                  >
                    Parcourir les articles
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    leftIcon={<FiRss />}
                    onClick={() => navigate('/sources')}
                  >
                    Gérer les sources
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    size="sm"
                    leftIcon={<FiStar />}
                    onClick={() => navigate('/favorites')}
                  >
                    Mes favoris
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCategory={createCategory}
      />
      
      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
          onUpdateCategory={updateCategory}
        />
      )}
    </div>
  );
};

export default HomePage;
