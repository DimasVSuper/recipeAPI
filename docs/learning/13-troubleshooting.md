# 13 - Troubleshooting & Debugging

> **Chapter 13: Master the Art of Debugging - Systematic Problem Solving for Production Issues**

## 📋 Chapter Overview

Troubleshooting adalah **essential skill** untuk setiap developer. Chapter ini mencakup:
- **Systematic debugging approaches** untuk berbagai jenis masalah
- **Production debugging techniques** tanpa downtime
- **Performance profiling** dan bottleneck identification
- **Log analysis** dan monitoring untuk root cause analysis
- **Common debugging tools** dan best practices

## 🎯 Learning Objectives

Setelah chapter ini, Anda akan:
- ✅ Menguasai systematic debugging methodology
- ✅ Debug production issues secara efektif
- ✅ Analyze performance bottlenecks
- ✅ Use monitoring dan logging untuk troubleshooting
- ✅ Implement debugging tools dan practices
- ✅ Handle emergency situations dengan confidence

## 🔍 Systematic Debugging Methodology

### **The 5-Step Debugging Process**
```
1. 📊 REPRODUCE → Consistently recreate the issue
2. 🔬 ISOLATE → Narrow down the problem scope  
3. 📝 INVESTIGATE → Gather data and analyze logs
4. 🧪 HYPOTHESIZE → Form testable theories
5. ✅ VERIFY → Test fixes and validate solutions
```

### **Problem Classification Matrix**
```
┌─────────────────┬─────────────────┬─────────────────┐
│   SEVERITY      │    URGENCY      │    PRIORITY     │
├─────────────────┼─────────────────┼─────────────────┤
│ 🔴 Critical     │ 🚨 Immediate    │ P0 - Drop All   │
│ 🟠 High         │ ⏰ Same Day     │ P1 - Next       │
│ 🟡 Medium       │ 📅 This Week   │ P2 - Planned    │
│ 🟢 Low          │ 📋 Next Sprint │ P3 - Backlog    │
└─────────────────┴─────────────────┴─────────────────┘
```

## 🚨 Production Debugging Scenarios

### **Scenario 1: API Response Timeouts**
```javascript
// Problem: Recipe API suddenly becomes slow
// Symptoms: 504 Gateway Timeout errors, slow response times

// ✅ STEP 1: REPRODUCE
// - Check if issue is consistent across all endpoints
// - Test with different payload sizes
// - Monitor during different traffic patterns

// Reproduction script
const axios = require('axios');

async function reproduceTimeout() {
  const startTime = Date.now();
  
  try {
    const response = await axios.get('http://localhost:3000/api/recipes', {
      timeout: 30000 // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Success: ${duration}ms`);
    return { success: true, duration, data: response.data };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error.code === 'ECONNABORTED') {
      console.log(`❌ Timeout: ${duration}ms`);
      return { success: false, type: 'timeout', duration };
    } else {
      console.log(`❌ Error: ${error.message}`);
      return { success: false, type: 'error', error: error.message };
    }
  }
}

