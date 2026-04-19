export type UserRole = "client" | "staff" | "admin";
export type UserStatus = "pending" | "active" | "rejected";

export interface User {
  id: number;
  name: string;
  ic: string | null;
  phone: string | null;
  email: string | null;
  password: string;
  role: UserRole;
  is_active: number;
  status: UserStatus;
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
