# 🗃️ Repository Layer Deep Dive

> **Mastering Data Access dan Database Operations**

## 🎯 Learning Objectives

Setelah membaca chapter ini, Anda akan memahami:
- ✅ Peran Repository Layer dalam arsitektur
- ✅ Implementation Repository Pattern yang proper
- ✅ Database operations dengan error handling
- ✅ Data mapping antara database dan Model
- ✅ Query optimization dan best practices

## 🤔 Apa itu Repository Layer?

**Repository Layer** adalah **abstraction layer** antara business logic dan data storage. Layer ini menyediakan interface yang clean untuk mengakses data tanpa mengekspos detail implementasi database.

### 📊 Repository dalam Arsitektur

```
⚙️ SERVICE LAYER
       ⬇️
🗃️ REPOSITORY LAYER     ← You are here!
       ⬇️
💾 DATABASE
```

## 🔍 Tanggung Jawab Repository Layer

### ✅ **Primary Responsibilities**

1. **🎯 Data Access Abstraction**
   ```javascript
   // Hide SQL complexity from business logic
   async findAll() {
     // Complex SQL with joins, sorting, pagination
     // Return clean Model instances
   }
   ```

2. **📋 Database Operations**
   ```javascript
   // CRUD operations
   async create(data) { /* INSERT */ }
   async findById(id) { /* SELECT */ }
   async update(id, data) { /* UPDATE */ }
   async delete(id) { /* DELETE */ }
   ```

3. **🔄 Data Mapping**
   ```javascript
   // Convert database rows to Model instances
   const dbRow = { ingredients: '["rice","egg"]' };
   const model = new RecipeModel({
     ...dbRow,
     ingredients: JSON.parse(dbRow.ingredients)
   });
   ```

4. **⚡ Query Optimization**
   ```javascript
   // Efficient queries with proper indexing
   const query = `
     SELECT * FROM recipes 
     WHERE title LIKE ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?
   `;
   ```

5. **🛡️ Data Validation**
   ```javascript
   // Validate data before database operations
   const errors = this.validateWithModel(data);
   if (errors.length > 0) {
     throw new Error(`Validation failed: ${errors.join(', ')}`);
   }
   ```

## 🧩 Anatomy of Recipe Repository

### **File Structure:**
```javascript
// src/repositories/recipeRepository.js
class RecipeRepository {
  constructor(db) {
    this.db = db; // Database connection
  }

  // Core CRUD Operations
  async findAll(options = {}) { /* ... */ }
  async findById(id) { /* ... */ }
  async create(recipeData) { /* ... */ }
  async update(id, updateData) { /* ... */ }
  async delete(id) { /* ... */ }

  // Specialized Queries
  async findByTitle(title) { /* ... */ }
  async searchRecipes(query) { /* ... */ }
  async findPopular(limit = 10) { /* ... */ }

  // Utility Methods
  validateWithModel(data) { /* ... */ }
  mapRowToModel(row) { /* ... */ }
}
```

### **Detailed Implementation:**

#### 1. **Find All Recipes**
```javascript
async findAll(options = {}) {
  try {
    // 1. Extract options with defaults
    const { 
      page = 1, 
      limit = 10, 
      search = null, 
      sortBy = 'created_at',
      sortOrder = 'DESC' 
    } = options;

    // 2. Build dynamic query
    let query = 'SELECT * FROM recipes';
    const queryParams = [];

    // Add search condition if provided
    if (search) {
      query += ' WHERE title LIKE ? OR description LIKE ?';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Add sorting
    const allowedSortFields = ['id', 'title', 'created_at', 'updated_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';
    
    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    // Add pagination
    if (limit > 0) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
    }

    console.log('🗃️ Repository: Executing query:', query);
    console.log('🗃️ Repository: Query params:', queryParams);

    // 3. Execute query
    const [rows] = await this.db.query(query, queryParams);
    console.log(`🗃️ Repository: Found ${rows.length} recipes`);

    // 4. Map database rows to Model instances
    const recipes = rows.map(row => this.mapRowToModel(row));
    console.log('🗃️ Repository: Mapped to RecipeModel instances');

    return recipes;

  } catch (error) {
    console.error('❌ Repository: Error in findAll:', error);
    throw new Error(`Failed to fetch recipes: ${error.message}`);
  }
}
```

