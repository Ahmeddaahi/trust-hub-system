
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { 
  JWT_ACCESS_SECRET, 
  JWT_REFRESH_SECRET, 
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY 
} from '../constants';
import { User, users } from '../db/models/User';
import { RefreshToken, refreshTokens } from '../db/models/RefreshToken';

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token generation
export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (userId: string): string => {
  const token = jwt.sign(
    { userId, tokenId: uuidv4() },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  const refreshToken: RefreshToken = {
    id: uuidv4(),
    userId,
    token,
    expiresAt,
    createdAt: new Date()
  };
  
  // Add to our mock database
  refreshTokens.push(refreshToken);
  
  return token;
};

// Token verification
export const verifyAccessToken = (token: string): { userId: string; role: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { userId: string; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { userId: string; tokenId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; tokenId: string };
    
    // Check if token exists in database and is not expired
    const storedToken = refreshTokens.find(rt => rt.token === token);
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
};

// User management
export const findUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const createUser = async (name: string, email: string, password: string): Promise<User> => {
  const hashedPassword = await hashPassword(password);
  
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    role: "user", // Default role
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  users.push(newUser);
  return newUser;
};

// Token management
export const removeRefreshToken = (token: string): boolean => {
  const index = refreshTokens.findIndex(rt => rt.token === token);
  if (index !== -1) {
    refreshTokens.splice(index, 1);
    return true;
  }
  return false;
};

export const removeAllUserRefreshTokens = (userId: string): void => {
  const userTokenIndices = refreshTokens
    .map((rt, index) => rt.userId === userId ? index : -1)
    .filter(index => index !== -1)
    .reverse(); // Reverse to remove from end to avoid index shifting issues
  
  for (const index of userTokenIndices) {
    refreshTokens.splice(index, 1);
  }
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
};
