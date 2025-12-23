import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { Mail, Package, User } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRTL } from "@/components/rtl-view";
import { useDirection } from "@/components/direction-provider";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LANGUAGE_KEY } from "@/lib/i18n";
import { useCartContext } from "@/contexts/CartContext";

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();
  const { t, i18n } = useTranslation();
  const isRTL = useRTL(); // This hook will handle RTL updates
  const { getDirectionAwareStyle } = useDirection();
  const { clearCart } = useCartContext();

  // Create direction-aware styles
  const dynamicStyles = {
    container: styles.container,
    content: styles.content,
    header: getDirectionAwareStyle(styles.header),
    headerTitle: styles.headerTitle,
    card: styles.card,
    avatarContainer: styles.avatarContainer,
    avatar: styles.avatar,
    userName: styles.userName,
    userEmail: styles.userEmail,
    roleBadge: styles.roleBadge,
    roleText: styles.roleText,
    sectionTitle: styles.sectionTitle,
    infoRow: getDirectionAwareStyle(styles.infoRow),
    infoIcon: styles.infoIcon,
    infoContent: styles.infoContent,
    infoLabel: styles.infoLabel,
    infoValue: styles.infoValue,
    logoutButtonContainer: styles.logoutButtonContainer,
    languageContainer: getDirectionAwareStyle(styles.languageContainer),
    languageButton: styles.languageButton,
    languageButtonActive: styles.languageButtonActive,
    languageButtonText: styles.languageButtonText,
    languageButtonTextActive: styles.languageButtonTextActive,
  };

  const handleLogout = async () => {
    await logout();
    clearCart();
    router.replace("/(auth)/login");
  };

  const changeLanguage = async (lang: string) => {
    try {
      // persist selection so it survives app reload
      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        console.warn("Failed to persist language choice", e);
      }
      await i18n.changeLanguage(lang);

      // Show alert and restart app for RTL changes to take effect
      Alert.alert(t("languageChanged"), t("appWillRestart"), [
        {
          text: t("ok"),
          onPress: async () => {
            try {
              await Updates.reloadAsync();
            } catch (error) {
              console.error("Failed to restart app:", error);
              Alert.alert(
                "Error",
                "Failed to restart app. Please restart manually."
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  return (
    <SafeAreaView style={dynamicStyles.container} edges={["top"]}>
      <ScrollView>
        <View style={dynamicStyles.content}>
          {/* Header */}
          <View style={dynamicStyles.header}>
            <Text style={dynamicStyles.headerTitle}>{t("profile")}</Text>
          </View>

          {/* User Info Card */}
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.avatarContainer}>
              <View style={dynamicStyles.avatar}>
                <User size={40} color="#3B82F6" />
              </View>
            </View>
            <Text style={dynamicStyles.userName}>{user?.name || "User"}</Text>
            <Text style={dynamicStyles.userEmail}>{user?.email || ""}</Text>
            <View style={dynamicStyles.roleBadge}>
              <Text style={dynamicStyles.roleText}>
                {user?.role?.charAt(0).toUpperCase() +
                  (user?.role?.slice(1) || "") || "User"}
              </Text>
            </View>
          </View>

          {/* User Details */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>
              {t("accountInformation")}
            </Text>

            <View style={dynamicStyles.infoRow}>
              <View style={dynamicStyles.infoIcon}>
                <User size={20} color="#6B7280" />
              </View>
              <View style={dynamicStyles.infoContent}>
                <Text style={dynamicStyles.infoLabel}>{t("name")}</Text>
                <Text style={dynamicStyles.infoValue}>
                  {user?.name || "N/A"}
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.infoRow}>
              <View style={dynamicStyles.infoIcon}>
                <Mail size={20} color="#6B7280" />
              </View>
              <View style={dynamicStyles.infoContent}>
                <Text style={dynamicStyles.infoLabel}>{t("email")}</Text>
                <Text style={dynamicStyles.infoValue}>
                  {user?.email || "N/A"}
                </Text>
              </View>
            </View>

            <View style={dynamicStyles.infoRow}>
              <View style={dynamicStyles.infoIcon}>
                <Package size={20} color="#6B7280" />
              </View>
              <View style={dynamicStyles.infoContent}>
                <Text style={dynamicStyles.infoLabel}>{t("role")}</Text>
                <Text style={dynamicStyles.infoValue}>
                  {t(user?.role || "user")}
                </Text>
              </View>
            </View>
          </View>

          {/* Language Switcher */}
          <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>{t("language")}</Text>
            <View style={dynamicStyles.languageContainer}>
              <Pressable
                style={[
                  dynamicStyles.languageButton,
                  i18n.language === "en" && dynamicStyles.languageButtonActive,
                ]}
                onPress={() => changeLanguage("en")}
              >
                <Text
                  style={[
                    dynamicStyles.languageButtonText,
                    i18n.language === "en" &&
                      dynamicStyles.languageButtonTextActive,
                  ]}
                >
                  {t("english")}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  dynamicStyles.languageButton,
                  i18n.language === "ar" && dynamicStyles.languageButtonActive,
                ]}
                onPress={() => changeLanguage("ar")}
              >
                <Text
                  style={[
                    dynamicStyles.languageButtonText,
                    i18n.language === "ar" &&
                      dynamicStyles.languageButtonTextActive,
                  ]}
                >
                  {t("arabic")}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <View style={dynamicStyles.logoutButtonContainer}>
            <Button
              size="lg"
              action="negative"
              className="w-full"
              onPress={handleLogout}
            >
              {t("logout")}
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
