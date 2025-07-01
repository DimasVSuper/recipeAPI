# 12 - Common Pitfalls & Anti-patterns

> **Chapter 12: Learn from Mistakes - Identifying and Avoiding Common Development Pitfalls**

## 📋 Chapter Overview

Common Pitfalls adalah **mistakes yang sering terjadi** dalam pengembangan aplikasi. Chapter ini akan membahas:
- **Architecture anti-patterns** dan solusinya
- **Performance pitfalls** yang umum terjadi
- **Security vulnerabilities** yang sering terlewat
- **Testing mistakes** yang mengurangi efektivitas
- **Code quality issues** yang sulit di-maintain

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Mengenali anti-patterns dalam layered architecture
- ✅ Menghindari performance bottlenecks yang umum
- ✅ Mengidentifikasi security vulnerabilities
- ✅ Mengatasi testing issues yang sering terjadi
- ✅ Mencegah code quality problems
- ✅ Implement preventive measures untuk setiap pitfall

## 🏗️ Architecture Anti-patterns

### **❌ Pitfall 1: Fat Controllers (God Object)**
```javascript
// BAD: Controller dengan terlalu banyak responsibility
class RecipeController {
  async createRecipe(req, res) {
    try {
      // ❌ Validation logic di controller
      if (!req.body.title || req.body.title.length < 3) {
        return res.status(400).json({ error: 'Invalid title' });
      }
      
      // ❌ Database logic di controller
      const connection = mysql.createConnection(dbConfig);
      const sql = 'INSERT INTO recipes (title, description) VALUES (?, ?)';
      const result = await connection.query(sql, [req.body.title, req.body.description]);
      
      // ❌ Business logic di controller
      if (req.body.difficulty === 'hard' && req.body.cookingTime < 60) {
        // Complex difficulty calculation
        req.body.difficulty = 'medium';
      }
      
      // ❌ Email sending di controller
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter(emailConfig);
      await transporter.sendMail({
        to: req.body.authorEmail,
        subject: 'Recipe Created',
        text: 'Your recipe has been created successfully'
      });
      
      // ❌ File upload handling di controller
      if (req.files && req.files.image) {
        const uploadPath = path.join(__dirname, 'uploads', req.files.image.name);
        await req.files.image.mv(uploadPath);
      }
      
      res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

**✅ Solution: Proper Separation of Concerns**
```javascript
// GOOD: Controller fokus pada HTTP handling saja
class RecipeController {
  constructor(recipeService, validationService, notificationService) {
    this.recipeService = recipeService;
    this.validationService = validationService;
    this.notificationService = notificationService;
  }

  async createRecipe(req, res, next) {
    try {
      // Validation handled by middleware
      const recipe = await this.recipeService.createRecipe(req.body);
      
      // Notification handled by service
      await this.notificationService.sendRecipeCreatedNotification(recipe);
      
      res.status(201).json({
        success: true,
        data: recipe
      });
    } catch (error) {
      next(error); // Error handling by middleware
    }
  }
}
```

### **❌ Pitfall 2: Anemic Domain Model**
```javascript
// BAD: Model tanpa behavior, hanya data container
class Recipe {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.ingredients = data.ingredients;
    this.instructions = data.instructions;
    this.difficulty = data.difficulty;
    this.cookingTime = data.cookingTime;
  }
  
  // ❌ No business logic, only getters/setters
  getTitle() { return this.title; }
  setTitle(title) { this.title = title; }
}

// All logic scattered in services
class RecipeService {
  calculateDifficulty(recipe) {
    if (recipe.cookingTime < 30 && recipe.ingredients.length < 5) {
      return 'easy';
    } else if (recipe.cookingTime < 60 && recipe.ingredients.length < 10) {
      return 'medium';
    } else {
      return 'hard';
    }
  }
  
