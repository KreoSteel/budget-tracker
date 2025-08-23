import { useState, useEffect } from "react";

// Mock users data for testing
const mockUsers = {
    "1": {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        preferences: {
            currency: "EUR",
            dateFormat: "DD/MM/YYYY",
            budgetPeriod: "monthly",
            theme: "light"
        }
    },
    "2": {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        preferences: {
            currency: "USD",
            dateFormat: "MM/DD/YYYY",
            budgetPeriod: "weekly",
            theme: "dark"
        }
    },
    "3": {
        id: "3",
        name: "Bob Wilson",
        email: "bob@example.com",
        preferences: {
            currency: "GBP",
            dateFormat: "DD/MM/YYYY",
            budgetPeriod: "yearly",
            theme: "light"
        }
    }
};

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<typeof mockUsers[keyof typeof mockUsers] | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);

    // Simple login with user ID
    const login = async (userId: string) => {
        setIsLoadingUser(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (mockUsers[userId as keyof typeof mockUsers]) {
            const selectedUser = mockUsers[userId as keyof typeof mockUsers];
            setUser(selectedUser);
            setIsAuthenticated(true);
            setIsLoadingUser(false);
            return Promise.resolve();
        } else {
            setIsLoadingUser(false);
            return Promise.reject(new Error("User not found"));
        }
    };

    // Logout
    const logout = async () => {
        setUser(null);
        setIsAuthenticated(false);
        return Promise.resolve();
    };

    // Mock register function
    const register = async () => {
        return Promise.resolve();
    };

    return {
        user,
        sessionId: isAuthenticated ? "mock-session-id" : null,
        isAuthenticated,
        isLoadingUser,
        login,
        loginLoading: isLoadingUser,
        loginError: null,
        register,
        registerLoading: false,
        registerError: null,
        logout,
        // Available users for testing
        availableUsers: mockUsers
    };
};
