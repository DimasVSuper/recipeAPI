# 📚 Repository Layer - Pembelajaran Dasar

> **Panduan lengkap memahami Repository Layer dalam Layered Architecture**

## 🎯 Tujuan Pembelajaran

Setelah mempelajari dokumentasi ini, Anda akan memahami:
- Apa itu Repository dan perannya dalam aplikasi
- Cara mengimplementasikan Repository pattern dengan benar
- CRUD operations dan query management
- Testing strategy untuk Repository
- Best practices dan common pitfalls

---

## 🤔 Apa itu Repository Layer?

### 📋 **Definisi**
Repository adalah layer yang bertanggung jawab untuk mengabstraksi akses data dan menyediakan interface yang konsisten untuk operasi database, terlepas dari jenis database yang digunakan.

### 🏗️ **Posisi dalam Arsitektur**
```
Controller ← Service ← REPOSITORY ← Model ← Database
```

Repository berada di antara Service dan Model, mengatur semua operasi database.

### 🎭 **Analogi Sederhana**
Repository seperti **pustakawan**:
- **Anda (Service)**: Ingin mencari buku dengan topik tertentu
- **Pustakawan (Repository)**: Tahu cara mencari, mengambil, dan mengembalikan buku
- **Sistem katalog (Model)**: Format standar untuk buku
- **Rak buku (Database)**: Tempat penyimpanan fisik

Anda tidak perlu tahu di rak mana buku berada, pustakawan yang mengurusnya.

---

## 📝 Tanggung Jawab Repository Layer

### ✅ **Yang HARUS dilakukan Repository:**
1. **CRUD Operations**: Create, Read, Update, Delete data
2. **Query Management**: Mengelola semua query database
3. **Data Mapping**: Convert data database ke Model objects
4. **Transaction Handling**: Mengelola database transactions
5. **Connection Management**: Mengelola koneksi database
6. **Error Handling**: Handle database-specific errors

### ❌ **Yang TIDAK boleh dilakukan Repository:**
1. **Business Logic**: Logic bisnis harus di Service layer
2. **HTTP Operations**: Tidak boleh handle HTTP request/response
3. **External API calls**: Tidak memanggil service eksternal
4. **Data Validation**: Validasi kompleks ada di Service/Model
5. **UI Logic**: Tidak ada logic presentasi

---

## 🔍 Implementasi Repository Layer

### 📦 **Basic Repository Structure**

