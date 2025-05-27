import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Simple local authentication for demo credentials
export async function setupLocalAuth(app: Express) {
  
  // Login route for demo credentials
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Check demo credentials
      if ((email === 'admin@example.com' && password === 'admin123') || 
          (email === 'user@example.com' && password === 'user123')) {
        
        // Create/get demo user
        const demoUser = await storage.upsertUser({
          id: email === 'admin@example.com' ? 'admin-demo' : 'user-demo',
          email: email,
          firstName: email === 'admin@example.com' ? 'Admin' : 'Demo',
          lastName: 'User',
          profileImageUrl: null
        });
        
        // Set user in session
        (req as any).session.user = demoUser;
        
        // Log activity
        await storage.createActivityLog({
          userId: demoUser.id,
          action: 'LOGIN',
          resource: 'user',
          resourceId: demoUser.id,
          details: { message: `User ${demoUser.email} logged in` },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown'
        });
        
        res.json({
          message: 'Login successful',
          user: demoUser
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get current user route
  app.get('/api/auth/user', async (req, res) => {
    try {
      const user = (req as any).session?.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
}

// Simple authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req as any).session?.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  (req as any).user = user;
  next();
};