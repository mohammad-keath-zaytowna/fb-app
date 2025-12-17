import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { resetPasswordformSchema } from "@/lib/forms/auth";
import { resetPasswordApiMethod } from "@/lib/api/auth";
import RHFInput from "@/components/react-hook-form/rhf-input";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react-native";

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof resetPasswordformSchema>>({
    resolver: zodResolver(resetPasswordformSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (data: z.infer<typeof resetPasswordformSchema>) => {
    if (isLoading || !email || !otp) return;

    setIsLoading(true);
    try {
      await resetPasswordApiMethod({
        email,
        otp,
        newPassword: data.password,
      });
      router.replace("/(auth)/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
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
          <Text style={styles.headerTitle}>{t('resetPasswordTitle')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          {t('resetPasswordDescription')}
        </Text>

        {/* Form */}
        <FormProvider {...form}>
          <View style={styles.form}>
            <RHFInput
              name="password"
              label={t('newPassword')}
              placeholder={t('newPasswordPlaceholder')}
              type="password"
              showPasswordToggle
              helperText={t('passwordHelperText')}
            />

            <View style={styles.passwordStrengthContainer}>
              <Text style={styles.passwordStrengthLabel}>{t('passwordStrengthWeak')}</Text>
              <View style={styles.passwordStrengthBar}>
                <View style={styles.passwordStrengthBarFill} />
                <View style={styles.passwordStrengthBarEmpty} />
                <View style={styles.passwordStrengthBarEmpty} />
                <View style={styles.passwordStrengthBarEmpty} />
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <RHFInput
                name="confirmPassword"
                label={t('confirmNewPassword')}
                placeholder={t('confirmNewPasswordPlaceholder')}
                type="password"
                showPasswordToggle
              />
            </View>

            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-8"
            >
              {t('saveNewPassword')}
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
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
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
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  passwordStrengthBar: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  passwordStrengthBarFill: {
    flex: 1,
    height: 4,
    backgroundColor: "#EF4444",
    borderRadius: 2,
  },
  passwordStrengthBarEmpty: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
});

