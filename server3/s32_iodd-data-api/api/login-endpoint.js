/**
 * login-endpoint.js
 * API endpoint for handling member login authentication
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'UserName',
    password: process.env.DB_PASSWORD || 'PassWord',
    database: process.env.DB_NAME || 'iodd',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Login endpoint handler
async function loginHandler(req, res) {
    try {
        const { username, password } = req.body;
        
        // Input validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        // Query the database
        const [rows] = await pool.execute(
            'SELECT MemberNo, UserName, Password FROM users WHERE UserName = ? AND Password = ?',
            [username, password]
        );
        
        // Check if user exists with matching credentials
        if (rows.length > 0) {
            // Authentication successful
            return res.status(200).json({
                success: true,
                message: 'Access Approved',
                memberNo: rows[0].MemberNo
            });
        } else {
            // Authentication failed
            return res.status(401).json({
                success: false,
                message: 'Invalid User name or password'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error occurred'
        });
    }
}

// Export the handler
module.exports = loginHandler;