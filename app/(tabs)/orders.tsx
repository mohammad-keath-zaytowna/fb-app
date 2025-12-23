import { getOrders } from "@/lib/api/orders";
import { Order } from "@/types";
import { router } from "expo-router";
import { Receipt, Search, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatPrice, getUserCurrency } from "@/lib/utils/currency";

type FilterTab = "all" | "pending" | "completed" | "canceled";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const currency = getUserCurrency(user);

  useEffect(() => {
    loadOrders();
  }, [activeTab, searchQuery]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const status =
        activeTab === "all" ? undefined : activeTab;
      const response = await getOrders({
        page: 1,
        rowsPerPage: 20,
        status,
        search: searchQuery || undefined,
      });
      setOrders(response.orders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Pressable
      style={styles.orderCard}
      onPress={() => router.push(`/orders/${item._id}`)}
    >
      <View style={styles.orderIcon}>
        <Receipt size={24} color="#9CA3AF" />
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderNumber}>{t('order')} #{item._id.slice(-6)}</Text>
        {item.userName && (
          <Text style={styles.customerName}>{t("customer")}: {item.userName}</Text>
        )}
        <Text style={styles.orderPrice}>{formatPrice(item.total || item.totalAmount || 0, currency)}</Text>
        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(item.status)}20` },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.status) },
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myOrders')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchByCustomerName")}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        {(
          [
            { key: "all", label: t('all') },
            { key: "pending", label: t('pending') },
            { key: "completed", label: t('completed') },
            { key: "canceled", label: t('canceled') },
          ] as Array<{ key: FilterTab; label: string }>
        ).map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🛍️</Text>
          </View>
          <Text style={styles.emptyTitle}>{t('noOrdersYet')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('noOrdersDescription')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.ordersList}
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#DBEAFE",
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  ordersList: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  customerName: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  orderDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
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

