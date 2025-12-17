import { Button } from "@/components/ui/button";
import { useCartContext } from "@/contexts/CartContext";
import { API_BASE_URL } from "@/lib/api/config";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, getCartTotal } =
    useCartContext();
  
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh or validate cart
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.emptyIcon}>
            <ShoppingCart size={64} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>{t('yourCartIsEmpty')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('startAddingProducts')}
          </Text>
          <Button
            size="lg"
            className="mt-6"
            onPress={() => router.push("/(tabs)/products")}
          >
            {t('browseProducts')}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('shoppingCart')}</Text>
        <Text style={styles.headerSubtitle}>{items.length} {t('items')}</Text>
      </View>

      <ScrollView 
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} title={t('pullToRefresh')} tintColor="#3B82F6" />
        }
      >
        {items.map((item) => (
          <View
            key={`${item.id}-${item.size}-${item.color}`}
            style={styles.cartItem}
          >
            <Image
              source={{
                uri: item.image?.startsWith("http")
                  ? item.image
                  : `${API_BASE_URL.replace("/api", "")}${item.image}`,
              }}
              style={styles.itemImage}
              contentFit="cover"
            />
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Pressable
                  onPress={() => removeFromCart(item.id, item.size, item.color)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </Pressable>
              </View>
              <View style={styles.optionsRow}>
                <View style={styles.optionBadge}>
                  <Text style={styles.optionText}>{item.size}</Text>
                </View>
                <View style={styles.optionBadge}>
                  <View
                    style={[styles.colorDot, { backgroundColor: item.color }]}
                  />
                  <Text style={styles.optionText}>{item.color}</Text>
                </View>
              </View>
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>
                  JOD {(item.price * item.quantity).toFixed(2)}
                </Text>
                <View style={styles.quantityControls}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() =>
                      updateQuantity(
                        item.id,
                        item.size,
                        item.color,
                        item.quantity - 1
                      )
                    }
                  >
                    <Minus size={16} color="#4B5563" />
                  </Pressable>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() =>
                      updateQuantity(
                        item.id,
                        item.size,
                        item.color,
                        item.quantity + 1
                      )
                    }
                  >
                    <Plus size={16} color="#4B5563" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('total')}</Text>
          <Text style={styles.totalAmount}>JOD {getCartTotal().toFixed(2)}</Text>
        </View>
        <Button
          size="lg"
          className="w-full"
          onPress={() => router.push("/orders/new")}
        >
          {t('checkout')}
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
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  optionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  optionText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 2,
  },
  qtyButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  qtyText: {
    width: 32,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  footer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
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
