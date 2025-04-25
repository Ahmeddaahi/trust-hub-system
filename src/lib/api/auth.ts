
import { User } from "../db/models/User";
import { 
  comparePassword,
  createUser,
  findUserByEmail,
  findUserById,
  generateAccessToken,
  generateRefreshToken,
  removeRefreshToken,
  verifyRefreshToken
} from "../auth/authUtils";

// Auth API functions
export const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
  try {
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return { 
        success: false, 
        message: "Email already registered" 
      };
    }

    // Create new user
    const user = await createUser(name, email, password);
    
    // Return user without password
    const { password: _, ...safeUser } = user;
    
    return {
      success: true,
      message: "Registration successful",
      user: safeUser
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      message: "Error during registration" 
    };
  }
};

export const login = async (email: string, password: string): Promise<{
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Omit<User, 'password'>;
}> => {
  try {
    const user = findUserByEmail(email);
    
    if (!user) {
      return { 
        success: false, 
        message: "Invalid email or password" 
      };
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return { 
        success: false, 
        message: "Invalid email or password" 
      };
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    // Return user data without password
    const { password: _, ...safeUser } = user;
    
    return {
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: safeUser
    };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: "Error during login" 
    };
  }
};

export const refreshAccessToken = (token: string): {
  success: boolean;
  message: string;
  accessToken?: string;
} => {
  try {
    const payload = verifyRefreshToken(token);
    
    if (!payload) {
      return { 
        success: false, 
        message: "Invalid refresh token" 
      };
    }
    
    const user = findUserById(payload.userId);
    
    if (!user) {
      return { 
        success: false, 
        message: "User not found" 
      };
    }
    
    const newAccessToken = generateAccessToken(user.id, user.role);
    
    return {
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { 
      success: false, 
      message: "Error refreshing token" 
    };
  }
};

export const logout = (refreshToken: string): {
  success: boolean;
  message: string;
} => {
  try {
    const isRemoved = removeRefreshToken(refreshToken);
    
    if (!isRemoved) {
      return { 
        success: false, 
        message: "Invalid refresh token" 
      };
    }
    
    return {
      success: true,
      message: "Logged out successfully"
    };
  } catch (error) {
    console.error("Logout error:", error);
    return { 
      success: false, 
      message: "Error during logout" 
    };
  }
};