  validateRecipe(recipe) {
    const errors = [];
    if (!recipe.title || recipe.title.length < 3) {
      errors.push('Title too short');
    }
    // More validation...
    return errors;
  }
}
```

**✅ Solution: Rich Domain Model**
```javascript
// GOOD: Model dengan business logic dan validation
class Recipe {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.ingredients = data.ingredients || [];
    this.instructions = data.instructions || [];
    this.cookingTime = data.cookingTime;
    this.difficulty = data.difficulty || this.calculateDifficulty();
  }
  
  // Business logic in model
  calculateDifficulty() {
    const timeWeight = this.cookingTime > 60 ? 2 : this.cookingTime > 30 ? 1 : 0;
    const ingredientWeight = this.ingredients.length > 10 ? 2 : this.ingredients.length > 5 ? 1 : 0;
    
    const totalWeight = timeWeight + ingredientWeight;
    
    if (totalWeight === 0) return 'easy';
    if (totalWeight <= 2) return 'medium';
    return 'hard';
  }
  
  // Validation with business rules
  validate() {
    const errors = [];
    
    if (!this.title?.trim() || this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    
    if (this.ingredients.length === 0) {
      errors.push('At least one ingredient is required');
    }
    
    if (this.instructions.length === 0) {
      errors.push('At least one instruction is required');
    }
    
    // Business rule: Hard recipes must have cooking time
    if (this.difficulty === 'hard' && !this.cookingTime) {
      errors.push('Hard recipes must specify cooking time');
    }
    
    return errors;
  }
  
  // Domain behavior
  addIngredient(ingredient) {
    if (ingredient?.trim() && !this.ingredients.includes(ingredient.trim())) {
      this.ingredients.push(ingredient.trim());
      this.difficulty = this.calculateDifficulty(); // Recalculate
    }
  }
  
  getTotalTime() {
    return (this.prepTime || 0) + (this.cookingTime || 0);
  }
  
  isQuickRecipe() {
    return this.getTotalTime() <= 30;
  }
}
```

### **❌ Pitfall 3: Tight Coupling Between Layers**
```javascript
// BAD: Direct dependencies dan hardcoded imports
class RecipeService {
  async createRecipe(recipeData) {
    // ❌ Direct database dependency
    const db = mysql.createConnection(dbConfig);
    
    // ❌ Hardcoded repository class
    const repository = new RecipeRepository(db);
    
    // ❌ Direct email service dependency
    const emailService = new EmailService(emailConfig);
    
    const recipe = await repository.create(recipeData);
    await emailService.send(recipe.authorEmail, 'Recipe Created');
    
    return recipe;
  }
}
```

**✅ Solution: Dependency Injection**
```javascript
// GOOD: Dependency injection dan interfaces
class RecipeService {
  constructor(repository, notificationService, logger) {
    this.repository = repository;
    this.notificationService = notificationService;
    this.logger = logger;
  }
  
  async createRecipe(recipeData) {
    try {
      const recipe = new Recipe(recipeData);
      const errors = recipe.validate();
      
      if (errors.length > 0) {
        throw new ValidationError(errors);
      }
      
      const savedRecipe = await this.repository.create(recipe);
      
      // Async notification
      this.notificationService.sendRecipeCreatedNotification(savedRecipe)
        .catch(error => this.logger.error('Notification failed', error));
      
      return savedRecipe.toJSON();
    } catch (error) {
      this.logger.error('Recipe creation failed', error);
      throw error;
    }
  }
}

// Dependency container setup
const recipeService = new RecipeService(
  new RecipeRepository(database),
  new NotificationService(emailConfig),
  new Logger()
);
```

## ⚡ Performance Pitfalls

### **❌ Pitfall 4: N+1 Query Problem**
```javascript
// BAD: N+1 queries
class RecipeService {
  async getAllRecipesWithAuthors() {
    // 1 query to get all recipes
    const recipes = await this.recipeRepository.findAll();
    
    // N queries to get each author (N+1 problem!)
    for (const recipe of recipes) {
      recipe.author = await this.userRepository.findById(recipe.authorId);
    }
    
    return recipes;
  }
}
```

**✅ Solution: Efficient Queries**
```javascript
// GOOD: Single query with JOIN or batch loading
class RecipeService {
  async getAllRecipesWithAuthors() {
    // Option 1: Single query with JOIN
    return await this.recipeRepository.findAllWithAuthors();
    
    // Option 2: Batch loading
    // const recipes = await this.recipeRepository.findAll();
    // const authorIds = [...new Set(recipes.map(r => r.authorId))];
    // const authors = await this.userRepository.findByIds(authorIds);
    // const authorMap = new Map(authors.map(a => [a.id, a]));
    // 
    // return recipes.map(recipe => ({
    //   ...recipe,
    //   author: authorMap.get(recipe.authorId)
    // }));
  }
}

