import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Mail, Package, User } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      const isRTL = lang === 'ar';
      
      // Check if RTL change is needed
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Inform user to restart app for RTL changes
        const { Alert } = require('react-native');
        Alert.alert(
          t('language'),
          'Please restart the app to apply RTL changes.',
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('profile')}</Text>
          </View>

          {/* User Info Card */}
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color="#3B82F6" />
              </View>
            </View>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user?.role?.charAt(0).toUpperCase() +
                  (user?.role?.slice(1) || "") || "User"}
              </Text>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('accountInformation')}</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <User size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('name')}</Text>
                <Text style={styles.infoValue}>{user?.name || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('email')}</Text>
                <Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Package size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('role')}</Text>
                <Text style={styles.infoValue}>
                  {t(user?.role || 'user')}
                </Text>
              </View>
            </View>
          </View>

          {/* Language Switcher */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('language')}</Text>
            <View style={styles.languageContainer}>
              <Pressable
                style={[
                  styles.languageButton,
                  i18n.language === 'en' && styles.languageButtonActive,
                ]}
                onPress={() => changeLanguage('en')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    i18n.language === 'en' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('english')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.languageButton,
                  i18n.language === 'ar' && styles.languageButtonActive,
                ]}
                onPress={() => changeLanguage('ar')}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    i18n.language === 'ar' && styles.languageButtonTextActive,
                  ]}
                >
                  {t('arabic')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutButtonContainer}>
            <Button
              size="lg"
              action="negative"
              className="w-full"
              onPress={handleLogout}
            >
              {t('logout')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    width: "100%",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  logoutButtonContainer: {
    width: "100%",
    marginTop: 24,
  },
  languageContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  languageButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  languageButtonTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