```javascript
// src/repositories/recipeRepository.js
const RecipeModel = require('../models/recipeModel');

class RecipeRepository {
  constructor(database) {
    this.db = database;
  }

  // READ Operations
  async findAll(options = {}) {
    try {
      const { limit = 50, offset = 0, orderBy = 'created_at', sortOrder = 'DESC' } = options;
      
      const query = `
        SELECT * FROM recipes 
        ORDER BY ${orderBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await this.db.execute(query, [limit, offset]);
      
      return rows.map(row => RecipeModel.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      // Validate ID
      if (!id || !Number.isInteger(Number(id))) {
        throw new Error('Invalid ID format');
      }

      const query = 'SELECT * FROM recipes WHERE id = ?';
      const [rows] = await this.db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return RecipeModel.fromDatabaseRow(rows[0]);
    } catch (error) {
      if (error.message === 'Invalid ID format') {
        throw error;
      }
      throw new Error(`Failed to fetch recipe: ${error.message}`);
    }
  }

  async findByTitle(title) {
    try {
      const query = 'SELECT * FROM recipes WHERE title LIKE ?';
      const [rows] = await this.db.execute(query, [`%${title}%`]);
      
      return rows.map(row => RecipeModel.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  async findByDifficulty(difficulty) {
    try {
      const query = 'SELECT * FROM recipes WHERE difficulty = ?';
      const [rows] = await this.db.execute(query, [difficulty]);
      
      return rows.map(row => RecipeModel.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to fetch recipes by difficulty: ${error.message}`);
    }
  }

  async count() {
    try {
      const query = 'SELECT COUNT(*) as total FROM recipes';
      const [[{ total }]] = await this.db.execute(query);
      
      return total;
    } catch (error) {
      throw new Error(`Failed to count recipes: ${error.message}`);
    }
  }
}

module.exports = RecipeRepository;
```

### ✅ **CREATE Operations**

```javascript
class RecipeRepository {
  // ... previous methods ...

  async create(recipeData) {
    try {
      // Validate data using Model
      const validation = RecipeModel.validate(recipeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create model instance
      const recipe = RecipeModel.fromApiRequest(recipeData);
      const dbData = recipe.toDatabaseObject();

      const query = `
        INSERT INTO recipes (title, ingredients, instructions, cooking_time, difficulty, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        dbData.title,
        dbData.ingredients,
        dbData.instructions,
        dbData.cooking_time,
        dbData.difficulty,
        dbData.created_at,
        dbData.updated_at
      ];

      const [result] = await this.db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to create recipe');
      }

      // Return created recipe with ID
      recipe.id = result.insertId;
      return recipe;
      
    } catch (error) {
      // Handle specific database errors
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Recipe with this title already exists');
      }
      
      if (error.message.includes('Validation failed')) {
        throw error;
      }
      
      throw new Error(`Failed to create recipe: ${error.message}`);
    }
  }

  async createBatch(recipesData) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const createdRecipes = [];
      
      for (const recipeData of recipesData) {
        // Validate each recipe
        const validation = RecipeModel.validate(recipeData);
        if (!validation.isValid) {
          throw new Error(`Validation failed for recipe "${recipeData.title}": ${validation.errors.join(', ')}`);
        }

        const recipe = RecipeModel.fromApiRequest(recipeData);
        const dbData = recipe.toDatabaseObject();

        const query = `
          INSERT INTO recipes (title, ingredients, instructions, cooking_time, difficulty, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          dbData.title,
          dbData.ingredients,
          dbData.instructions,
          dbData.cooking_time,
          dbData.difficulty,
          dbData.created_at,
          dbData.updated_at
        ];

        const [result] = await connection.execute(query, values);
        recipe.id = result.insertId;
        createdRecipes.push(recipe);
      }
      
      await connection.commit();
      return createdRecipes;
      
    } catch (error) {
      await connection.rollback();
      throw new Error(`Batch creation failed: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}
```

### 🔄 **UPDATE Operations**

```javascript
class RecipeRepository {
  // ... previous methods ...

  async update(id, updateData) {
    try {
      // Check if recipe exists
      const existingRecipe = await this.findById(id);
      if (!existingRecipe) {
        throw new Error('Recipe not found');
      }

      // Merge existing data with updates
      const mergedData = {
        ...existingRecipe.toPlainObject(),
        ...updateData,
        updated_at: new Date()
      };

      // Validate merged data
      const validation = RecipeModel.validate(mergedData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const recipe = new RecipeModel(mergedData);
      const dbData = recipe.toDatabaseObject();

      const query = `
        UPDATE recipes 
        SET title = ?, ingredients = ?, instructions = ?, cooking_time = ?, difficulty = ?, updated_at = ?
        WHERE id = ?
      `;
      
      const values = [
        dbData.title,
        dbData.ingredients,
        dbData.instructions,
        dbData.cooking_time,
        dbData.difficulty,
        dbData.updated_at,
        id
      ];

      const [result] = await this.db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Recipe not found or no changes made');
      }

      return recipe;
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Validation failed')) {
        throw error;
      }
      
      throw new Error(`Failed to update recipe: ${error.message}`);
    }
  }

  async updatePartial(id, updateData) {
    try {
      // Only update provided fields
      const fields = Object.keys(updateData);
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      // Always update updated_at
      const updates = { ...updateData, updated_at: new Date() };
      const setClause = Object.keys(updates).map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(updates), id];

      const query = `UPDATE recipes SET ${setClause} WHERE id = ?`;
      const [result] = await this.db.execute(query, values);
      
      if (result.affectedRows === 0) {
        throw new Error('Recipe not found');
      }

      // Return updated recipe
      return await this.findById(id);
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('No fields')) {
        throw error;
      }
      
      throw new Error(`Failed to update recipe: ${error.message}`);
    }
  }
}
```

### ❌ **DELETE Operations**

```javascript
class RecipeRepository {
  // ... previous methods ...

