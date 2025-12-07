import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react-native";

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.emptyIcon}>
          <ShoppingCart size={64} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>Create New Order</Text>
        <Text style={styles.emptySubtitle}>
          Start by adding products to your order
        </Text>
        <Button
          size="lg"
          className="mt-6"
          onPress={() => router.push("/orders/new")}
        >
          New Order
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="mt-4"
          onPress={() => router.push("/(tabs)/products")}
        >
          Browse Products
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

