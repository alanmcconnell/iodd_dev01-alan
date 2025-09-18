/**
 * pkce-auth-endpoint.js
 * PKCE authentication callback handler
 */

import { createToken } from '../global-token-functions.js';

// PKCE authentication callback handler
async function pkceAuthHandler(req, res) {
    try {
        const { code, pkce, user_id, username, email, role } = req.query;
        
        if (!code && !pkce) {
            return res.status(400).json({ 
                success: false, 
                message: 'Authorization code or PKCE parameter is required' 
            });
        }
        
        // Create JWT token with user info (no sensitive data in URL)
        const payload = {
            user_id: user_id,
            username: username,
            email: email,
            role: role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        const jwtToken = createToken(payload);
        
        // Set HTTP-only cookie with JWT token
        res.cookie('auth_token', jwtToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        // Redirect to clean URL without parameters
        res.redirect('/member-profile.html');
        
    } catch (error) {
        console.error('PKCE auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}

export default pkceAuthHandler;