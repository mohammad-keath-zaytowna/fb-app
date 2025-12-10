import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";
import { createOrder } from "@/lib/api/orders";
import { getProductById } from "@/lib/api/products";
import { orderFormSchema } from "@/lib/forms/order";
import { OrderItem, Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

interface CartItem extends OrderItem {
  prod_id: Product;
}

export default function NewOrderScreen() {
  const { productId, size, color, quantity } = useLocalSearchParams<{
    productId?: string;
    size?: string;
    color?: string;
    quantity?: string;
  }>();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userName: "",
      phoneNumber: "",
      address: "",
      shipping: 10,
      notes: "",
      userNotes: "",
      facebookProfile: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (productId) {
      loadProductAndAddToCart();
    }
  }, [productId]);

  const loadProductAndAddToCart = async () => {
    if (!productId) return;

    setIsLoadingProduct(true);
    try {
      const product = await getProductById(productId);
      const qty = quantity ? parseInt(quantity, 10) : 1;

      setCartItems([
        {
          prod_id: product,
          count: qty,
          size: size,
          color: color,
          price: product.price,
        },
      ]);
    } catch (error) {
      console.error("Failed to load product:", error);
      Alert.alert("Error", "Failed to load product");
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.count, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = form.watch("shipping") || 0;
    return subtotal + shipping;
  };

  const updateItemQuantity = (index: number, change: number) => {
    setCartItems((items) => {
      const newItems = [...items];
      const newQuantity = newItems[index].count + change;
      if (newQuantity <= 0) {
        newItems.splice(index, 1);
      } else {
        newItems[index].count = newQuantity;
      }
      return newItems;
    });
  };

  const removeItem = (index: number) => {
    setCartItems((items) => items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: z.infer<typeof orderFormSchema>) => {
    if (cartItems.length === 0) {
      Alert.alert("Error", "Please add at least one product to the order");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          prod_id:
            typeof item.prod_id === "object" ? item.prod_id._id : item.prod_id,
          count: item.count,
          size: item.size,
          color: item.color,
          price: item.price,
        })),
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        shipping: data.shipping,
        total: calculateTotal(),
        notes: data.notes || undefined,
        userNotes: data.userNotes || undefined,
        facebookProfile: data.facebookProfile || undefined,
      };

      const order = await createOrder(orderData);
      router.replace(`/orders/${order._id}`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>New Order</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {cartItems.map((item, index) => {
                const product =
                  typeof item.prod_id === "object" ? item.prod_id : null;
                if (!product) return null;

                const imageUri = product.image?.startsWith("http")
                  ? product.image
                  : `${API_BASE_URL.replace("/api", "")}${product.image}`;

                return (
                  <View key={index} style={styles.cartItem}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{product.name}</Text>
                      <Text style={styles.itemPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                      {(item.size || item.color) && (
                        <Text style={styles.itemVariant}>
                          {[item.size, item.color].filter(Boolean).join(" • ")}
                        </Text>
                      )}
                    </View>
                    <View style={styles.itemActions}>
                      <View style={styles.quantityControls}>
                        <Pressable
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(index, -1)}
                        >
                          <Minus size={16} color="#6B7280" />
                        </Pressable>
                        <Text style={styles.quantityText}>{item.count}</Text>
                        <Pressable
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(index, 1)}
                        >
                          <Plus size={16} color="#6B7280" />
                        </Pressable>
                      </View>
                      <Text style={styles.itemTotal}>
                        ${(item.price * item.count).toFixed(2)}
                      </Text>
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => removeItem(index)}
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
              <Button
                variant="outline"
                size="md"
                className="mt-4"
                onPress={() => router.push("/products")}
              >
                Add More Products
              </Button>
            </View>
          ) : (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>No items in cart</Text>
              <Button
                size="md"
                className="mt-4"
                onPress={() => router.push("/products")}
              >
                Browse Products
              </Button>
            </View>
          )}

          {/* User Information */}
          <FormProvider {...form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>User Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter user name"
                  value={form.watch("userName")}
                  onChangeText={(text) => form.setValue("userName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={form.watch("phoneNumber")}
                  onChangeText={(text) => form.setValue("phoneNumber", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder="Enter delivery address"
                  value={form.watch("address")}
                  onChangeText={(text) => form.setValue("address", text)}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Shipping & Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping & Notes</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shipping Cost ($) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={form.watch("shipping")?.toString() || "0"}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    form.setValue("shipping", num);
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder="Internal notes (optional)"
                  value={form.watch("notes")}
                  onChangeText={(text) => form.setValue("notes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>User Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Please wrap as a gift."
                  value={form.watch("userNotes")}
                  onChangeText={(text) => form.setValue("userNotes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Facebook Profile</Text>
                <View style={styles.facebookInput}>
                  <Text style={styles.facebookIcon}>f</Text>
                  <TextInput
                    style={styles.facebookInputField}
                    placeholder="profile.link"
                    value={form.watch("facebookProfile")}
                    onChangeText={(text) =>
                      form.setValue("facebookProfile", text)
                    }
                  />
                </View>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${calculateSubtotal().toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  ${(form.watch("shipping") || 0).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading || cartItems.length === 0}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-6"
            >
              Create Order
            </Button>
          </FormProvider>
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
  emptyCart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemPrice: {
    fontSize: 14,
    color: "#6B7280",
  },
  itemVariant: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  itemActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    minWidth: 24,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  removeButton: {
    padding: 4,
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
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    minHeight: 80,
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
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
});
