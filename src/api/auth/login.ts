
import { login } from '../../lib/api/auth';

// In a real Next.js project, this would be in pages/api/auth/login.ts
export async function handleLogin(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Login user
    const result = await login(email, password);

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set HttpOnly cookies for tokens in a production environment
    // For this example, we'll just return them in the response body
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
      // In production, add:
      // headers: {
      //   'Set-Cookie': [
      //     `refreshToken=${result.refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`,
      //     // Don't set access token in cookie for security, use in-memory storage on client
      //   ]
      // }
    });
  } catch (error) {
    console.error('Login API error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