  async delete(id) {
    try {
      // Check if recipe exists first
      const existingRecipe = await this.findById(id);
      if (!existingRecipe) {
        throw new Error('Recipe not found');
      }

      const query = 'DELETE FROM recipes WHERE id = ?';
      const [result] = await this.db.execute(query, [id]);
      
      return result.affectedRows > 0;
      
    } catch (error) {
      if (error.message === 'Recipe not found') {
        throw error;
      }
      
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  async deleteByTitle(title) {
    try {
      const query = 'DELETE FROM recipes WHERE title = ?';
      const [result] = await this.db.execute(query, [title]);
      
      return result.affectedRows;
      
    } catch (error) {
      throw new Error(`Failed to delete recipes by title: ${error.message}`);
    }
  }

  async softDelete(id) {
    try {
      const query = `
        UPDATE recipes 
        SET deleted_at = ?, updated_at = ?
        WHERE id = ? AND deleted_at IS NULL
      `;
      
      const now = new Date();
      const [result] = await this.db.execute(query, [now, now, id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Recipe not found or already deleted');
      }

      return true;
      
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      
      throw new Error(`Failed to soft delete recipe: ${error.message}`);
    }
  }
}
```

### 🔍 **Advanced Query Methods**

```javascript
class RecipeRepository {
  // ... previous methods ...

  async search(criteria) {
    try {
      const { title, difficulty, maxCookingTime, ingredients } = criteria;
      
      let query = 'SELECT * FROM recipes WHERE 1=1';
      const params = [];

      if (title) {
        query += ' AND title LIKE ?';
        params.push(`%${title}%`);
      }

      if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (maxCookingTime) {
        query += ' AND cooking_time <= ?';
        params.push(maxCookingTime);
      }

      if (ingredients) {
        query += ' AND ingredients LIKE ?';
        params.push(`%${ingredients}%`);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await this.db.execute(query, params);
      
      return rows.map(row => RecipeModel.fromDatabaseRow(row));
      
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async getStatistics() {
    try {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM recipes',
        byDifficulty: `
          SELECT difficulty, COUNT(*) as count 
          FROM recipes 
          GROUP BY difficulty
        `,
        avgCookingTime: 'SELECT AVG(cooking_time) as avg_time FROM recipes',
        recentCount: `
          SELECT COUNT(*) as count 
          FROM recipes 
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `
      };

      const results = {};
      
      for (const [key, query] of Object.entries(queries)) {
        const [rows] = await this.db.execute(query);
        results[key] = rows;
      }

      return {
        total: results.total[0].count,
        byDifficulty: results.byDifficulty,
        avgCookingTime: Math.round(results.avgCookingTime[0].avg_time || 0),
        recentCount: results.recentCount[0].count
      };
      
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  async findSimilar(recipeId, limit = 5) {
    try {
      const recipe = await this.findById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      // Find recipes with similar difficulty and cooking time
      const query = `
        SELECT *, 
               ABS(cooking_time - ?) as time_diff
        FROM recipes 
        WHERE id != ? 
          AND difficulty = ?
          AND ABS(cooking_time - ?) <= 30
        ORDER BY time_diff ASC, created_at DESC
        LIMIT ?
      `;

      const [rows] = await this.db.execute(query, [
        recipe.cooking_time,
        recipeId,
        recipe.difficulty,
        recipe.cooking_time,
        limit
      ]);

      return rows.map(row => RecipeModel.fromDatabaseRow(row));
      
    } catch (error) {
      if (error.message === 'Recipe not found') {
        throw error;
      }
      
      throw new Error(`Failed to find similar recipes: ${error.message}`);
    }
  }
}
```

---

## 🧪 Testing Repository Layer

### 🎯 **Testing Strategy untuk Repository**

```javascript
// tests/unit/recipeRepository.test.js
const RecipeRepository = require('../../src/repositories/recipeRepository');
const RecipeModel = require('../../src/models/recipeModel');

describe('RecipeRepository', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn(),
      getConnection: jest.fn()
    };
    repository = new RecipeRepository(mockDb);
  });

  describe('findAll', () => {
    test('should return all recipes with default options', async () => {
      const mockRows = [
        { id: 1, title: 'Recipe 1', ingredients: 'Ingredients 1', instructions: 'Instructions 1', cooking_time: 30, difficulty: 'Easy', created_at: new Date(), updated_at: new Date() },
        { id: 2, title: 'Recipe 2', ingredients: 'Ingredients 2', instructions: 'Instructions 2', cooking_time: 45, difficulty: 'Medium', created_at: new Date(), updated_at: new Date() }
      ];
      
      mockDb.execute.mockResolvedValue([mockRows]);

      const recipes = await repository.findAll();

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM recipes'),
        [50, 0] // default limit and offset
      );
      expect(recipes).toHaveLength(2);
      expect(recipes[0]).toBeInstanceOf(RecipeModel);
      expect(recipes[1]).toBeInstanceOf(RecipeModel);
    });

    test('should handle custom options', async () => {
      const options = { limit: 10, offset: 5, orderBy: 'title', sortOrder: 'ASC' };
      mockDb.execute.mockResolvedValue([[]]);

      await repository.findAll(options);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY title ASC'),
        [10, 5]
      );
    });

    test('should handle database errors', async () => {
      mockDb.execute.mockRejectedValue(new Error('Connection lost'));

      await expect(repository.findAll())
        .rejects.toThrow('Failed to fetch recipes: Connection lost');
    });

    test('should return empty array when no recipes found', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      const recipes = await repository.findAll();

      expect(recipes).toEqual([]);
    });
  });

  describe('findById', () => {
    test('should return recipe when found', async () => {
      const mockRow = {
        id: 1,
        title: 'Test Recipe',
        ingredients: 'Test ingredients',
        instructions: 'Test instructions',
        cooking_time: 30,
        difficulty: 'Easy',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      mockDb.execute.mockResolvedValue([[mockRow]]);

      const recipe = await repository.findById(1);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE id = ?',
        [1]
      );
      expect(recipe).toBeInstanceOf(RecipeModel);
      expect(recipe.id).toBe(1);
      expect(recipe.title).toBe('Test Recipe');
    });

    test('should return null when recipe not found', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      const recipe = await repository.findById(999);

      expect(recipe).toBeNull();
    });

    test('should validate ID format', async () => {
      await expect(repository.findById('invalid'))
        .rejects.toThrow('Invalid ID format');
      
      await expect(repository.findById(null))
        .rejects.toThrow('Invalid ID format');
      
      await expect(repository.findById(undefined))
        .rejects.toThrow('Invalid ID format');
    });

    test('should handle database errors', async () => {
      mockDb.execute.mockRejectedValue(new Error('Table not found'));

      await expect(repository.findById(1))
        .rejects.toThrow('Failed to fetch recipe: Table not found');
    });
  });

