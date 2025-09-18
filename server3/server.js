const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const app = express();

// Middleware
app.use(cors(config.server.cors));
app.use(express.json());
app.use(express.static('public')); // Serve static HTML files

// Create MySQL connection pool
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: config.database.connectionLimit,
  queueLimit: 0,
  acquireTimeout: config.database.acquireTimeout,
  timeout: config.database.timeout
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// API Routes
// Generic SQL Select command for table and view
app.post('/api/search/:tableorview', async (req, res) => {
  try {
    const { table } = req.params;
    const { conditions = {}, limit = 100, offset = 0 } = req.body;
    
    let query = ``;
    let params = [table];
    
    /* if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => `?? = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      
      Object.entries(conditions).forEach(([key, value]) => {
        params.push(key, value);
      });
    } */
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: error.message
    });
  }
});

// Get all records from a table
app.get('/api/data/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { limit = 100, offset = 0, orderBy = 'id', order = 'ASC' } = req.query;
    
    // Basic SQL injection protection - whitelist common column names and orders
    const allowedOrders = ['ASC', 'DESC'];
    const safeOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    
    // Note: In production, you should validate table names against a whitelist
    const query = `SELECT * FROM ?? ORDER BY ?? ${safeOrder} LIMIT ? OFFSET ?`;
    const [rows] = await pool.execute(query, [table, orderBy, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: error.message
    });
  }
});

// Get specific record by ID
app.get('/api/data/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    
    const query = `SELECT * FROM ?? WHERE id = ?`;
    const [rows] = await pool.execute(query, [table, id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: error.message
    });
  }
});

// Search records with WHERE conditions
app.post('/api/search/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { conditions = {}, limit = 100, offset = 0 } = req.body;
    
    let query = `SELECT * FROM ??`;
    let params = [table];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions).map(key => `?? = ?`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      
      Object.entries(conditions).forEach(([key, value]) => {
        params.push(key, value);
      });
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: error.message
    });
  }
});

// Get table structure/schema
app.get('/api/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    
    const query = `DESCRIBE ??`;
    const [rows] = await pool.execute(query, [table]);
    
    res.json({
      success: true,
      schema: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get table schema',
      message: error.message
    });
  }
});

// Custom query endpoint (use with caution)
app.post('/api/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
    
    // Basic protection - only allow SELECT statements
    if (!query.trim().toLowerCase().startsWith('select')) {
      return res.status(400).json({
        success: false,
        error: 'Only SELECT queries are allowed'
      });
    }
    
    const [rows] = await pool.execute(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Query execution failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = config.server.port || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await pool.end();
  process.exit(0);
});