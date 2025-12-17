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
import { useCartContext } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";

export default function NewOrderScreen() {
  const {
    productId,
    size,
    color,
    quantity,
    shipping: shippingParam,
  } = useLocalSearchParams<{
    productId?: string;
    size?: string;
    color?: string;
    quantity?: string;
    shipping?: string;
  }>();

  const {
    items: cartItems,
    addToCart,
    clearCart,
    updateQuantity,
    removeFromCart,
  } = useCartContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const { t } = useTranslation();

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

      addToCart({
        id: product._id,
        name: product.name,
        image: product.image,
        size: size || "",
        color: color || "",
        price: product.price,
        quantity: qty,
      });
    } catch (error) {
      console.error("Failed to load product:", error);
      Alert.alert(t('error'), t('failedToLoadProduct'));
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = form.watch("shipping") || 0;
    return subtotal + shipping;
  };

  const updateItemQuantity = (index: number, change: number) => {
    const item = cartItems[index];
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeFromCart(item.id, item.size, item.color);
    } else {
      updateQuantity(item.id, item.size, item.color, newQuantity);
    }
  };

  const removeItem = (index: number) => {
    const item = cartItems[index];
    removeFromCart(item.id, item.size, item.color);
  };

  const handleSubmit = async (data: z.infer<typeof orderFormSchema>) => {
    if (cartItems.length === 0) {
      Alert.alert(t('error'), t('addAtLeastOneProduct'));
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          prod_id: item.id,
          count: item.quantity,
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
      clearCart();
      router.replace(`/orders/${order._id}`);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToCreateOrder'));
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
          <Text>{t('loadingProduct')}</Text>
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
          <Text style={styles.headerTitle}>{t('newOrder')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('orderItems')}</Text>
              {cartItems.map((item, index) => {
                const imageUri = item.image?.startsWith("http")
                  ? item.image
                  : `${API_BASE_URL.replace("/api", "")}${item.image}`;

                return (
                  <View
                    key={`${item.id}-${item.size}-${item.color}`}
                    style={styles.cartItem}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>
                        JOD {item.price.toFixed(2)}
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
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <Pressable
                          style={styles.quantityButton}
                          onPress={() => updateItemQuantity(index, 1)}
                        >
                          <Plus size={16} color="#6B7280" />
                        </Pressable>
                      </View>
                      <Text style={styles.itemTotal}>
                        JOD {(item.price * item.quantity).toFixed(2)}
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
                {t('addMoreProducts')}
              </Button>
            </View>
          ) : (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>{t('noItemsInCart')}</Text>
              <Button
                size="md"
                className="mt-4"
                onPress={() => router.push("/products")}
              >
                {t('browseProducts')}
              </Button>
            </View>
          )}

          {/* User Information */}
          <FormProvider {...form}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('userInformation')}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('userName')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterUserName')}
                  value={form.watch("userName")}
                  onChangeText={(text) => form.setValue("userName", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('phoneNumber')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterPhoneNumber')}
                  keyboardType="phone-pad"
                  value={form.watch("phoneNumber")}
                  onChangeText={(text) => form.setValue("phoneNumber", text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('address')} *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t('enterDeliveryAddress')}
                  value={form.watch("address")}
                  onChangeText={(text) => form.setValue("address", text)}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Shipping & Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('shippingAndNotes')}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('shippingCost')} *</Text>
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
                <Text style={styles.inputLabel}>{t('notes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t('internalNotes')}
                  value={form.watch("notes")}
                  onChangeText={(text) => form.setValue("notes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('userNotes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t('userNotesPlaceholder')}
                  value={form.watch("userNotes")}
                  onChangeText={(text) => form.setValue("userNotes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('facebookProfile')}</Text>
                <View style={styles.facebookInput}>
                  <Text style={styles.facebookIcon}>f</Text>
                  <TextInput
                    style={styles.facebookInputField}
                    placeholder={t('facebookPlaceholder')}
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
              <Text style={styles.sectionTitle}>{t('orderSummary')}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
                <Text style={styles.summaryValue}>
                  JOD {calculateSubtotal().toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('shipping')}</Text>
                <Text style={styles.summaryValue}>
                  JOD {(form.watch("shipping") || 0).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>{t('total')}</Text>
                <Text style={styles.totalValue}>
                  JOD {calculateTotal().toFixed(2)}
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
              {t('createOrder')}
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