  describe('create', () => {
    test('should create recipe with valid data', async () => {
      const recipeData = {
        title: 'New Recipe',
        ingredients: 'New ingredients',
        instructions: 'New instructions',
        cooking_time: 25,
        difficulty: 'Medium'
      };

      mockDb.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

      const recipe = await repository.create(recipeData);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO recipes'),
        expect.arrayContaining([
          recipeData.title,
          recipeData.ingredients,
          recipeData.instructions,
          recipeData.cooking_time,
          recipeData.difficulty,
          expect.any(Date),
          expect.any(Date)
        ])
      );
      expect(recipe).toBeInstanceOf(RecipeModel);
      expect(recipe.id).toBe(1);
      expect(recipe.title).toBe('New Recipe');
    });

    test('should validate data before creation', async () => {
      const invalidData = { title: '' }; // Invalid: empty title

      await expect(repository.create(invalidData))
        .rejects.toThrow('Validation failed');
      
      expect(mockDb.execute).not.toHaveBeenCalled();
    });

    test('should handle duplicate entry errors', async () => {
      const recipeData = {
        title: 'Duplicate Recipe',
        ingredients: 'ingredients',
        instructions: 'instructions'
      };

      const duplicateError = new Error('Duplicate entry');
      duplicateError.code = 'ER_DUP_ENTRY';
      mockDb.execute.mockRejectedValue(duplicateError);

      await expect(repository.create(recipeData))
        .rejects.toThrow('Recipe with this title already exists');
    });

    test('should handle creation failure', async () => {
      const recipeData = {
        title: 'Test Recipe',
        ingredients: 'ingredients',
        instructions: 'instructions'
      };

      mockDb.execute.mockResolvedValue([{ insertId: 0, affectedRows: 0 }]);

      await expect(repository.create(recipeData))
        .rejects.toThrow('Failed to create recipe');
    });
  });

  describe('update', () => {
    test('should update existing recipe', async () => {
      const existingRecipe = new RecipeModel({
        id: 1,
        title: 'Original Recipe',
        ingredients: 'Original ingredients',
        instructions: 'Original instructions',
        cooking_time: 30,
        difficulty: 'Easy'
      });

      const updateData = {
        title: 'Updated Recipe',
        cooking_time: 45
      };

      // Mock findById call
      mockDb.execute
        .mockResolvedValueOnce([[existingRecipe.toDatabaseObject()]]) // findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // update

      const updatedRecipe = await repository.update(1, updateData);

      // Verify findById was called
      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE id = ?',
        [1]
      );

      // Verify update was called
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE recipes SET'),
        expect.arrayContaining([expect.any(Date), 1]) // updated_at and id
      );

      expect(updatedRecipe).toBeInstanceOf(RecipeModel);
      expect(updatedRecipe.title).toBe('Updated Recipe');
      expect(updatedRecipe.cooking_time).toBe(45);
    });

    test('should throw error when recipe not found', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      await expect(repository.update(999, { title: 'Updated' }))
        .rejects.toThrow('Recipe not found');
    });

    test('should validate merged data', async () => {
      const existingRecipe = new RecipeModel({
        id: 1,
        title: 'Valid Recipe',
        ingredients: 'Valid ingredients',
        instructions: 'Valid instructions'
      });

      const invalidUpdate = { title: '' }; // This will make title empty

      mockDb.execute.mockResolvedValueOnce([[existingRecipe.toDatabaseObject()]]);

      await expect(repository.update(1, invalidUpdate))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('delete', () => {
    test('should delete existing recipe', async () => {
      const existingRecipe = new RecipeModel({
        id: 1,
        title: 'Recipe to Delete',
        ingredients: 'ingredients',
        instructions: 'instructions'
      });

      mockDb.execute
        .mockResolvedValueOnce([[existingRecipe.toDatabaseObject()]]) // findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // delete

      const result = await repository.delete(1);

      expect(mockDb.execute).toHaveBeenCalledWith(
        'SELECT * FROM recipes WHERE id = ?',
        [1]
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        'DELETE FROM recipes WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    test('should throw error when recipe not found', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      await expect(repository.delete(999))
        .rejects.toThrow('Recipe not found');
    });

    test('should return false when delete fails', async () => {
      const existingRecipe = new RecipeModel({
        id: 1,
        title: 'Recipe',
        ingredients: 'ingredients',
        instructions: 'instructions'
      });

      mockDb.execute
        .mockResolvedValueOnce([[existingRecipe.toDatabaseObject()]]) // findById
        .mockResolvedValueOnce([{ affectedRows: 0 }]); // delete failed

      const result = await repository.delete(1);
      expect(result).toBe(false);
    });
  });

  describe('search', () => {
    test('should search recipes with multiple criteria', async () => {
      const criteria = {
        title: 'pasta',
        difficulty: 'Medium',
        maxCookingTime: 60,
        ingredients: 'tomato'
      };

      const mockRows = [
        { id: 1, title: 'Pasta Recipe', difficulty: 'Medium', cooking_time: 45, ingredients: 'tomato, pasta', instructions: 'Cook pasta', created_at: new Date(), updated_at: new Date() }
      ];

      mockDb.execute.mockResolvedValue([mockRows]);

      const recipes = await repository.search(criteria);

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        expect.arrayContaining(['%pasta%', 'Medium', 60, '%tomato%'])
      );
      expect(recipes).toHaveLength(1);
      expect(recipes[0]).toBeInstanceOf(RecipeModel);
    });

    test('should handle empty criteria', async () => {
      mockDb.execute.mockResolvedValue([[]]);

      const recipes = await repository.search({});

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1'),
        []
      );
      expect(recipes).toEqual([]);
    });
  });

  describe('Transaction handling', () => {
    test('should handle batch creation with transaction', async () => {
      const recipesData = [
        { title: 'Recipe 1', ingredients: 'ingredients 1', instructions: 'instructions 1' },
        { title: 'Recipe 2', ingredients: 'ingredients 2', instructions: 'instructions 2' }
      ];

      const mockConnection = {
        beginTransaction: jest.fn(),
        execute: jest.fn().mockResolvedValue([{ insertId: 1, affectedRows: 1 }]),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
      };

      mockDb.getConnection.mockResolvedValue(mockConnection);

      const results = await repository.createBatch(recipesData);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(results).toHaveLength(2);
    });

    test('should rollback on batch creation error', async () => {
      const recipesData = [
        { title: 'Recipe 1', ingredients: 'ingredients 1', instructions: 'instructions 1' },
        { title: '', ingredients: 'ingredients 2', instructions: 'instructions 2' } // Invalid
      ];

      const mockConnection = {
        beginTransaction: jest.fn(),
        execute: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn()
      };

      mockDb.getConnection.mockResolvedValue(mockConnection);

      await expect(repository.createBatch(recipesData))
        .rejects.toThrow('Batch creation failed');

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
    });
  });

  describe('Advanced queries', () => {
    test('should get statistics', async () => {
      const mockResults = {
        total: [{ count: 100 }],
        byDifficulty: [
          { difficulty: 'Easy', count: 40 },
          { difficulty: 'Medium', count: 35 },
          { difficulty: 'Hard', count: 25 }
        ],
        avgCookingTime: [{ avg_time: 45.5 }],
        recentCount: [{ count: 15 }]
      };

      mockDb.execute
        .mockResolvedValueOnce([mockResults.total])
        .mockResolvedValueOnce([mockResults.byDifficulty])
        .mockResolvedValueOnce([mockResults.avgCookingTime])
        .mockResolvedValueOnce([mockResults.recentCount]);

      const stats = await repository.getStatistics();

      expect(stats).toEqual({
        total: 100,
        byDifficulty: mockResults.byDifficulty,
        avgCookingTime: 46, // Rounded
        recentCount: 15
      });
    });

    test('should find similar recipes', async () => {
      const baseRecipe = new RecipeModel({
        id: 1,
        title: 'Base Recipe',
        ingredients: 'ingredients',
        instructions: 'instructions',
        cooking_time: 30,
        difficulty: 'Medium'
      });

      const similarRecipes = [
        { id: 2, title: 'Similar Recipe', cooking_time: 25, difficulty: 'Medium', time_diff: 5, ingredients: 'ingredients', instructions: 'instructions', created_at: new Date(), updated_at: new Date() }
      ];

      mockDb.execute
        .mockResolvedValueOnce([[baseRecipe.toDatabaseObject()]]) // findById
        .mockResolvedValueOnce([similarRecipes]); // find similar

      const results = await repository.findSimilar(1);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(RecipeModel);
      expect(results[0].title).toBe('Similar Recipe');
    });
  });
});
```

---

## 🚀 Advanced Repository Patterns

### 🏗️ **Repository Interface Pattern**

```javascript
// src/interfaces/IRecipeRepository.js
class IRecipeRepository {
  async findAll(options) { throw new Error('Method not implemented'); }
  async findById(id) { throw new Error('Method not implemented'); }
  async create(data) { throw new Error('Method not implemented'); }
  async update(id, data) { throw new Error('Method not implemented'); }
  async delete(id) { throw new Error('Method not implemented'); }
}

