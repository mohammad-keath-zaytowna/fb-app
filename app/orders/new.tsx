import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";
import { createOrder } from "@/lib/api/orders";
import { getProductById } from "@/lib/api/products";
import { orderFormSchema } from "@/lib/forms/order";
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
import { useTranslation } from "react-i18next";
import * as z from "zod";
import { useCartContext } from "@/contexts/CartContext";
import { useDirection } from "@/components/direction-provider";

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
  const { getDirectionAwareStyle } = useDirection();

  // Create dynamic styles that respect direction
  const dynamicStyles = {
    container: styles.container,
    header: getDirectionAwareStyle(styles.header),
    headerTitle: styles.headerTitle,
    content: styles.content,
    section: styles.section,
    sectionTitle: styles.sectionTitle,
    cartItem: getDirectionAwareStyle(styles.cartItem),
    itemImage: styles.itemImage,
    itemDetails: styles.itemDetails,
    itemName: styles.itemName,
    itemPrice: styles.itemPrice,
    itemVariant: styles.itemVariant,
    itemActions: getDirectionAwareStyle(styles.itemActions),
    quantityControls: getDirectionAwareStyle(styles.quantityControls),
    quantityButton: styles.quantityButton,
    quantityText: styles.quantityText,
    itemTotal: styles.itemTotal,
    removeButton: styles.removeButton,
    emptyCart: styles.emptyCart,
    emptyCartText: styles.emptyCartText,
    inputGroup: styles.inputGroup,
    inputLabel: styles.inputLabel,
    input: styles.input,
    textArea: styles.textArea,
    facebookInput: getDirectionAwareStyle(styles.facebookInput),
    facebookIcon: styles.facebookIcon,
    facebookInputField: styles.facebookInputField,
    summaryRow: getDirectionAwareStyle(styles.summaryRow),
    summaryLabel: styles.summaryLabel,
    summaryValue: styles.summaryValue,
    totalRow: styles.totalRow,
    totalLabel: styles.totalLabel,
    totalValue: styles.totalValue,
  };

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      userName: "",
      phoneNumber: "",
      address: "",
      shipping: 10,
      discount: 0,
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
      Alert.alert(t("error"), t("failedToLoadProduct"));
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
    const discount = form.watch("discount") || 0;
    return Math.max(0, subtotal + shipping - discount);
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
      Alert.alert(t("error"), t("addAtLeastOneProduct"));
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
        discount: data.discount || 0,
        total: calculateTotal(),
        notes: data.notes || undefined,
        userNotes: data.userNotes || undefined,
        facebookProfile: data.facebookProfile || undefined,
      };

      const order = await createOrder(orderData);
      clearCart();
      router.replace(`/orders/${order._id}`);
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("failedToCreateOrder"));
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
          <Text>{t("loadingProduct")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container} edges={["top", "bottom"]}>
      <ScrollView>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
          <Text style={dynamicStyles.headerTitle}>{t("newOrder")}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={dynamicStyles.content}>
          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>{t("orderItems")}</Text>
              {cartItems.map((item, index) => {
                const imageUri = item.image?.startsWith("http")
                  ? item.image
                  : `${API_BASE_URL.replace("/api", "")}${item.image}`;

                return (
                  <View
                    key={`${item.id}-${item.size}-${item.color}`}
                    style={dynamicStyles.cartItem}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={dynamicStyles.itemImage}
                      contentFit="cover"
                    />
                    <View style={dynamicStyles.itemDetails}>
                      <Text style={dynamicStyles.itemName}>{item.name}</Text>
                      <Text style={dynamicStyles.itemPrice}>
                        JOD {item.price.toFixed(2)}
                      </Text>
                      {(item.size || item.color) && (
                        <Text style={dynamicStyles.itemVariant}>
                          {[item.size, item.color].filter(Boolean).join(" • ")}
                        </Text>
                      )}
                    </View>
                    <View style={dynamicStyles.itemActions}>
                      <View style={dynamicStyles.quantityControls}>
                        <Pressable
                          style={dynamicStyles.quantityButton}
                          onPress={() => updateItemQuantity(index, -1)}
                        >
                          <Minus size={16} color="#6B7280" />
                        </Pressable>
                        <Text style={dynamicStyles.quantityText}>{item.quantity}</Text>
                        <Pressable
                          style={dynamicStyles.quantityButton}
                          onPress={() => updateItemQuantity(index, 1)}
                        >
                          <Plus size={16} color="#6B7280" />
                        </Pressable>
                      </View>
                      <Text style={dynamicStyles.itemTotal}>
                        JOD {(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <Pressable
                        style={dynamicStyles.removeButton}
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
                {t("addMoreProducts")}
              </Button>
            </View>
          ) : (
            <View style={dynamicStyles.emptyCart}>
              <Text style={dynamicStyles.emptyCartText}>{t("noItemsInCart")}</Text>
              <Button
                size="md"
                className="mt-4"
                onPress={() => router.push("/products")}
              >
                {t("browseProducts")}
              </Button>
            </View>
          )}

          {/* User Information */}
          <FormProvider {...form}>
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>{t("userInformation")}</Text>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("userName")} *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder={t("enterUserName")}
                  value={form.watch("userName")}
                  onChangeText={(text) => form.setValue("userName", text)}
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("phoneNumber")} *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder={t("enterPhoneNumber")}
                  keyboardType="phone-pad"
                  value={form.watch("phoneNumber")}
                  onChangeText={(text) => form.setValue("phoneNumber", text)}
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("address")} *</Text>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t("enterDeliveryAddress")}
                  value={form.watch("address")}
                  onChangeText={(text) => form.setValue("address", text)}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Shipping & Notes */}
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>{t("shippingAndNotes")}</Text>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("notes")}</Text>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t("internalNotes")}
                  value={form.watch("notes")}
                  onChangeText={(text) => form.setValue("notes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("userNotes")}</Text>
                <TextInput
                  style={[dynamicStyles.input, dynamicStyles.textArea]}
                  multiline
                  numberOfLines={3}
                  placeholder={t("userNotesPlaceholder")}
                  value={form.watch("userNotes")}
                  onChangeText={(text) => form.setValue("userNotes", text)}
                  textAlignVertical="top"
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("facebookProfile")}</Text>
                <View style={dynamicStyles.facebookInput}>
                  <Text style={dynamicStyles.facebookIcon}>f</Text>
                  <TextInput
                    style={dynamicStyles.facebookInputField}
                    placeholder={t("facebookPlaceholder")}
                    value={form.watch("facebookProfile")}
                    onChangeText={(text) =>
                      form.setValue("facebookProfile", text)
                    }
                  />
                </View>
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("shippingCost")} *</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={form.watch("shipping")?.toString() || "0"}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    form.setValue("shipping", num);
                  }}
                />
              </View>

              <View style={dynamicStyles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>{t("discount")}</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={form.watch("discount")?.toString() || "0"}
                  onChangeText={(text) => {
                    const num = parseFloat(text) || 0;
                    form.setValue("discount", num);
                  }}
                />
              </View>
            </View>

            {/* Order Summary */}
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>{t("orderSummary")}</Text>
              <View style={dynamicStyles.summaryRow}>
                <Text style={dynamicStyles.summaryLabel}>{t("subtotal")}</Text>
                <Text style={dynamicStyles.summaryValue}>
                  JOD {calculateSubtotal().toFixed(2)}
                </Text>
              </View>
              <View style={dynamicStyles.summaryRow}>
                <Text style={dynamicStyles.summaryLabel}>{t("shipping")}</Text>
                <Text style={dynamicStyles.summaryValue}>
                  JOD {(form.watch("shipping") || 0).toFixed(2)}
                </Text>
              </View>
              {(form.watch("discount") || 0) > 0 && (
                <View style={dynamicStyles.summaryRow}>
                  <Text style={dynamicStyles.summaryLabel}>{t("discount")}</Text>
                  <Text style={dynamicStyles.summaryValue}>
                    -JOD {(form.watch("discount") || 0).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[dynamicStyles.summaryRow, dynamicStyles.totalRow]}>
                <Text style={dynamicStyles.totalLabel}>{t("total")}</Text>
                <Text style={dynamicStyles.totalValue}>
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
              {t("createOrder")}
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
