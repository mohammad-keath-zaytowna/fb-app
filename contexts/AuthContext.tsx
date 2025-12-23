import { AuthState, User } from "@/types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { getCurrentUser } from "@/lib/api/auth";

interface AuthContextType extends AuthState {
  login: (loginData: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadStoredAuth = useCallback(async () => {
    try {
      const [storedUser, storedToken] = await AsyncStorage.multiGet([
        "@auth_user",
        "@auth_token",
      ]);

      if (storedUser[1] && storedToken[1]) {
        try {
          const user = JSON.parse(storedUser[1]);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (parseError) {
          // Invalid JSON, clear and set unauthenticated
          await AsyncStorage.multiRemove([
            "@auth_user",
            "@auth_token",
            "@auth_refresh_token",
          ]);
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        // Clear invalid auth data
        await AsyncStorage.multiRemove([
          "@auth_user",
          "@auth_token",
          "@auth_refresh_token",
        ]);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      try {
        await AsyncStorage.multiRemove([
          "@auth_user",
          "@auth_token",
          "@auth_refresh_token",
        ]);
      } catch (e) {
        // Ignore AsyncStorage errors
      }
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // Refetch user data when app becomes active
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Only refetch when app comes to foreground and user is authenticated
      if (nextAppState === "active" && authState.isAuthenticated && authState.user) {
        try {
          console.log("App became active, refetching user data...");
          const updatedUser = await getCurrentUser();
          setAuthState((prev) => ({
            ...prev,
            user: updatedUser,
          }));
        } catch (error) {
          console.error("Error refetching user data:", error);
          // If token is invalid, logout the user
          if (error instanceof Error && error.message.includes("token")) {
            await logout();
          }
        }
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [authState.isAuthenticated, authState.user]);

  const login = async (loginData: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  }) => {
    try {
      const { user, accessToken, refreshToken } = loginData;

      await AsyncStorage.setItem("@auth_user", JSON.stringify(user));

      if (accessToken) {
        await AsyncStorage.setItem("@auth_token", accessToken);
      }

      if (refreshToken) {
        await AsyncStorage.setItem("@auth_refresh_token", refreshToken);
      }

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "@auth_user",
        "@auth_token",
        "@auth_refresh_token",
      ]);


      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem("@auth_user", JSON.stringify(updatedUser));
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