// MySQL Implementation
class MySQLRecipeRepository extends IRecipeRepository {
  constructor(database) {
    super();
    this.db = database;
  }

  async findAll(options) {
    // MySQL specific implementation
  }
  
  // ... other methods
}

// MongoDB Implementation
class MongoRecipeRepository extends IRecipeRepository {
  constructor(database) {
    super();
    this.db = database;
  }

  async findAll(options) {
    // MongoDB specific implementation
  }
  
  // ... other methods
}
```

### 🏭 **Repository Factory Pattern**

```javascript
// src/factories/repositoryFactory.js
const MySQLRecipeRepository = require('../repositories/mysql/recipeRepository');
const MongoRecipeRepository = require('../repositories/mongo/recipeRepository');

class RepositoryFactory {
  static createRecipeRepository(dbType, database) {
    switch (dbType) {
      case 'mysql':
        return new MySQLRecipeRepository(database);
      case 'mongodb':
        return new MongoRecipeRepository(database);
      case 'memory': // For testing
        return new InMemoryRecipeRepository();
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }
  }
}

module.exports = RepositoryFactory;
```

### 🧮 **Query Builder Pattern**

```javascript
// src/repositories/queryBuilder.js
class QueryBuilder {
  constructor(tableName) {
    this.table = tableName;
    this.conditions = [];
    this.params = [];
    this.orderByClause = '';
    this.limitClause = '';
  }

