import { Button } from "@/components/ui/button";
import { useCartContext } from "@/contexts/CartContext";
import { API_BASE_URL } from "@/lib/api/config";
import { getProductById } from "@/lib/api/products";
import { Product } from "@/types";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Minus, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, items, updateQuantity } = useCartContext();
  const { t } = useTranslation();

  const cartItem = items.find(
    (item) =>
      item.id === id &&
      item.size === selectedSize &&
      item.color === selectedColor
  );

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  if (isLoading || !product) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sizes = product.sizes || [];
  const colors = product.colors || [];

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} title={t('pullToRefresh')} tintColor="#3B82F6" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image?.startsWith("http")
                ? product.image
                : `${API_BASE_URL.replace("/api", "")}${product.image}`,
            }}
            style={styles.productImage}
            contentFit="cover"
          />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>JOD {product.price.toFixed(2)}</Text>
          </View>
          <Text style={styles.productDescription}>
            {product.description || t('productDescription')}
          </Text>

          {/* Size Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('size')}</Text>
            <View style={styles.optionsContainer}>
              {sizes.map((size) => (
                <Pressable
                  key={size}
                  style={[
                    styles.optionButton,
                    selectedSize === size && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSize === size && styles.optionTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('color')}</Text>
            <View style={styles.optionsContainer}>
              {colors.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorButton,
                    selectedColor === color && styles.colorButtonActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <View
                    style={[styles.colorCircle, { backgroundColor: color }]}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Add to Order Button / Quantity Controls */}
          {cartItem ? (
            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  updateQuantity(
                    cartItem.id,
                    cartItem.size,
                    cartItem.color,
                    cartItem.quantity - 1
                  )
                }
              >
                <Minus size={24} color="#111827" />
              </Pressable>
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>
              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  updateQuantity(
                    cartItem.id,
                    cartItem.size,
                    cartItem.color,
                    cartItem.quantity + 1
                  )
                }
              >
                <Plus size={24} color="#111827" />
              </Pressable>
            </View>
          ) : (
            <Button
              size="lg"
              className="w-full mt-6"
              onPress={() =>
                addToCart({
                  id: product._id,
                  name: product.name,
                  image: product.image,
                  size: selectedSize,
                  color: selectedColor,
                  price: product.price,
                  quantity: 1,
                })
              }
            >
              {t('addToOrder')}
            </Button>
          )}
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
    padding: 16,
  },
  imageContainer: {
    height: 400,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    flex: 1,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  productDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  optionButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  optionTextActive: {
    color: "#3B82F6",
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonActive: {
    borderColor: "#3B82F6",
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
});
