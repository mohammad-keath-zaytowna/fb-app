import { API_BASE_URL } from "@/lib/api/config";
import { getProducts } from "@/lib/api/products";
import { Product } from "@/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Plus, Search } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  // const [activeFilter, setActiveFilter] = useState<string | null>("new");
  const [searchDebounced] = useDebounce(searchQuery, 200);

  useEffect(() => {
    loadProducts();
  }, [searchDebounced]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts({
        page: 1,
        rowsPerPage: 20,
        search: searchDebounced || undefined,
      });
      setProducts(response.products);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
      case "In Stock":
        return "#10B981";
      case "Low Stock":
        return "#F59E0B";
      case "On Sale":
        return "#EF4444";
      case "Out of Stock":
        return "#6B7280";
      default:
        return "#3B82F6";
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri = item.image?.startsWith("http")
      ? item.image
      : `${API_BASE_URL.replace("/api", "")}${item.image}`;

    return (
      <Pressable
        style={styles.productCard}
        onPress={() => router.push(`/products/${item._id}`)}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.productImage}
          contentFit="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>JOD {item.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.productStatus,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status === "active"
              ? t('inStock')
              : item.status === "Low Stock"
              ? t('lowStock')
              : item.status === "On Sale"
              ? t('onSale')
              : item.status === "Out of Stock"
              ? t('outOfStock')
              : item.status || t('newArrival')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('products')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchForProducts')}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {/* Filters */}
      {/* <View style={styles.filtersContainer}>
        <Pressable style={styles.sortButton}>
          <Filter size={16} color="#6B7280" />
          <Text style={styles.sortButtonText}>Sort By</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterChip,
            activeFilter === "new" && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(activeFilter === "new" ? null : "new")}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === "new" && styles.filterChipTextActive,
            ]}
          >
            New Arrivals
          </Text>
          {activeFilter === "new" && <X size={14} color="#FFFFFF" />}
        </Pressable>

        <Pressable
          style={[
            styles.filterChip,
            activeFilter === "sale" && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter(activeFilter === "sale" ? null : "sale")}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === "sale" && styles.filterChipTextActive,
            ]}
          >
            On Sale
          </Text>
        </Pressable>
      </View>*/}

      {/* Products List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} title={t('pullToRefresh')} tintColor="#3B82F6" />
          }
        />
      )}
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
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "left",
  },
  filtersContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  filterChipActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  productsList: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  productStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
