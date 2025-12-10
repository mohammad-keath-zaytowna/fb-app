import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginformSchema } from "@/lib/forms/auth";
import { loginApiMethod } from "@/lib/api/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import RHFInput from "@/components/react-hook-form/rhf-input";
import { Button } from "@/components/ui/button";
import { ActivityIndicator } from "react-native";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const form = useForm<z.infer<typeof loginformSchema>>({
    resolver: zodResolver(loginformSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: z.infer<typeof loginformSchema>) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await loginApiMethod(data);
      if (response) {
        await login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        router.replace("/(tabs)/products");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // You can add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        className="bg-gray-50"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>💎</Text>
            </View>
            <Text style={styles.logoLabel}>LOREM IPSUM</Text>
          </View>

          {/* Welcome Text */}
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Log in to your account to continue.</Text>

          {/* Form */}
          <FormProvider {...form}>
            <View style={styles.form}>
              <RHFInput
                name="email"
                label="Email or Phone"
                placeholder="Enter your email or phone"
                type="email"
              />

              <View style={styles.passwordContainer}>
                <RHFInput
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  showPasswordToggle
                />
                <Pressable
                  onPress={() => router.push("/(auth)/forgot-password")}
                  style={styles.forgotPasswordLink}
                >
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </Pressable>
              </View>

              <Button
                onPress={form.handleSubmit(handleSubmit)}
                disabled={isLoading}
                isLoading={isLoading}
                size="lg"
                className="w-full mt-4"
              >
                {isLoading ? "Logging In..." : "Login"}
              </Button>
            </View>
          </FormProvider>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 30,
  },
  logoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  passwordContainer: {
    marginTop: 16,
  },
  forgotPasswordLink: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 32,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#6B7280",
  },
  signupLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});

