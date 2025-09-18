/**
 * user-info-endpoint.js
 * Endpoint to get current user info from JWT token
 */

import { verifyToken } from '../global-token-functions.js';

async function userInfoHandler(req, res) {
    try {
        const authToken = req.cookies.auth_token;
        
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        
        const payload = verifyToken(authToken);
        
        if (!payload) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        // Return user info without sensitive data
        return res.json({
            success: true,
            user: {
                user_id: payload.user_id,
                username: payload.username,
                email: payload.email,
                role: payload.role
            }
        });
        
    } catch (error) {
        console.error('User info error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export default userInfoHandler;