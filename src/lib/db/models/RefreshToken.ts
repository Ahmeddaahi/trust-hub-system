
export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Mock database - In production, replace with actual database connection
export const refreshTokens: RefreshToken[] = [];
