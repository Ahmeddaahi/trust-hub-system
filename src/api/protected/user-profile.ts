
import { requireAuth } from '../../lib/middleware/authMiddleware';
import { findUserById } from '../../lib/auth/authUtils';

// In a real Next.js project, this would be in pages/api/protected/user-profile.ts
export async function handleGetProfile(req: Request) {
  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check authentication
    const authHeader = req.headers.get('authorization');
    const auth = requireAuth(authHeader);

    if (!auth.isAuthenticated || !auth.userId) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user profile
    const user = findUserById(auth.userId);

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove sensitive data
    const { password, ...safeUser } = user;

    return new Response(JSON.stringify({
      success: true,
      message: 'Profile retrieved successfully',
      user: safeUser
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get profile API error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
