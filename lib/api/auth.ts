import apiClient from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";

export interface LoginResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export const loginApiMethod = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    console.log('api path', apiClient.defaults.baseURL);
    const { data } = await apiClient.post("/auth/login", { email, password });

    // Store access token
    if (data?.data?.accessToken) {
      await AsyncStorage.setItem("@auth_token", data.data.accessToken);
    }

    // Store refresh token if provided
    if (data?.data?.refreshToken) {
      await AsyncStorage.setItem("@auth_refresh_token", data.data.refreshToken);
    }

    // Store user data
    if (data?.data?.user) {
      await AsyncStorage.setItem("@auth_user", JSON.stringify(data.data.user));
    }

    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Login failed";
    throw new Error(message);
  }
};

export const signupApiMethod = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<LoginResponse> => {
  try {
    const { data } = await apiClient.post("/auth/signup", {
      name,
      email,
      password,
      confirmPassword,
    });

    // Store access token
    if (data?.data?.accessToken) {
      await AsyncStorage.setItem("@auth_token", data.data.accessToken);
    }

    // Store refresh token if provided
    if (data?.data?.refreshToken) {
      await AsyncStorage.setItem("@auth_refresh_token", data.data.refreshToken);
    }

    // Store user data
    if (data?.data?.user) {
      await AsyncStorage.setItem("@auth_user", JSON.stringify(data.data.user));
    }

    return {
      user: data.data.user,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Signup failed";
    throw new Error(message);
  }
};

export const forgetPasswordApiMethod = async ({
  email,
}: {
  email: string;
}): Promise<{ expiresAt?: string; otp?: string }> => {
  try {
    const { data } = await apiClient.patch("/auth/forgetPassword", { email });
    return data?.data || {};
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send reset code";
    throw new Error(message);
  }
};

export const resetPasswordApiMethod = async ({
  email,
  otp,
  newPassword,
}: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<void> => {
  try {
    await apiClient.patch("/auth/resetPassword", {
      email,
      otp,
      newPassword,
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to reset password";
    throw new Error(message);
  }
};

