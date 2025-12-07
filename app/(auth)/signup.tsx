import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signupFormSchema } from "@/lib/forms/auth";
import { signupApiMethod } from "@/lib/api/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import RHFInput from "@/components/react-hook-form/rhf-input";
import RHFCheckbox from "@/components/react-hook-form/rhf-checkbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react-native";

export default function SignupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();

  const form = useForm<z.infer<typeof signupFormSchema>>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await signupApiMethod({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      if (response) {
        await login({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        });
        router.replace("/(tabs)/products");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Create account</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <FormProvider {...form}>
          <View style={styles.form}>
            <RHFInput
              name="name"
              label="Full Name"
              placeholder="Jane Doe"
              type="text"
            />

            <View style={{ marginTop: 16 }}>
              <RHFInput
                name="email"
                label="Email or Phone"
                placeholder="you@example.com"
                type="email"
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <RHFInput
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
                showPasswordToggle
              />
            </View>

            <View style={{ marginTop: 16 }}>
              <RHFInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                type="password"
                showPasswordToggle
              />
            </View>

            <View style={styles.checkboxContainer}>
              <RHFCheckbox name="agreeToTerms" />
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms & Privacy Policy.</Text>
              </Text>
            </View>

            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-6"
            >
              Create account
            </Button>
          </View>
        </FormProvider>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </Pressable>
        </View>
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
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  form: {
    width: "100%",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  termsText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    flex: 1,
  },
  termsLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});

