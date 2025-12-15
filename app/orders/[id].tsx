import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";
import { getOrderById } from "@/lib/api/orders";
import { Order } from "@/types";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userNotes, setUserNotes] = useState("");
  const [facebookProfile, setFacebookProfile] = useState("");

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await getOrderById(id);
      setOrder(data);
      setUserNotes(data.userNotes || "");
      setFacebookProfile(data.facebookProfile || "");
    } catch (error) {
      console.error("Failed to load order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
      case "canceled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Pressable>
            <MoreVertical size={24} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Order ID and Status */}
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order ID: #{order._id.slice(-5)}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(order.status)}20` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Items Ordered */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Ordered</Text>
            {order.items.map((item, index) => {
              const product =
                typeof item.prod_id === "object" ? item.prod_id : null;
              return (
                <View key={index} style={styles.orderItem}>
                  <Image
                    source={{
                      uri: product?.image
                        ? product.image.startsWith("http")
                          ? product.image
                          : `${API_BASE_URL.replace("/api", "")}${
                              product.image
                            }`
                        : "https://via.placeholder.com/80",
                    }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {product?.name || "Product"}
                    </Text>
                    <Text style={styles.itemPrice}>
                      JOD {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.itemQuantity}>x{item.count}</Text>
                  <Text style={styles.itemTotal}>
                    JOD {(item.price * item.count).toFixed(2)}
                  </Text>
                </View>
              );
            })}

            {/* Price Summary */}
            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>
                  JOD{" "}
                  {(
                    (order.total || order.totalAmount || 0) -
                    (order.shipping || 0)
                  ).toFixed(2)}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Shipping</Text>
                <Text style={styles.priceValue}>
                  JOD {(order.shipping || 0).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  JOD {(order.total || order.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  content: {
    padding: 16,
  },
  orderHeader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  itemPrice: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#6B7280",
    marginRight: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  priceSummary: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
    marginTop: 16,
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    color: "#111827",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    minHeight: 100,
  },
  facebookInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  facebookIcon: {
    fontSize: 20,
    color: "#1877F2",
    fontWeight: "bold",
    marginRight: 8,
  },
  facebookInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
});