// Repository implementation
class RecipeRepository {
  async findAllWithAuthors() {
    const query = `
      SELECT 
        r.*,
        u.id as author_id,
        u.username as author_username,
        u.email as author_email
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await this.db.execute(query);
    return this.mapRecipesWithAuthors(rows);
  }
}
```

### **❌ Pitfall 5: Memory Leaks**
```javascript
// BAD: Memory leaks dari event listeners dan timers
class RecipeNotificationService {
  constructor() {
    this.subscribers = [];
    
    // ❌ Event listener tidak di-cleanup
    process.on('recipeCreated', this.handleRecipeCreated.bind(this));
    
    // ❌ Timer tidak di-cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldNotifications();
    }, 60000);
    
    // ❌ Accumulating subscribers tanpa cleanup
    this.subscribe = (callback) => {
      this.subscribers.push(callback);
    };
  }
  
  handleRecipeCreated(recipe) {
    // Process notification
    this.subscribers.forEach(callback => callback(recipe));
  }
}
```

**✅ Solution: Proper Resource Management**
```javascript
// GOOD: Proper cleanup dan resource management
class RecipeNotificationService {
  constructor() {
    this.subscribers = new Set(); // Use Set untuk efficient add/remove
    this.cleanupInterval = null;
    this.isShuttingDown = false;
    
    // Bound methods untuk consistent cleanup
    this.handleRecipeCreated = this.handleRecipeCreated.bind(this);
    this.handleShutdown = this.handleShutdown.bind(this);
    
    this.initialize();
  }
  
  initialize() {
    process.on('recipeCreated', this.handleRecipeCreated);
    process.on('SIGTERM', this.handleShutdown);
    process.on('SIGINT', this.handleShutdown);
    
    this.cleanupInterval = setInterval(() => {
      if (!this.isShuttingDown) {
        this.cleanupOldNotifications();
      }
    }, 60000);
  }
  
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  async handleRecipeCreated(recipe) {
    if (this.isShuttingDown) return;
    
    // Process in parallel with error handling
    const notificationPromises = Array.from(this.subscribers).map(async (callback) => {
      try {
        await callback(recipe);
      } catch (error) {
        console.error('Notification callback failed:', error);
      }
    });
    
    await Promise.allSettled(notificationPromises);
  }
  
  async handleShutdown() {
    this.isShuttingDown = true;
    
    // Cleanup resources
    process.removeListener('recipeCreated', this.handleRecipeCreated);
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.subscribers.clear();
    
    console.log('RecipeNotificationService shutdown complete');
  }
}
```

### **❌ Pitfall 6: Blocking Operations**
```javascript
// BAD: Blocking operations
class RecipeImageProcessor {
  async processRecipeImage(imageBuffer) {
    // ❌ Synchronous CPU-intensive operation
    const processedImage = this.resizeImageSync(imageBuffer);
    
    // ❌ Synchronous file operations
    const fs = require('fs');
    fs.writeFileSync('./uploads/processed.jpg', processedImage);
    
    // ❌ Blocking third-party API call without timeout
    const response = await fetch('https://api.slowservice.com/analyze', {
      method: 'POST',
      body: processedImage
    });
    
    return response.json();
  }
}
```

**✅ Solution: Non-blocking Operations**
```javascript
// GOOD: Non-blocking operations dengan proper error handling
class RecipeImageProcessor {
  constructor() {
    this.processingQueue = [];
    this.maxConcurrent = 3;
    this.currentProcessing = 0;
  }
  
  async processRecipeImage(imageBuffer) {
    return new Promise((resolve, reject) => {
      this.processingQueue.push({ imageBuffer, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.currentProcessing >= this.maxConcurrent || this.processingQueue.length === 0) {
      return;
    }
    
    this.currentProcessing++;
    const { imageBuffer, resolve, reject } = this.processingQueue.shift();
    
    try {
      const result = await this.processImageAsync(imageBuffer);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.currentProcessing--;
      this.processQueue(); // Process next item
    }
  }
  
  async processImageAsync(imageBuffer) {
    // Use worker threads untuk CPU-intensive operations
    const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
    
    if (isMainThread) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { imageBuffer }
        });
        
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
        
        // Timeout untuk prevent hanging
        setTimeout(() => {
          worker.terminate();
          reject(new Error('Image processing timeout'));
        }, 30000);
      });
    }
    
    // Worker thread code
    const sharp = require('sharp');
    const processedImage = await sharp(workerData.imageBuffer)
      .resize(800, 600)
      .jpeg({ quality: 80 })
      .toBuffer();
    
    parentPort.postMessage(processedImage);
  }
  
  async saveImageAsync(imageBuffer, filename) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const uploadDir = './uploads';
    const fullPath = path.join(uploadDir, filename);
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Non-blocking file write
    await fs.writeFile(fullPath, imageBuffer);
    
    return fullPath;
  }
  
  async analyzeImageWithRetry(imageBuffer, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch('https://api.imageanalysis.com/analyze', {
          method: 'POST',
          body: imageBuffer,
          headers: { 'Content-Type': 'image/jpeg' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Image analysis attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Image analysis failed after ${maxRetries} attempts`);
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}
```

## 🔒 Security Pitfalls

### **❌ Pitfall 7: SQL Injection**
```javascript
// BAD: String concatenation dan interpolation
class RecipeRepository {
  async searchRecipes(searchTerm, userId) {
    // ❌ Direct string concatenation - SQL injection vulnerable!
    const query = `
      SELECT * FROM recipes 
      WHERE title LIKE '%${searchTerm}%' 
      AND author_id = ${userId}
    `;
    
    const [rows] = await this.db.query(query);
    return rows;
  }
  