  where(field, operator, value) {
    this.conditions.push(`${field} ${operator} ?`);
    this.params.push(value);
    return this;
  }

  whereIn(field, values) {
    const placeholders = values.map(() => '?').join(',');
    this.conditions.push(`${field} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  whereLike(field, value) {
    this.conditions.push(`${field} LIKE ?`);
    this.params.push(`%${value}%`);
    return this;
  }

  orderBy(field, direction = 'ASC') {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count, offset = 0) {
    this.limitClause = `LIMIT ${count} OFFSET ${offset}`;
    return this;
  }

  build() {
    let query = `SELECT * FROM ${this.table}`;
    
    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }
    
    if (this.orderByClause) {
      query += ` ${this.orderByClause}`;
    }
    
    if (this.limitClause) {
      query += ` ${this.limitClause}`;
    }
    
    return { query, params: this.params };
  }
}

// Usage in Repository
class RecipeRepository {
  async searchAdvanced(criteria) {
    const builder = new QueryBuilder('recipes');
    
    if (criteria.title) {
      builder.whereLike('title', criteria.title);
    }
    
    if (criteria.difficulty) {
      builder.where('difficulty', '=', criteria.difficulty);
    }
    
    if (criteria.maxTime) {
      builder.where('cooking_time', '<=', criteria.maxTime);
    }
    
    const { query, params } = builder
      .orderBy('created_at', 'DESC')
      .limit(criteria.limit || 50)
      .build();
    
    const [rows] = await this.db.execute(query, params);
    return rows.map(row => RecipeModel.fromDatabaseRow(row));
  }
}
```

---

## 📈 Performance Optimization

### ⚡ **Connection Pooling**

```javascript
class RecipeRepository {
  constructor(database) {
    this.db = database;
    this.connectionPool = database.pool; // Use connection pool
  }

  async findAllOptimized(options = {}) {
    const connection = await this.connectionPool.getConnection();
    
    try {
      // Use dedicated connection for complex queries
      const [rows] = await connection.execute(query, params);
      return rows.map(row => RecipeModel.fromDatabaseRow(row));
    } finally {
      connection.release(); // Always release connection
    }
  }
}
```

### 💾 **Query Caching**

```javascript
class RecipeRepository {
  constructor(database, cache) {
    this.db = database;
    this.cache = cache; // Redis or memory cache
  }

  async findById(id) {
    // Check cache first
    const cacheKey = `recipe:${id}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return RecipeModel.fromDatabaseRow(JSON.parse(cached));
    }

    // Query database
    const [rows] = await this.db.execute('SELECT * FROM recipes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return null;
    }

    const recipe = RecipeModel.fromDatabaseRow(rows[0]);
    
    // Cache result for 5 minutes
    await this.cache.setex(cacheKey, 300, JSON.stringify(rows[0]));
    
    return recipe;
  }

