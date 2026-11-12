import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const demoHeader = req.headers['x-demo-user-id'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      // If Supabase is configured, verify against Supabase Auth
      if (isSupabaseConfigured && supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || 'Farm Agronomist',
            farmLocation: user.user_metadata?.farm_location || 'Field Station'
          };
          return next();
        }
      }

      // Check if it's a demo session token
      if (token.startsWith('demo-token-')) {
        const userId = token.replace('demo-token-', '') || 'demo-farmer-01';
        req.user = {
          id: userId,
          email: `${userId}@agriadviser.local`,
          fullName: 'Demo Agronomist',
          farmLocation: 'Green Valley Experimental Farm'
        };
        return next();
      }
    }

    // Allow demo user header in local/demo mode
    if (demoHeader) {
      req.user = {
        id: demoHeader,
        email: `${demoHeader}@agriadviser.local`,
        fullName: 'Demo Agronomist',
        farmLocation: 'Green Valley Experimental Farm'
      };
      return next();
    }

    // If running in development/demo mode without token, provide default demo user
    if (!isSupabaseConfigured) {
      req.user = {
        id: 'demo-farmer-01',
        email: 'farmer@agriadviser.local',
        fullName: 'Demo Agronomist',
        farmLocation: 'Green Valley Experimental Farm'
      };
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid authentication token required. Please sign in.'
    });
  } catch (error) {
    console.error('[AuthMiddleware] Error validating token:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication session expired or invalid.'
    });
  }
}

