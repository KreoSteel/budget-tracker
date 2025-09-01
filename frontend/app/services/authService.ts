import { http } from "~/lib/http";
import type { User } from "~/types/User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  // Lazy getters that only access localStorage when needed
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private setStoredToken(token: string | null): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  private getStoredUser(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('authUser');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private setStoredUser(user: User | null): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('authUser');
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await http.post<LoginResponse>('/auth/login', credentials);
      
      if (response.data) {
        this.token = response.data.token;
        this.user = response.data.user;
        this.setStoredToken(this.token);
        this.setStoredUser(this.user);
        return { success: true, user: this.user };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.setStoredToken(null);
    this.setStoredUser(null);
  }

  isAuthenticated(): boolean {
    if (!this.token) {
      this.token = this.getStoredToken();
    }
    // If we have a token but no user, try to get user from localStorage
    if (this.token && !this.user) {
      this.user = this.getStoredUser();
    }
    return !!this.token;
  }

  getCurrentUser(): User | null {
    if (!this.user && this.isAuthenticated()) {
      // Try to get user from localStorage if we don't have it in memory
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this.user = storedUser;
        return this.user;
      }
    }
    return this.user;
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = this.getStoredToken();
    }
    // If we have a token but no user, try to get user from localStorage
    if (this.token && !this.user) {
      this.user = this.getStoredUser();
    }
    return this.token;
  }
}

export const authService = new AuthService();