  async update(id, data) {
    const result = await this.updateDatabase(id, data);
    
    // Invalidate cache
    await this.cache.del(`recipe:${id}`);
    
    return result;
  }
}
```

### 📊 **Batch Operations**

```javascript
class RecipeRepository {
  async findByIds(ids) {
    if (ids.length === 0) return [];
    
    // Use IN clause for batch fetching
    const placeholders = ids.map(() => '?').join(',');
    const query = `SELECT * FROM recipes WHERE id IN (${placeholders})`;
    
    const [rows] = await this.db.execute(query, ids);
    
    // Maintain order based on input IDs
    const recipeMap = new Map();
    rows.forEach(row => {
      recipeMap.set(row.id, RecipeModel.fromDatabaseRow(row));
    });
    
    return ids.map(id => recipeMap.get(id)).filter(Boolean);
  }

  async updateBatch(updates) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      
      // Process in chunks to avoid query size limits
      const chunkSize = 100;
      for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        
        for (const { id, data } of chunk) {
          const result = await this.updateSingle(connection, id, data);
          results.push(result);
        }
      }
      
      await connection.commit();
      return results;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

---

## 🚫 Common Pitfalls & Best Practices

### ✅ **Best Practices:**

#### **1. Use Prepared Statements**
```javascript
// ✅ Good - Prepared statements prevent SQL injection
const query = 'SELECT * FROM recipes WHERE title = ?';
const [rows] = await this.db.execute(query, [title]);

// ❌ Bad - String concatenation vulnerable to SQL injection
const query = `SELECT * FROM recipes WHERE title = '${title}'`;
```

