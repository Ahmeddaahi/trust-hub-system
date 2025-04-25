
import { refreshAccessToken } from '../../lib/api/auth';

// In a real Next.js project, this would be in pages/api/auth/refresh-token.ts
export async function handleRefreshToken(req: Request) {
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

    // Generate new access token
    const result = refreshAccessToken(refreshToken);

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Refresh token API error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