  async getRecipesByCategory(category) {
    // ❌ Template literal - still vulnerable!
    const query = `SELECT * FROM recipes WHERE category = '${category}'`;
    return await this.db.query(query);
  }
}
```

**✅ Solution: Parameterized Queries**
```javascript
// GOOD: Parameterized queries dan input validation
class RecipeRepository {
  async searchRecipes(searchTerm, userId) {
    // Input validation
    if (typeof searchTerm !== 'string' || typeof userId !== 'number') {
      throw new Error('Invalid search parameters');
    }
    
    // Sanitize search term
    searchTerm = searchTerm.trim();
    if (searchTerm.length < 2) {
      throw new Error('Search term must be at least 2 characters');
    }
    
    // ✅ Parameterized query
    const query = `
      SELECT * FROM recipes 
      WHERE title LIKE ? 
      AND author_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await this.db.execute(query, [searchPattern, userId]);
    
    return rows.map(row => this.parseRecipe(row));
  }
  
  async getRecipesByCategory(category) {
    // Validate category against whitelist
    const allowedCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
    if (!allowedCategories.includes(category)) {
      throw new Error('Invalid category');
    }
    
    const query = 'SELECT * FROM recipes WHERE category = ?';
    const [rows] = await this.db.execute(query, [category]);
    
    return rows.map(row => this.parseRecipe(row));
  }
}
```

### **❌ Pitfall 8: Weak Authentication**
```javascript
// BAD: Weak authentication dan session management
class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    
    // ❌ Plain text password comparison
    const user = await User.findOne({ username, password });
    
    if (user) {
      // ❌ Predictable session ID
      const sessionId = Date.now().toString();
      
      // ❌ No session expiration
      sessions[sessionId] = user;
      
      // ❌ Session ID in URL
      res.redirect(`/dashboard?session=${sessionId}`);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
}
```

**✅ Solution: Secure Authentication**
```javascript
// GOOD: Secure authentication dengan best practices
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const speakeasy = require('speakeasy');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later'
});

class AuthController {
  constructor(userService, logger) {
    this.userService = userService;
    this.logger = logger;
  }
  
  async login(req, res, next) {
    try {
      const { username, password, totpToken } = req.body;
      
      // Input validation
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      // Find user (don't reveal if user exists)
      const user = await this.userService.findByUsername(username);
      if (!user) {
        await this.simulatePasswordCheck(); // Prevent timing attacks
        return this.sendInvalidCredentialsResponse(res, req.ip);
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return this.sendInvalidCredentialsResponse(res, req.ip);
      }
      
      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > Date.now()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed attempts'
        });
      }
      
      // Verify 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          return res.status(200).json({
            success: false,
            requiresTwoFactor: true,
            message: 'Two-factor authentication required'
          });
        }
        
        const isValidTotp = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: totpToken,
          window: 2
        });
        
        if (!isValidTotp) {
          return this.sendInvalidCredentialsResponse(res, req.ip);
        }
      }
      
      // Reset failed login attempts
      await this.userService.resetFailedAttempts(user.id);
      
      // Generate secure JWT
      const token = this.generateSecureToken(user);
      
      // Log successful login
      this.logger.info('User login successful', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // Secure cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      };
      
      res.cookie('authToken', token, cookieOptions);
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
      
    } catch (error) {
      next(error);
    }
  }
  
  generateSecureToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
        issuer: 'recipe-api',
        audience: 'recipe-app'
      }
    );
  }
  
  async simulatePasswordCheck() {
    // Prevent timing attacks by simulating password check
    await bcrypt.compare('dummy-password', '$2b$12$dummy.hash.to.prevent.timing.attacks');
  }
  
  async sendInvalidCredentialsResponse(res, ip) {
    this.logger.warn('Invalid login attempt', { ip });
    
    // Consistent response time to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
}

// Apply rate limiting to login route
app.post('/api/auth/login', loginLimiter, authController.login.bind(authController));
```

## 🧪 Testing Pitfalls

### **❌ Pitfall 9: Fragile Tests**
```javascript
// BAD: Tests yang bergantung pada external state
describe('Recipe API', () => {
  test('should return all recipes', async () => {
    const response = await request(app).get('/api/recipes');
    
    // ❌ Hard-coded expectations yang fragile
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0].title).toBe('Pasta Carbonara');
    expect(response.body.data[0].id).toBe(1);
  });
  
  test('should create recipe', async () => {
    const response = await request(app)
      .post('/api/recipes')
      .send({ title: 'New Recipe' });
    
    // ❌ Assumes specific ID
    expect(response.body.data.id).toBe(6);
  });
});
```

**✅ Solution: Robust Test Design**
```javascript
// GOOD: Tests yang resilient dan independent
describe('Recipe API', () => {
  beforeEach(async () => {
    // Clean slate untuk setiap test
    await cleanDatabase();
    await seedTestData();
  });
  
  test('should return all recipes', async () => {
    // Seed known data
    const testRecipes = await createTestRecipes([
      { title: 'Test Recipe 1' },
      { title: 'Test Recipe 2' }
    ]);
    
    const response = await request(app).get('/api/recipes');
    
    // ✅ Flexible expectations
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(testRecipes.length);
    
    // Verify structure, not specific values
    const recipe = response.body.data[0];
    expect(recipe).toHaveProperty('id');
    expect(recipe).toHaveProperty('title');
    expect(recipe).toHaveProperty('ingredients');
    expect(recipe).toHaveProperty('instructions');
  });
  
  test('should create recipe and return it', async () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'Test Description',
      ingredients: ['ingredient1', 'ingredient2'],
      instructions: ['step1', 'step2']
    };
    
    const response = await request(app)
      .post('/api/recipes')
      .send(recipeData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    const createdRecipe = response.body.data;
    expect(createdRecipe.id).toBeDefined();
    expect(createdRecipe.title).toBe(recipeData.title);
    expect(createdRecipe.ingredients).toEqual(recipeData.ingredients);
    
    // Verify persistence
    const getResponse = await request(app)
      .get(`/api/recipes/${createdRecipe.id}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.title).toBe(recipeData.title);
  });
});
```

### **❌ Pitfall 10: Insufficient Test Coverage**
```javascript
// BAD: Only testing happy path
describe('RecipeService', () => {
  test('should create recipe', async () => {
    const recipe = await recipeService.createRecipe({
      title: 'Test Recipe',
      ingredients: ['ingredient1'],
      instructions: ['step1']
    });
    
    expect(recipe).toBeDefined();
    expect(recipe.title).toBe('Test Recipe');
  });
});
```

**✅ Solution: Comprehensive Test Coverage**
```javascript
// GOOD: Testing edge cases, errors, dan boundary conditions
describe('RecipeService', () => {
  describe('createRecipe', () => {
    test('should create recipe with valid data', async () => {
      const validData = {
        title: 'Valid Recipe',
        description: 'Valid description',
        ingredients: ['ingredient1', 'ingredient2'],
        instructions: ['step1', 'step2']
      };
      
      const recipe = await recipeService.createRecipe(validData);
      
      expect(recipe).toBeDefined();
      expect(recipe.id).toBeDefined();
      expect(recipe.title).toBe(validData.title);
      expect(recipe.ingredients).toEqual(validData.ingredients);
    });
    
    test('should reject recipe with empty title', async () => {
      const invalidData = {
        title: '',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      await expect(recipeService.createRecipe(invalidData))
        .rejects.toThrow('Validation failed');
    });
    
    test('should reject recipe with short title', async () => {
      const invalidData = {
        title: 'Hi',
        ingredients: ['ingredient1'],
        instructions: ['step1']
      };
      
      await expect(recipeService.createRecipe(invalidData))
        .rejects.toThrow('Title must be at least 3 characters');
    });
    
    test('should reject recipe without ingredients', async () => {
      const invalidData = {
        title: 'Valid Title',
        ingredients: [],
        instructions: ['step1']
      };
      
      await expect(recipeService.createRecipe(invalidData))
        .rejects.toThrow('ingredients is required');
    });
    
    test('should handle database errors gracefully', async () => {
      // Mock repository to throw error
      const mockRepository = {
        create: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };
      
      const serviceWithMockRepo = new RecipeService(mockRepository);
      
      await expect(serviceWithMockRepo.createRecipe(validData))
        .rejects.toThrow('Database connection failed');
    });
    
    test('should sanitize input data', async () => {
      const dataWithWhitespace = {
        title: '  Recipe with spaces  ',
        description: '  Description with spaces  ',
        ingredients: ['  ingredient1  ', '  ingredient2  '],
        instructions: ['  step1  ', '  step2  ']
      };
      
      const recipe = await recipeService.createRecipe(dataWithWhitespace);
      
      expect(recipe.title).toBe('Recipe with spaces');
      expect(recipe.description).toBe('Description with spaces');
      expect(recipe.ingredients).toEqual(['ingredient1', 'ingredient2']);
      expect(recipe.instructions).toEqual(['step1', 'step2']);
    });
    
    test('should handle very long ingredient lists', async () => {
      const manyIngredients = Array.from({ length: 100 }, (_, i) => `ingredient${i + 1}`);
      
      const dataWithManyIngredients = {
        title: 'Recipe with many ingredients',
        ingredients: manyIngredients,
        instructions: ['step1']
      };
      
      const recipe = await recipeService.createRecipe(dataWithManyIngredients);
      
      expect(recipe.ingredients).toHaveLength(100);
      expect(recipe.difficulty).toBe('hard'); // Should calculate as hard due to many ingredients
    });
  });
});
```

## 📝 Hands-on Exercises

### **Exercise 1: Refactor Fat Controller**
```javascript
// exercises/refactorController.js
// TODO: Refactor this fat controller following SRP
class BlogController {
  async createPost(req, res) {
    // Validation logic
    if (!req.body.title || req.body.title.length < 5) {
      return res.status(400).json({ error: 'Title too short' });
    }
    
    // Database logic
    const connection = mysql.createConnection(dbConfig);
    const sql = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    
    // Business logic
    if (req.body.category === 'premium' && !req.user.isPremium) {
      return res.status(403).json({ error: 'Premium required' });
    }
    
    // File handling
    if (req.files && req.files.image) {
      // Image processing logic
    }
    
    // Email sending
    const nodemailer = require('nodemailer');
    // Email logic
    
    res.json({ success: true });
  }
}
```

### **Exercise 2: Fix Security Vulnerabilities**
```javascript
// exercises/fixSecurity.js
// TODO: Identify dan fix security issues
class UserController {
  async getUserData(req, res) {
    const userId = req.params.id;
    
    // SQL injection vulnerable
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    const user = await db.query(query);
    
    // Returning sensitive data
    res.json({
      user: user,
      password: user.password,
      creditCard: user.creditCard
    });
  }
  
  async login(req, res) {
    const { username, password } = req.body;
    
    // Plain text password
    const user = await User.findOne({ username, password });
    
    if (user) {
      // Weak session management
      req.session.user = user;
      res.json({ success: true });
    }
  }
}
```

### **Exercise 3: Optimize Performance**
```javascript
// exercises/optimizePerformance.js
// TODO: Fix performance issues
class ProductService {
  async getProductsWithReviews() {
    const products = await this.productRepository.findAll();
    
    // N+1 query problem
    for (const product of products) {
      product.reviews = await this.reviewRepository.findByProductId(product.id);
      
      // Inefficient calculations
      product.averageRating = product.reviews.reduce((sum, review) => {
        return sum + review.rating;
      }, 0) / product.reviews.length;
    }
    
    return products;
  }
}
```

## 🎯 Prevention Strategies

### **✅ Code Review Checklist**
```javascript
// Code review checklist untuk prevent pitfalls
const codeReviewChecklist = {
  architecture: [
    '✅ Single Responsibility Principle followed?',
    '✅ Proper separation of concerns?',
    '✅ Dependencies properly injected?',
    '✅ No tight coupling between layers?'
  ],
  
  performance: [
    '✅ No N+1 query problems?',
    '✅ Proper pagination implemented?',
    '✅ No memory leaks (event listeners, timers)?',
    '✅ No blocking operations in main thread?'
  ],
  
  security: [
    '✅ All inputs validated and sanitized?',
    '✅ Parameterized queries used?',
    '✅ Authentication/authorization implemented?',
    '✅ No sensitive data in logs/responses?'
  ],
  
  testing: [
    '✅ Tests are independent and repeatable?',
    '✅ Edge cases and error scenarios covered?',
    '✅ Mocks used appropriately?',
    '✅ Test data properly managed?'
  ]
};
```

### **✅ Static Analysis Tools**
```javascript
// ESLint rules untuk prevent common pitfalls
module.exports = {
  extends: ['eslint:recommended', '@typescript-eslint/recommended'],
  rules: {
    // Prevent performance issues
    'no-await-in-loop': 'error',
    'prefer-const': 'error',
    
    // Prevent security issues
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Prevent maintainability issues
    'complexity': ['error', 10],
    'max-lines-per-function': ['error', 50],
    'max-params': ['error', 4],
    
    // Prevent common bugs
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-promise-reject-errors': 'error'
  }
};
```

## 🚀 Next Steps

Setelah memahami Common Pitfalls:

1. **[🔧 Troubleshooting →](13-troubleshooting.md)** - Debug production issues
2. **Apply to Current Projects** - Review existing code for these pitfalls
3. **Create Prevention Processes** - Implement code review checklists

---

## 💡 Key Takeaways

- **Architecture Matters** - Poor architecture leads to maintenance nightmares
- **Performance from Day One** - Fix performance issues early
- **Security is Not Optional** - Build security into every layer
- **Test Everything** - Including edge cases and error scenarios
- **Code Reviews Prevent Problems** - Multiple eyes catch more issues
- **Static Analysis Helps** - Use tools to catch issues automatically

**Next Chapter: [13 - Troubleshooting →](13-troubleshooting.md)**
