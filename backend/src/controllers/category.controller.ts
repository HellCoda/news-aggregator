import { Request, Response } from 'express';
import { Database } from 'better-sqlite3';
import { getDatabase } from '../config/database';

export class CategoryController {
  private db: Database;

  constructor() {
    this.db = getDatabase();
  }

  // Récupérer toutes les catégories avec le nombre d'articles
  getAllCategories = (req: Request, res: Response): void => {
    try {
      const categories = this.db.prepare(`
        SELECT 
          c.*,
          COUNT(DISTINCT s.id) as source_count,
          COUNT(DISTINCT a.id) as article_count
        FROM categories c
        LEFT JOIN sources s ON s.category_id = c.id
        LEFT JOIN articles a ON a.source_id = s.id
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
  };

  // Créer une nouvelle catégorie
  createCategory = (req: Request, res: Response): void => {
    const { name, color } = req.body;

    if (!name || !color) {
      res.status(400).json({ error: 'Nom et couleur requis' });
      return; // Ajouter return après chaque res.send
    }

    try {
      const stmt = this.db.prepare(
        'INSERT INTO categories (name, color) VALUES (?, ?)'
      );
      const result = stmt.run(name, color);

      const newCategory = this.db.prepare(
        'SELECT * FROM categories WHERE id = ?'
      ).get(result.lastInsertRowid);

      res.status(201).json(newCategory);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(409).json({ error: 'Cette catégorie existe déjà' });
      } else {
        res.status(500).json({ error: 'Erreur lors de la création' });
      }
    }
  };

  // Mettre à jour une catégorie
  updateCategory = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { name, color } = req.body;

    try {
      const stmt = this.db.prepare(
        'UPDATE categories SET name = ?, color = ? WHERE id = ?'
      );
      stmt.run(name, color, id);

      const updatedCategory = this.db.prepare(
        'SELECT * FROM categories WHERE id = ?'
      ).get(id);

      if (!updatedCategory) {
        res.status(404).json({ error: 'Catégorie non trouvée' });
        return; // Ajouter return
      }

      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  };

  // Supprimer une catégorie (avec suppression des articles mais pas des sources)
  deleteCategory = (req: Request, res: Response): void => {
    const { id } = req.params;

    try {
      // Démarrer une transaction
      this.db.prepare('BEGIN').run();

      // Supprimer les articles liés
      this.db.prepare(`
        DELETE FROM articles 
        WHERE source_id IN (
          SELECT id FROM sources WHERE category_id = ?
        )
      `).run(id);

      // Mettre à null la catégorie des sources
      this.db.prepare(
        'UPDATE sources SET category_id = NULL WHERE category_id = ?'
      ).run(id);

      // Supprimer la catégorie
      const result = this.db.prepare(
        'DELETE FROM categories WHERE id = ?'
      ).run(id);

      this.db.prepare('COMMIT').run();

      if (result.changes === 0) {
        res.status(404).json({ error: 'Catégorie non trouvée' });
        return; // Ajouter return
      }

      res.json({ message: 'Catégorie supprimée avec succès' });
    } catch (error) {
      this.db.prepare('ROLLBACK').run();
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  };
}