// Run multiple tests
async function stressTest() {
  const results = [];
  
  for (let i = 0; i < 10; i++) {
    console.log(`Test ${i + 1}/10`);
    const result = await reproduceTimeout();
    results.push(result);
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Analyze results
  const successRate = results.filter(r => r.success).length / results.length * 100;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  
  console.log(`Success Rate: ${successRate}%`);
  console.log(`Average Duration: ${avgDuration}ms`);
  
  return results;
}

// ✅ STEP 2: ISOLATE
// - Check database connection pool
// - Monitor memory usage
// - Analyze slow query logs

// Database connection debugging
class DatabaseDiagnostics {
  constructor(db) {
    this.db = db;
  }
  
  async checkConnectionPool() {
    try {
      const poolStatus = {
        totalConnections: this.db.pool.totalConnections,
        idleConnections: this.db.pool.idleConnections,
        queuedRequests: this.db.pool.queuedRequests,
        acquiredConnections: this.db.pool.acquiredConnections
      };
      
      console.log('📊 Connection Pool Status:', poolStatus);
      
      if (poolStatus.queuedRequests > 0) {
        console.log('⚠️  WARNING: Queued requests detected - potential bottleneck');
      }
      
      if (poolStatus.idleConnections === 0) {
        console.log('⚠️  WARNING: No idle connections - pool exhaustion');
      }
      
      return poolStatus;
    } catch (error) {
      console.error('❌ Failed to check connection pool:', error);
      return null;
    }
  }
  
  async runPerformanceQuery() {
    const query = `
      SELECT 
        query_time,
        lock_time,
        rows_sent,
        rows_examined,
        sql_text
      FROM mysql.slow_log 
      WHERE start_time > NOW() - INTERVAL 1 HOUR
      ORDER BY query_time DESC
      LIMIT 10
    `;
    
    try {
      const [rows] = await this.db.execute(query);
      console.log('🐌 Slow Queries (last hour):', rows);
      return rows;
    } catch (error) {
      console.error('❌ Failed to fetch slow queries:', error);
      return [];
    }
  }
  
  async checkTableStatus() {
    const query = `
      SELECT 
        table_name,
        table_rows,
        data_length,
        index_length,
        data_free
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;
    
    try {
      const [rows] = await this.db.execute(query);
      console.log('📋 Table Status:', rows);
      
      // Check for tables with high fragmentation
      rows.forEach(table => {
        const fragmentation = table.data_free / (table.data_length + table.index_length) * 100;
        if (fragmentation > 10) {
          console.log(`⚠️  HIGH FRAGMENTATION: ${table.table_name} (${fragmentation.toFixed(2)}%)`);
        }
      });
      
      return rows;
    } catch (error) {
      console.error('❌ Failed to check table status:', error);
      return [];
    }
  }
}

// ✅ STEP 3: INVESTIGATE
// - Analyze application logs
// - Check system resources
// - Review recent changes

// Log analysis utility
class LogAnalyzer {
  constructor(logFilePath) {
    this.logFilePath = logFilePath;
  }
  
  async analyzeErrorPatterns() {
    const fs = require('fs').promises;
    
    try {
      const logContent = await fs.readFile(this.logFilePath, 'utf8');
      const lines = logContent.split('\n');
      
      const errorPatterns = {};
      const timeoutErrors = [];
      const performanceIssues = [];
      
      lines.forEach(line => {
        if (line.includes('ERROR')) {
          try {
            const logEntry = JSON.parse(line);
            const errorKey = logEntry.message || 'Unknown Error';
            
            errorPatterns[errorKey] = (errorPatterns[errorKey] || 0) + 1;
            
            if (line.includes('timeout') || line.includes('ECONNABORTED')) {
              timeoutErrors.push(logEntry);
            }
            
            if (logEntry.responseTime && parseInt(logEntry.responseTime) > 5000) {
              performanceIssues.push(logEntry);
            }
          } catch (parseError) {
            // Skip non-JSON log lines
          }
        }
      });
      
      console.log('📊 Error Patterns:', errorPatterns);
      console.log('⏱️  Timeout Errors:', timeoutErrors.length);
      console.log('🐌 Performance Issues:', performanceIssues.length);
      
      return {
        errorPatterns,
        timeoutErrors,
        performanceIssues
      };
    } catch (error) {
      console.error('❌ Failed to analyze logs:', error);
      return null;
    }
  }
  
  async findCorrelations(startTime, endTime) {
    // Analyze logs within specific time window
    const fs = require('fs').promises;
    
    try {
      const logContent = await fs.readFile(this.logFilePath, 'utf8');
      const lines = logContent.split('\n');
      
      const relevantLogs = lines.filter(line => {
        try {
          const logEntry = JSON.parse(line);
          const logTime = new Date(logEntry.timestamp);
          return logTime >= startTime && logTime <= endTime;
        } catch {
          return false;
        }
      });
      
      console.log(`📅 Found ${relevantLogs.length} logs in time window`);
      
      // Look for patterns
      const patterns = {
        databaseErrors: relevantLogs.filter(line => line.includes('database')).length,
        memoryWarnings: relevantLogs.filter(line => line.includes('memory')).length,
        timeoutErrors: relevantLogs.filter(line => line.includes('timeout')).length
      };
      
      console.log('🔍 Correlation Analysis:', patterns);
      return patterns;
    } catch (error) {
      console.error('❌ Failed to analyze correlations:', error);
      return null;
    }
  }
}

// ✅ STEP 4: HYPOTHESIZE
// Based on investigation, form testable theories:
// 1. Database connection pool exhaustion
// 2. Memory leak causing GC pressure
// 3. Inefficient queries with table scans
// 4. Network latency issues

// ✅ STEP 5: VERIFY
// Test each hypothesis systematically

async function testDatabaseConnectionHypothesis() {
  console.log('🧪 Testing: Database connection pool exhaustion');
  
  const diagnostics = new DatabaseDiagnostics(db);
  const poolStatus = await diagnostics.checkConnectionPool();
  
  if (poolStatus && poolStatus.queuedRequests > 0) {
    console.log('✅ CONFIRMED: Connection pool bottleneck');
    
    // Solution: Increase pool size
    console.log('💡 SOLUTION: Increase database connection pool size');
    return { confirmed: true, solution: 'increase_pool_size' };
  }
  
  console.log('❌ REJECTED: Connection pool looks healthy');
  return { confirmed: false };
}

async function testMemoryLeakHypothesis() {
  console.log('🧪 Testing: Memory leak causing GC pressure');
  
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  
  console.log(`📊 Memory Usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    const afterGC = process.memoryUsage();
    const freedMB = Math.round((memoryUsage.heapUsed - afterGC.heapUsed) / 1024 / 1024);
    
    console.log(`🗑️  Freed ${freedMB}MB after GC`);
    
    if (freedMB > 50) {
      console.log('✅ CONFIRMED: Significant memory could be freed');
      return { confirmed: true, solution: 'memory_optimization' };
    }
  }
  
  if (heapUsedMB > 512) {
    console.log('⚠️  WARNING: High memory usage detected');
    return { confirmed: true, solution: 'investigate_memory_leak' };
  }
  
  console.log('❌ REJECTED: Memory usage looks normal');
  return { confirmed: false };
}
```

### **Scenario 2: Database Deadlocks**
```javascript
// Problem: Intermittent database deadlocks
// Symptoms: "Deadlock found when trying to get lock" errors

class DeadlockDebugger {
  constructor(db) {
    this.db = db;
  }
  
  async analyzeDeadlockHistory() {
    const query = `
      SELECT 
        ENGINE_TRANSACTION_ID,
        THREAD_ID,
        EVENT_NAME,
        CURRENT_SCHEMA,
        DIGEST_TEXT,
        SQL_TEXT,
        ROWS_AFFECTED,
        ROWS_SENT,
        ROWS_EXAMINED,
        CREATED_TMP_DISK_TABLES,
        CREATED_TMP_TABLES,
        TIMER_WAIT
      FROM performance_schema.events_statements_history
      WHERE SQL_TEXT LIKE '%recipe%'
      AND ERRORS > 0
      ORDER BY TIMER_START DESC
      LIMIT 50
    `;
    
    try {
      const [rows] = await this.db.execute(query);
      
      console.log('💀 Recent Deadlock-related Queries:');
      rows.forEach(row => {
        console.log(`Query: ${row.SQL_TEXT}`);
        console.log(`Duration: ${row.TIMER_WAIT / 1000000}ms`);
        console.log(`Rows Examined: ${row.ROWS_EXAMINED}`);
        console.log('---');
      });
      
      return rows;
    } catch (error) {
      console.error('❌ Failed to analyze deadlock history:', error);
      return [];
    }
  }
  
  async getCurrentLocks() {
    const query = `
      SELECT 
        r.trx_id waiting_trx_id,
        r.trx_mysql_thread_id waiting_thread,
        r.trx_query waiting_query,
        b.trx_id blocking_trx_id,
        b.trx_mysql_thread_id blocking_thread,
        b.trx_query blocking_query
      FROM information_schema.innodb_lock_waits w
      INNER JOIN information_schema.innodb_trx b 
        ON b.trx_id = w.blocking_trx_id
      INNER JOIN information_schema.innodb_trx r 
        ON r.trx_id = w.requesting_trx_id
    `;
    
    try {
      const [rows] = await this.db.execute(query);
      
      if (rows.length > 0) {
        console.log('🔒 Current Lock Waits:');
        rows.forEach(row => {
          console.log(`Waiting Query: ${row.waiting_query}`);
          console.log(`Blocking Query: ${row.blocking_query}`);
          console.log('---');
        });
      } else {
        console.log('✅ No current lock waits');
      }
      
      return rows;
    } catch (error) {
      console.error('❌ Failed to check current locks:', error);
      return [];
    }
  }
  
  async simulateDeadlockScenario() {
    console.log('🧪 Simulating potential deadlock scenario...');
    
    // Simulate concurrent transactions that might deadlock
    const transaction1 = async () => {
      const connection = await this.db.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Update recipe 1 first
        await connection.execute(
          'UPDATE recipes SET title = ? WHERE id = ? FOR UPDATE',
          ['Updated by Transaction 1', 1]
        );
        
        // Small delay to increase chance of deadlock
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then update recipe 2
        await connection.execute(
          'UPDATE recipes SET title = ? WHERE id = ? FOR UPDATE',
          ['Updated by Transaction 1', 2]
        );
        
        await connection.commit();
        console.log('✅ Transaction 1 completed');
      } catch (error) {
        await connection.rollback();
        console.log('❌ Transaction 1 failed:', error.message);
      } finally {
        connection.release();
      }
    };
    
    const transaction2 = async () => {
      const connection = await this.db.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Update recipe 2 first (opposite order)
        await connection.execute(
          'UPDATE recipes SET title = ? WHERE id = ? FOR UPDATE',
          ['Updated by Transaction 2', 2]
        );
        
        // Small delay to increase chance of deadlock
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then update recipe 1
        await connection.execute(
          'UPDATE recipes SET title = ? WHERE id = ? FOR UPDATE',
          ['Updated by Transaction 2', 1]
        );
        
        await connection.commit();
        console.log('✅ Transaction 2 completed');
      } catch (error) {
        await connection.rollback();
        console.log('❌ Transaction 2 failed:', error.message);
      } finally {
        connection.release();
      }
    };
    
    // Run transactions concurrently
    try {
      await Promise.all([transaction1(), transaction2()]);
    } catch (error) {
      console.log('💀 Deadlock simulation result:', error.message);
    }
  }
  
  // Solution: Implement consistent lock ordering
  async safeUpdateMultipleRecipes(updates) {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Sort updates by ID to ensure consistent lock ordering
      const sortedUpdates = updates.sort((a, b) => a.id - b.id);
      
      for (const update of sortedUpdates) {
        await connection.execute(
          'UPDATE recipes SET title = ?, updated_at = NOW() WHERE id = ?',
          [update.title, update.id]
        );
      }
      
      await connection.commit();
      console.log('✅ Safe multi-recipe update completed');
    } catch (error) {
      await connection.rollback();
      console.log('❌ Safe update failed:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

## 📊 Performance Debugging

### **Memory Leak Detection**
```javascript
// Memory profiling utility
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.intervalId = null;
  }
  
  startProfiling(intervalMs = 5000) {
    console.log('🔍 Starting memory profiling...');
    
    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage();
      const snapshot = {
        timestamp: new Date().toISOString(),
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024)
      };
      
      this.snapshots.push(snapshot);
      
      // Log significant increases
      if (this.snapshots.length > 1) {
        const previous = this.snapshots[this.snapshots.length - 2];
        const current = snapshot;
        
        const heapIncrease = current.heapUsed - previous.heapUsed;
        if (heapIncrease > 10) { // More than 10MB increase
          console.log(`⚠️  Memory increase detected: +${heapIncrease}MB heap`);
        }
      }
      
      console.log(`📊 Memory: ${snapshot.heapUsed}MB heap / ${snapshot.rss}MB RSS`);
    }, intervalMs);
  }
  
  stopProfiling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️  Memory profiling stopped');
    }
  }
  
  analyzeLeaks() {
    if (this.snapshots.length < 2) {
      console.log('❌ Not enough data points for analysis');
      return;
    }
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    const totalIncrease = last.heapUsed - first.heapUsed;
    const timeSpan = new Date(last.timestamp) - new Date(first.timestamp);
    const increaseRate = totalIncrease / (timeSpan / 1000 / 60); // MB per minute
    
    console.log('📈 Memory Analysis:');
    console.log(`Total increase: ${totalIncrease}MB`);
    console.log(`Time span: ${Math.round(timeSpan / 1000 / 60)} minutes`);
    console.log(`Increase rate: ${increaseRate.toFixed(2)}MB/minute`);
    
    if (increaseRate > 1) {
      console.log('🚨 POTENTIAL MEMORY LEAK DETECTED');
      
      // Analyze growth pattern
      const growthPattern = this.snapshots.map((snapshot, index) => {
        if (index === 0) return 0;
        return snapshot.heapUsed - this.snapshots[0].heapUsed;
      });
      
      // Check if growth is linear (strong indicator of leak)
      const isLinearGrowth = this.checkLinearGrowth(growthPattern);
      if (isLinearGrowth) {
        console.log('📊 Pattern: Linear growth detected - likely memory leak');
      } else {
        console.log('📊 Pattern: Non-linear growth - might be normal allocation pattern');
      }
    } else {
      console.log('✅ Memory usage appears stable');
    }
    
    return {
      totalIncrease,
      increaseRate,
      isLeak: increaseRate > 1,
      snapshots: this.snapshots
    };
  }
  
  checkLinearGrowth(values) {
    if (values.length < 3) return false;
    
    // Calculate correlation coefficient for linear trend
    const n = values.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * values.reduce((sum, y) => sum + y * y, 0) - sumY * sumY));
    
    return Math.abs(correlation) > 0.8; // Strong correlation indicates linear growth
  }
  
  generateReport() {
    const fs = require('fs');
    const report = {
      generatedAt: new Date().toISOString(),
      analysis: this.analyzeLeaks(),
      snapshots: this.snapshots
    };
    
    const filename = `memory-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Memory report saved to ${filename}`);
    
    return filename;
  }
}

// Usage example
const profiler = new MemoryProfiler();

// Start profiling
profiler.startProfiling(10000); // Every 10 seconds

// Simulate application load
async function simulateLoad() {
  const recipes = [];
  
  for (let i = 0; i < 1000; i++) {
    // Simulate potential memory leak
    recipes.push({
      id: i,
      title: `Recipe ${i}`,
      ingredients: new Array(100).fill(`Ingredient ${i}`),
      largeData: Buffer.alloc(1024 * 1024) // 1MB buffer
    });
    
    if (i % 100 === 0) {
      console.log(`Created ${i} recipes`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Simulate memory not being released
  global.leakyRecipes = recipes;
}

// Run for 5 minutes then analyze
setTimeout(() => {
  profiler.stopProfiling();
  profiler.analyzeLeaks();
  profiler.generateReport();
}, 5 * 60 * 1000);
```

### **Query Performance Analysis**
```javascript
// Query performance analyzer
class QueryProfiler {
  constructor(db) {
    this.db = db;
    this.queryLog = [];
  }
  
  async enableProfiling() {
    // Enable query profiling
    await this.db.execute('SET profiling = 1');
    await this.db.execute('SET profiling_history_size = 100');
    console.log('✅ Query profiling enabled');
  }
  
  async analyzeSlowQueries() {
    const query = `
      SELECT 
        query_id,
        duration,
        query
      FROM information_schema.profiling
      WHERE duration > 0.1  -- Queries taking more than 100ms
      ORDER BY duration DESC
    `;
    
    try {
      const [rows] = await this.db.execute(query);
      
      console.log('🐌 Slow Queries (>100ms):');
      rows.forEach(row => {
        console.log(`Duration: ${(row.duration * 1000).toFixed(2)}ms`);
        console.log(`Query: ${row.query}`);
        console.log('---');
      });
      
      return rows;
    } catch (error) {
      console.error('❌ Failed to analyze slow queries:', error);
      return [];
    }
  }
  
  async explainQuery(sql, params = []) {
    try {
      // Execute EXPLAIN
      const explainSql = `EXPLAIN FORMAT=JSON ${sql}`;
      const [rows] = await this.db.execute(explainSql, params);
      const explanation = JSON.parse(rows[0]['EXPLAIN']);
      
      console.log('📊 Query Execution Plan:');
      this.analyzeExplainOutput(explanation);
      
      return explanation;
    } catch (error) {
      console.error('❌ Failed to explain query:', error);
      return null;
    }
  }
  
  analyzeExplainOutput(explanation) {
    const plan = explanation.query_block;
    
    if (plan.table) {
      this.analyzeTable(plan.table);
    } else if (plan.nested_loop) {
      plan.nested_loop.forEach(table => this.analyzeTable(table.table));
    }
  }
  
  analyzeTable(table) {
    console.log(`Table: ${table.table_name}`);
    console.log(`Access Type: ${table.access_type}`);
    console.log(`Possible Keys: ${table.possible_keys || 'None'}`);
    console.log(`Key Used: ${table.key || 'None'}`);
    console.log(`Rows Examined: ${table.rows_examined_per_scan}`);
    
    // Identify performance issues
    if (table.access_type === 'ALL') {
      console.log('⚠️  WARNING: Full table scan detected');
    }
    
    if (!table.key) {
      console.log('⚠️  WARNING: No index used');
    }
    
    if (table.rows_examined_per_scan > 1000) {
      console.log('⚠️  WARNING: High number of rows examined');
    }
    
    if (table.filtered && table.filtered < 10) {
      console.log('⚠️  WARNING: Low filtering efficiency');
    }
    
    console.log('---');
  }
  
  async measureQueryPerformance(sql, params = [], iterations = 10) {
    const measurements = [];
    
    console.log(`🔬 Measuring query performance (${iterations} iterations)...`);
    
    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      try {
        await this.db.execute(sql, params);
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        measurements.push(duration);
      } catch (error) {
        console.error(`❌ Query failed on iteration ${i + 1}:`, error.message);
        return null;
      }
    }
    
    // Calculate statistics
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    const avg = measurements.reduce((a, b) => a + b) / measurements.length;
    const median = measurements.sort((a, b) => a - b)[Math.floor(measurements.length / 2)];
    
    console.log('📊 Performance Statistics:');
    console.log(`Min: ${min.toFixed(2)}ms`);
    console.log(`Max: ${max.toFixed(2)}ms`);
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`Median: ${median.toFixed(2)}ms`);
    
    if (max > avg * 3) {
      console.log('⚠️  WARNING: High variance in execution times');
    }
    
    return { min, max, avg, median, measurements };
  }
  
  async optimizeTable(tableName) {
    console.log(`🔧 Optimizing table: ${tableName}`);
    
    try {
      // Analyze table
      await this.db.execute(`ANALYZE TABLE ${tableName}`);
      console.log('✅ Table analysis completed');
      
      // Optimize table
      await this.db.execute(`OPTIMIZE TABLE ${tableName}`);
      console.log('✅ Table optimization completed');
      
      // Check table status after optimization
      const [rows] = await this.db.execute(`
        SELECT 
          table_rows,
          data_length,
          index_length,
          data_free
        FROM information_schema.tables 
        WHERE table_name = ? AND table_schema = DATABASE()
      `, [tableName]);
      
      if (rows.length > 0) {
        const table = rows[0];
        console.log('📊 Table status after optimization:');
        console.log(`Rows: ${table.table_rows}`);
        console.log(`Data size: ${Math.round(table.data_length / 1024 / 1024)}MB`);
        console.log(`Index size: ${Math.round(table.index_length / 1024 / 1024)}MB`);
        console.log(`Free space: ${Math.round(table.data_free / 1024 / 1024)}MB`);
      }
      
    } catch (error) {
      console.error('❌ Table optimization failed:', error);
    }
  }
}
```

## 🛠️ Debugging Tools & Techniques

### **Custom Debug Middleware**
```javascript
// Advanced debugging middleware
class DebugMiddleware {
  constructor(options = {}) {
    this.enabled = options.enabled || process.env.DEBUG === 'true';
    this.logLevel = options.logLevel || 'info';
    this.maxRequestSize = options.maxRequestSize || 1024 * 1024; // 1MB
  }
  
  requestDebugger() {
    return (req, res, next) => {
      if (!this.enabled) return next();
      
      const requestId = this.generateRequestId();
      req.debugId = requestId;
      
      // Capture request details
      const requestInfo = {
        id: requestId,
        method: req.method,
        url: req.url,
        headers: this.sanitizeHeaders(req.headers),
        query: req.query,
        body: this.sanitizeBody(req.body),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 REQUEST:', JSON.stringify(requestInfo, null, 2));
      
      // Capture response
      const originalJson = res.json;
      const originalSend = res.send;
      
      res.json = function(data) {
        console.log('📤 RESPONSE:', {
          id: requestId,
          statusCode: res.statusCode,
          data: data,
          headers: res.getHeaders()
        });
        return originalJson.call(this, data);
      };
      
      res.send = function(data) {
        console.log('📤 RESPONSE:', {
          id: requestId,
          statusCode: res.statusCode,
          data: data,
          headers: res.getHeaders()
        });
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
  
  errorDebugger() {
    return (err, req, res, next) => {
      if (!this.enabled) return next(err);
      
      const errorInfo = {
        id: req.debugId,
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        request: {
          method: req.method,
          url: req.url,
          body: this.sanitizeBody(req.body)
        },
        timestamp: new Date().toISOString()
      };
      
      console.error('💥 ERROR:', JSON.stringify(errorInfo, null, 2));
      
      next(err);
    };
  }
  
  generateRequestId() {
    return Math.random().toString(36).substring(2, 15);
  }
  
  sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    
    return sanitized;
  }
  
  sanitizeBody(body) {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    
    // Truncate large bodies
    const bodyString = JSON.stringify(sanitized);
    if (bodyString.length > this.maxRequestSize) {
      return '[TRUNCATED - Body too large]';
    }
    
    return sanitized;
  }
}

// Usage
const debugMiddleware = new DebugMiddleware({ enabled: true });
app.use(debugMiddleware.requestDebugger());
app.use(debugMiddleware.errorDebugger());
```

## 📝 Emergency Response Playbook

### **Critical Issue Response**
```javascript
// Emergency response checklist
const emergencyPlaybook = {
  
  // Step 1: Immediate Assessment (0-5 minutes)
  immediateAssessment: {
    checkServiceStatus: async () => {
      try {
        const response = await axios.get('/health', { timeout: 5000 });
        return { status: 'UP', details: response.data };
      } catch (error) {
        return { status: 'DOWN', error: error.message };
      }
    },
    
    checkDatabaseConnectivity: async (db) => {
      try {
        await db.execute('SELECT 1');
        return { status: 'UP' };
      } catch (error) {
        return { status: 'DOWN', error: error.message };
      }
    },
    
    checkSystemResources: () => {
      const usage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      return {
        memory: {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
          rss: Math.round(usage.rss / 1024 / 1024)
        },
        cpu: cpuUsage,
        uptime: process.uptime()
      };
    }
  },
  
  // Step 2: Quick Fixes (5-15 minutes)
  quickFixes: {
    restartApplication: () => {
      console.log('🔄 Restarting application...');
      process.exit(1); // Let process manager restart
    },
    
    clearCache: async (cache) => {
      console.log('🗑️  Clearing cache...');
      await cache.flushAll();
    },
    
    toggleMaintenanceMode: (enabled) => {
      console.log(`🚧 Maintenance mode: ${enabled ? 'ON' : 'OFF'}`);
      process.env.MAINTENANCE_MODE = enabled.toString();
    },
    
    scaleResources: (replicas) => {
      console.log(`📈 Scaling to ${replicas} replicas`);
      // Implementation depends on deployment platform
    }
  },
  
  // Step 3: Detailed Investigation (15+ minutes)
  investigation: {
    gatherLogs: async (lastMinutes = 30) => {
      const fs = require('fs').promises;
      const logFile = './logs/combined.log';
      
      try {
        const logs = await fs.readFile(logFile, 'utf8');
        const lines = logs.split('\n');
        const cutoff = new Date(Date.now() - lastMinutes * 60 * 1000);
        
        const recentLogs = lines.filter(line => {
          try {
            const logEntry = JSON.parse(line);
            return new Date(logEntry.timestamp) > cutoff;
          } catch {
            return false;
          }
        });
        
        return recentLogs;
      } catch (error) {
        console.error('Failed to gather logs:', error);
        return [];
      }
    },
    
    performHealthCheck: async () => {
      const healthChecker = new HealthChecker(db, cache);
      return await healthChecker.performHealthCheck();
    },
    
    analyzePerformance: async () => {
      const profiler = new QueryProfiler(db);
      return await profiler.analyzeSlowQueries();
    }
  }
};

// Emergency response coordinator
class EmergencyResponse {
  constructor(config) {
    this.config = config;
    this.alerting = new AlertManager(config.alerting);
  }
  
  async respondToIncident(incident) {
    console.log(`🚨 INCIDENT: ${incident.type} - ${incident.description}`);
    
    // Step 1: Immediate assessment
    const assessment = await this.performAssessment();
    
    // Step 2: Determine severity
    const severity = this.determineSeverity(incident, assessment);
    
    // Step 3: Execute response plan
    await this.executeResponsePlan(severity, incident);
    
    // Step 4: Monitor and follow up
    await this.monitorRecovery(incident.id);
  }
  
  async performAssessment() {
    return {
      service: await emergencyPlaybook.immediateAssessment.checkServiceStatus(),
      database: await emergencyPlaybook.immediateAssessment.checkDatabaseConnectivity(db),
      resources: emergencyPlaybook.immediateAssessment.checkSystemResources()
    };
  }
  
  determineSeverity(incident, assessment) {
    if (assessment.service.status === 'DOWN') return 'CRITICAL';
    if (assessment.database.status === 'DOWN') return 'HIGH';
    if (assessment.resources.memory.heapUsed > 1024) return 'MEDIUM';
    return 'LOW';
  }
  
  async executeResponsePlan(severity, incident) {
    switch (severity) {
      case 'CRITICAL':
        await this.handleCriticalIncident(incident);
        break;
      case 'HIGH':
        await this.handleHighPriorityIncident(incident);
        break;
      case 'MEDIUM':
        await this.handleMediumPriorityIncident(incident);
        break;
      default:
        await this.handleLowPriorityIncident(incident);
    }
  }
  
  async handleCriticalIncident(incident) {
    // Immediate actions for critical incidents
    await this.alerting.sendCriticalAlert(incident);
    
    // Try quick fixes
    if (incident.type === 'SERVICE_DOWN') {
      emergencyPlaybook.quickFixes.toggleMaintenanceMode(true);
      emergencyPlaybook.quickFixes.restartApplication();
    }
  }
}
```

## 📝 Hands-on Exercises

### **Exercise 1: Debug Memory Leak**
```javascript
// exercises/memoryLeak.js
// TODO: Identify and fix the memory leak in this code
class LeakyService {
  constructor() {
    this.subscribers = [];
    this.cache = new Map();
    
    setInterval(() => {
      this.processData();
    }, 1000);
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
  }
  
  processData() {
    const data = this.fetchData();
    this.cache.set(Date.now(), data);
    
    this.subscribers.forEach(callback => callback(data));
  }
  
  fetchData() {
    return new Array(10000).fill(Math.random());
  }
}
```

### **Exercise 2: Optimize Slow Query**
```javascript
// exercises/slowQuery.js
// TODO: Optimize this slow-performing query
async function getRecipesWithStats() {
  const recipes = await db.execute('SELECT * FROM recipes');
  
  for (const recipe of recipes) {
    // N+1 problem
    const comments = await db.execute(
      'SELECT COUNT(*) as count FROM comments WHERE recipe_id = ?',
      [recipe.id]
    );
    
    const ratings = await db.execute(
      'SELECT AVG(rating) as avg FROM ratings WHERE recipe_id = ?',
      [recipe.id]
    );
    
    recipe.commentCount = comments[0].count;
    recipe.averageRating = ratings[0].avg;
  }
  
  return recipes;
}
```

## 🎯 Best Practices Summary

### **✅ DO**
- **Follow Systematic Process**: Reproduce, isolate, investigate, hypothesize, verify
- **Use Profiling Tools**: Memory profilers, query analyzers, performance monitors
- **Implement Monitoring**: Comprehensive logging and alerting
- **Document Issues**: Keep troubleshooting logs and solutions
- **Test Fixes**: Verify solutions in staging before production

### **❌ DON'T**
- **Panic Debug**: Random changes without understanding the problem
- **Skip Documentation**: Not recording the investigation process
- **Ignore Prevention**: Fixing symptoms instead of root causes
- **Debug in Production**: Making changes without proper testing
- **Work Alone**: Get help when needed, especially for critical issues

## 🚀 Next Steps

Setelah menguasai Troubleshooting:

1. **Practice on Real Issues** - Apply techniques to actual problems
2. **Build Monitoring Stack** - Implement comprehensive observability
3. **Create Runbooks** - Document common issues and solutions
4. **Join On-call Rotation** - Get hands-on emergency response experience

---

## 💡 Key Takeaways

- **Systematic Approach Wins** - Follow proven debugging methodologies
- **Data Drives Decisions** - Use metrics and logs, not assumptions
- **Prevention > Cure** - Monitor proactively to catch issues early
- **Documentation Saves Time** - Record solutions for future reference
- **Practice Makes Perfect** - Regular debugging practice builds expertise
- **Team Collaboration** - Share knowledge and learn from others

**🎉 Congratulations! You've completed the comprehensive learning journey through Layered Architecture and Backend Development. Apply these skills to build robust, scalable, and maintainable applications!**
