
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

// Mock database - In production, replace with actual database connection
export const users: User[] = [];
