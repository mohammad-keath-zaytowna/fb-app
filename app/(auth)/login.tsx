import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginformSchema } from "@/lib/forms/auth";
import { loginApiMethod } from "@/lib/api/auth";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import RHFInput from "@/components/react-hook-form/rhf-input";
import { Button } from "@/components/ui/button";
import { ActivityIndicator } from "react-native";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const { t } = useTranslation();

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
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} >

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.container}
          className="bg-gray-50"
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/full-logo.png')}
                style={styles.logoImage}
                contentFit="contain"
              />
            </View>

            {/* Welcome Text */}
            <Text style={styles.title}>{t('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>

            {/* Form */}
            <FormProvider {...form}>
              <View style={styles.form}>
                <RHFInput
                  name="email"
                  label={t('emailOrPhone')}
                  placeholder={t('emailOrPhonePlaceholder')}
                  type="email"
                />

                <View style={styles.passwordContainer}>
                  <RHFInput
                    name="password"
                    label={t('password')}
                    placeholder={t('passwordPlaceholder')}
                    type="password"
                    showPasswordToggle
                  />
                  {/* <Pressable
                    onPress={() => router.push("/(auth)/forgot-password")}
                    style={styles.forgotPasswordLink}
                  >
                    <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
                  </Pressable> */}
                </View>

                <Button
                  onPress={form.handleSubmit(handleSubmit)}
                  disabled={isLoading}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full mt-4"
                >
                  {isLoading ? t('loggingIn') : t('login')}
                </Button>
              </View>
            </FormProvider>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  logoImage: {
    width: 200,
    height: 80,
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