#### **2. Handle Errors Properly**
```javascript
// ✅ Good - Specific error handling
async create(data) {
  try {
    const result = await this.db.execute(query, params);
    return result;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Recipe already exists');
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error('Database schema error');
    }
    throw new Error(`Database operation failed: ${error.message}`);
  }
}

// ❌ Bad - Generic error handling
async create(data) {
  try {
    return await this.db.execute(query, params);
  } catch (error) {
    throw error; // Not helpful
  }
}
```

#### **3. Use Transactions for Related Operations**
```javascript
// ✅ Good - Use transactions for data integrity
async createWithIngredients(recipeData, ingredientsData) {
  const connection = await this.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const recipe = await this.createRecipe(connection, recipeData);
    await this.createIngredients(connection, recipe.id, ingredientsData);
    
    await connection.commit();
    return recipe;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

### 🚫 **Common Pitfalls:**

#### **1. N+1 Query Problem**
```javascript
// ❌ Bad - N+1 queries
async getRecipesWithAuthors() {
  const recipes = await this.findAll(); // 1 query
  
  for (const recipe of recipes) {
    recipe.author = await this.getAuthor(recipe.author_id); // N queries
  }
  
  return recipes;
}

// ✅ Good - Use JOIN or batch fetch
async getRecipesWithAuthors() {
  const query = `
    SELECT r.*, a.name as author_name
    FROM recipes r
    LEFT JOIN authors a ON r.author_id = a.id
  `;
  
  const [rows] = await this.db.execute(query);
  return rows.map(row => RecipeModel.fromDatabaseRow(row));
}
```

#### **2. Not Using Indexes**
```javascript
// ❌ Bad - Querying without considering indexes
async findByTitleSlow(title) {
  const query = 'SELECT * FROM recipes WHERE LOWER(title) LIKE ?';
  // This won't use index on title column
}

// ✅ Good - Use proper indexing strategy
async findByTitle(title) {
  const query = 'SELECT * FROM recipes WHERE title LIKE ?';
  // Assumes index on title column
}
```

#### **3. Memory Leaks with Large Result Sets**
```javascript
// ❌ Bad - Loading everything into memory
async getAllRecipesForExport() {
  const query = 'SELECT * FROM recipes'; // Could be millions of rows
  const [rows] = await this.db.execute(query);
  return rows;
}

// ✅ Good - Use streaming or pagination
async *getAllRecipesStream() {
  const batchSize = 1000;
  let offset = 0;
  
  while (true) {
    const query = 'SELECT * FROM recipes LIMIT ? OFFSET ?';
    const [rows] = await this.db.execute(query, [batchSize, offset]);
    
    if (rows.length === 0) break;
    
    yield rows.map(row => RecipeModel.fromDatabaseRow(row));
    offset += batchSize;
  }
}
```

---

## 🎯 Summary

### ✅ **Key Takeaways:**
- Repository mengelola semua akses database dengan interface yang konsisten
- Selalu gunakan prepared statements untuk keamanan
- Implementasi proper error handling dan transaction management
- Testing harus cover semua CRUD operations dan edge cases
- Optimasi performa dengan connection pooling dan caching

### 📚 **Next Steps:**
1. Pelajari Service Layer untuk business logic
2. Implementasi caching strategy
3. Explore database optimization techniques
4. Learn about CQRS pattern untuk complex applications

---

*Happy Repository Building! 📚✨*

> **Remember:** Repository adalah gatekeeper antara aplikasi dan database. Desain yang baik di sini akan membuat seluruh aplikasi lebih robust dan maintainable.
