import { Router } from 'express';
import { SavedArticleController } from '../controllers/saved-article.controller';

const router = Router();

// Save an article
router.post('/articles/:articleId/save', SavedArticleController.saveArticle);

// Get all saved articles
router.get('/saved-articles', SavedArticleController.getSavedArticles);

// Get a specific saved article
router.get('/saved-articles/:id', SavedArticleController.getSavedArticleById);

// Update a saved article (notes/tags)
router.put('/saved-articles/:id', SavedArticleController.updateSavedArticle);

// Delete a saved article
router.delete('/saved-articles/:id', SavedArticleController.deleteSavedArticle);

// Check if an article is saved
router.get('/articles/:articleId/saved-status', SavedArticleController.checkIfSaved);

export default router;
