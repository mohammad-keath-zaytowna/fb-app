import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { forgotPasswordFormSchema } from "@/lib/forms/auth";
import { forgetPasswordApiMethod } from "@/lib/api/auth";
import RHFInput from "@/components/react-hook-form/rhf-input";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: z.infer<typeof forgotPasswordFormSchema>) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await forgetPasswordApiMethod({ email: data.email });
      router.push({
        pathname: "/(auth)/verification-code",
        params: { email: data.email },
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
          <Text style={styles.headerTitle}>{t('forgotPasswordTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {t('forgotPasswordDescription')}
        </Text>

        {/* Form */}
        <FormProvider {...form}>
          <View style={styles.form}>
            <RHFInput
              name="email"
              label={t('emailOrPhone')}
              placeholder={t('emailOrPhonePlaceholder')}
              type="email"
            />

            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-8"
            >
              {t('sendCode')}
            </Button>
          </View>
        </FormProvider>

        {/* Back to Login Link */}
        <Pressable
          onPress={() => router.push("/(auth)/login")}
          style={styles.backLink}
        >
          <Text style={styles.backLinkText}>{t('backToLogin')}</Text>
        </Pressable>
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  backLink: {
    marginTop: 24,
    alignItems: "center",
  },
  backLinkText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
});