#### 2. **Find Recipe by ID**
```javascript
async findById(id) {
  try {
    // 1. Validate input
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }

    console.log('🗃️ Repository: Finding recipe by ID:', id);

    // 2. Execute query
    const query = 'SELECT * FROM recipes WHERE id = ?';
    const [rows] = await this.db.query(query, [parseInt(id)]);

    // 3. Check if recipe exists
    if (rows.length === 0) {
      console.log('🗃️ Repository: Recipe not found for ID:', id);
      return null;
    }

    // 4. Map to Model instance
    const recipe = this.mapRowToModel(rows[0]);
    console.log('🗃️ Repository: Recipe found and mapped:', recipe.title);

    return recipe;

  } catch (error) {
    console.error('❌ Repository: Error in findById:', error);
    throw new Error(`Failed to find recipe by ID: ${error.message}`);
  }
}
```

#### 3. **Create Recipe**
```javascript
async create(recipeData) {
  try {
    console.log('🗃️ Repository: Creating new recipe:', recipeData.title);

    // 1. Validate data using Model
    const validationErrors = this.validateWithModel(recipeData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // 2. Prepare database query
    const query = `
      INSERT INTO recipes (title, description, ingredients, instructions, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    // 3. Prepare data for database
    const dbData = [
      recipeData.title,
      recipeData.description || null,
      JSON.stringify(recipeData.ingredients || []),
      JSON.stringify(recipeData.instructions || [])
    ];

    console.log('🗃️ Repository: Executing INSERT query');

    // 4. Execute insertion
    const [result] = await this.db.query(query, dbData);
    const insertId = result.insertId;

    console.log('🗃️ Repository: Recipe created with ID:', insertId);

    // 5. Fetch and return the created recipe
    const createdRecipe = await this.findById(insertId);
    
    if (!createdRecipe) {
      throw new Error('Failed to retrieve created recipe');
    }

    return createdRecipe;

  } catch (error) {
    console.error('❌ Repository: Error in create:', error);
    throw new Error(`Failed to create recipe: ${error.message}`);
  }
}
```

#### 4. **Update Recipe**
```javascript
async update(id, updateData) {
  try {
    console.log('🗃️ Repository: Updating recipe ID:', id);

    // 1. Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }

    // 2. Check if recipe exists
    const existingRecipe = await this.findById(id);
    if (!existingRecipe) {
      throw new Error(`Recipe with ID ${id} not found`);
    }

    // 3. Merge existing data with updates for validation
    const mergedData = {
      ...existingRecipe.toJSON(),
      ...updateData
    };

    // 4. Validate merged data
    const validationErrors = this.validateWithModel(mergedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // 5. Build dynamic UPDATE query
    const updateFields = [];
    const updateValues = [];

    if (updateData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(updateData.title);
    }

    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updateData.description);
    }

    if (updateData.ingredients !== undefined) {
      updateFields.push('ingredients = ?');
      updateValues.push(JSON.stringify(updateData.ingredients));
    }

    if (updateData.instructions !== undefined) {
      updateFields.push('instructions = ?');
      updateValues.push(JSON.stringify(updateData.instructions));
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) { // Only updated_at
      throw new Error('No fields to update');
    }

    // 6. Execute update
    const query = `UPDATE recipes SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(parseInt(id));

    console.log('🗃️ Repository: Executing UPDATE query');
    const [result] = await this.db.query(query, updateValues);

    if (result.affectedRows === 0) {
      throw new Error('No rows were updated');
    }

    console.log('🗃️ Repository: Recipe updated successfully');

    // 7. Fetch and return updated recipe
    const updatedRecipe = await this.findById(id);
    return updatedRecipe;

  } catch (error) {
    console.error('❌ Repository: Error in update:', error);
    throw new Error(`Failed to update recipe: ${error.message}`);
  }
}
```

#### 5. **Delete Recipe**
```javascript
async delete(id) {
  try {
    console.log('🗃️ Repository: Deleting recipe ID:', id);

    // 1. Validate ID
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid recipe ID provided');
    }

    // 2. Fetch recipe before deletion (for return value)
    const recipeToDelete = await this.findById(id);
    if (!recipeToDelete) {
      throw new Error(`Recipe with ID ${id} not found`);
    }

    // 3. Execute deletion
    const query = 'DELETE FROM recipes WHERE id = ?';
    console.log('🗃️ Repository: Executing DELETE query');
    
    const [result] = await this.db.query(query, [parseInt(id)]);

    if (result.affectedRows === 0) {
      throw new Error('No rows were deleted');
    }

    console.log('🗃️ Repository: Recipe deleted successfully');

    // 4. Return the deleted recipe data
    return recipeToDelete;

  } catch (error) {
    console.error('❌ Repository: Error in delete:', error);
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
}
```

## 🔧 Utility Methods

### **Data Mapping Method**
```javascript
mapRowToModel(row) {
  try {
    // Parse JSON fields from database
    const mappedData = {
      ...row,
      ingredients: this.parseJsonField(row.ingredients),
      instructions: this.parseJsonField(row.instructions)
    };

    // Create and return Model instance
    return new RecipeModel(mappedData);

  } catch (error) {
    console.error('❌ Repository: Error mapping row to model:', error);
    throw new Error(`Failed to map database row to model: ${error.message}`);
  }
}

parseJsonField(field) {
  try {
    if (typeof field === 'string') {
      return JSON.parse(field);
    }
    if (Array.isArray(field)) {
      return field;
    }
    return [];
  } catch (error) {
    console.warn('⚠️ Repository: Failed to parse JSON field, returning empty array');
    return [];
  }
}
```

### **Model Validation Method**
```javascript
validateWithModel(data) {
  try {
    // Create temporary Model instance for validation
    const tempModel = new RecipeModel(data);
    
    // Use Model's validation method
    const errors = tempModel.validate();
    
    // Additional repository-level validations
    if (data.title && data.title.length > 255) {
      errors.push('Title exceeds maximum length of 255 characters');
    }

    if (data.ingredients && data.ingredients.length > 50) {
      errors.push('Too many ingredients (maximum 50 allowed)');
    }

    return errors;

  } catch (error) {
    return [`Validation error: ${error.message}`];
  }
}
```

## 🔍 Specialized Query Methods

### **Search Recipes**
```javascript
async searchRecipes(searchQuery, options = {}) {
  try {
    const { limit = 10, page = 1 } = options;
    
    const query = `
      SELECT * FROM recipes 
      WHERE title LIKE ? 
         OR description LIKE ? 
         OR JSON_SEARCH(ingredients, 'one', ?) IS NOT NULL
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1
          WHEN description LIKE ? THEN 2
          ELSE 3
        END,
        created_at DESC
      LIMIT ? OFFSET ?
    `;

    const searchPattern = `%${searchQuery}%`;
    const params = [
      searchPattern, // title
      searchPattern, // description  
      searchPattern, // ingredients JSON search
      searchPattern, // title priority
      searchPattern, // description priority
      limit,
      (page - 1) * limit
    ];

    const [rows] = await this.db.query(query, params);
    return rows.map(row => this.mapRowToModel(row));

  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}
```

### **Find by Title**
```javascript
async findByTitle(title) {
  try {
    const query = 'SELECT * FROM recipes WHERE title = ?';
    const [rows] = await this.db.query(query, [title]);
    
    return rows.length > 0 ? this.mapRowToModel(rows[0]) : null;

  } catch (error) {
    throw new Error(`Failed to find recipe by title: ${error.message}`);
  }
}
```

## 🚀 Performance Optimization

### **Database Indexing**
```sql
-- Add indexes for better query performance
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_updated_at ON recipes(updated_at);

-- Full-text search index for better search performance
ALTER TABLE recipes ADD FULLTEXT(title, description);
```

### **Query Optimization**
```javascript
// Use prepared statements for repeated queries
class RecipeRepository {
  constructor(db) {
    this.db = db;
    
    // Prepare commonly used queries
    this.preparedQueries = {
      findById: 'SELECT * FROM recipes WHERE id = ?',
      deleteById: 'DELETE FROM recipes WHERE id = ?',
      updateById: 'UPDATE recipes SET title = ?, description = ?, updated_at = NOW() WHERE id = ?'
    };
  }

  async findById(id) {
    const [rows] = await this.db.query(this.preparedQueries.findById, [id]);
    return rows.length > 0 ? this.mapRowToModel(rows[0]) : null;
  }
}
```

### **Connection Pooling**
```javascript
// src/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // Optimize based on your needs
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

module.exports = pool;
```

## 🧪 Testing Repository Layer

### **Unit Test Example:**
```javascript
describe('RecipeRepository', () => {
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      query: jest.fn()
    };
    repository = new RecipeRepository(mockDb);
  });

  describe('findById', () => {
    it('should return RecipeModel instance when recipe found', async () => {
      // Arrange
      const mockRow = {
        id: 1,
        title: 'Test Recipe',
        ingredients: '["ingredient1"]',
        instructions: '["step1"]'
      };
      
      mockDb.query.mockResolvedValue([[mockRow]]);

      // Act
      const result = await repository.findById(1);

      // Assert
      expect(result).toBeInstanceOf(RecipeModel);
      expect(result.id).toBe(1);
      expect(result.title).toBe('Test Recipe');
      expect(result.ingredients).toEqual(['ingredient1']);
    });

    it('should return null when recipe not found', async () => {
      // Arrange
      mockDb.query.mockResolvedValue([[]]);

      // Act
      const result = await repository.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

## 🎯 Best Practices

### **✅ Do's**

1. **Always Use Model for Data Mapping**
   ```javascript
   // ✅ Good - consistent data structure
   return rows.map(row => this.mapRowToModel(row));
   ```

2. **Validate Before Database Operations**
   ```javascript
   // ✅ Good - prevent invalid data in database
   const errors = this.validateWithModel(data);
   if (errors.length > 0) {
     throw new Error(`Validation failed: ${errors.join(', ')}`);
   }
   ```

3. **Use Prepared Statements**
   ```javascript
   // ✅ Good - SQL injection protection
   const [rows] = await this.db.query('SELECT * FROM recipes WHERE id = ?', [id]);
   ```

### **❌ Don'ts**

1. **Don't Put Business Logic in Repository**
   ```javascript
   // ❌ Bad - business logic belongs in service
   async create(data) {
     if (user.role !== 'chef') {
       throw new Error('Only chefs can create recipes');
     }
   }
   ```

2. **Don't Return Raw Database Rows**
   ```javascript
   // ❌ Bad - inconsistent data structure
   return rows; // Raw database rows
   
   // ✅ Good - consistent Model instances
   return rows.map(row => this.mapRowToModel(row));
   ```

3. **Don't Ignore Error Handling**
   ```javascript
   // ❌ Bad - no error handling
   async findById(id) {
     const [rows] = await this.db.query('SELECT * FROM recipes WHERE id = ?', [id]);
     return this.mapRowToModel(rows[0]);
   }
   ```

## 🏋️‍♂️ Exercise

### **Exercise 1: Add Pagination**
Implement proper pagination in `findAll`:
- Calculate total count
- Return pagination metadata
- Handle edge cases

### **Exercise 2: Implement Bulk Operations**
Create methods for bulk operations:
- `createMany(recipes)` - Insert multiple recipes
- `deleteMany(ids)` - Delete multiple recipes
- `updateMany(updates)` - Bulk updates

### **Exercise 3: Add Caching Layer**
Implement caching in repository:
- Cache frequently accessed recipes
- Invalidate cache on updates
- Handle cache misses gracefully

## 📚 Further Reading

- [📋 Model Layer Guide](06-model-layer.md)
- [⚙️ Service Layer Integration](04-service-layer.md)
- [🧪 Repository Testing](08-testing-fundamentals.md)

---

## 🚀 Next Step

**[▶️ Lanjut ke Model Layer →](06-model-layer.md)**

---

*💡 **Tip**: Repository layer should be the only place yang tahu tentang database schema - abstraksi yang baik membuat perubahan database tidak mempengaruhi business logic!*
