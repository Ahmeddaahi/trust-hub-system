
import { logout } from '../../lib/api/auth';

// In a real Next.js project, this would be in pages/api/auth/logout.ts
export async function handleLogout(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get refresh token from request body or cookie
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return new Response(JSON.stringify({ success: false, message: 'Refresh token required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Logout user
    const result = logout(refreshToken);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        // In production, clear cookies:
        // 'Set-Cookie': 'refreshToken=; HttpOnly; Path=/; Max-Age=0'
      }
    });
  } catch (error) {
    console.error('Logout API error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
