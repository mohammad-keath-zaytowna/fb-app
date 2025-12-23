import { Button } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { getOrderById, updateOrder } from "@/lib/api/orders";
import { getProducts } from "@/lib/api/products";
import { Order, OrderItem, Product } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatPrice, getUserCurrency } from "@/lib/utils/currency";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Minus, Plus, Trash2, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

export default function OrderEditScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { t } = useTranslation();
    const { user } = useAuthContext();
    const currency = getUserCurrency(user);

    // Form state
    const [items, setItems] = useState<OrderItem[]>([]);
    const [userName, setUserName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [shipping, setShipping] = useState("0");
    const [discount, setDiscount] = useState("0");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState<"pending" | "paid" | "shipped" | "completed" | "cancelled">("pending");

    // Add item modal state
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            loadOrder();
            loadProducts();
        }
    }, [id]);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data.products || []);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadOrder = async () => {
        setIsLoading(true);
        try {
            const data = await getOrderById(id);
            setOrder(data);

            // Initialize form with order data
            setItems([...data.items]);
            setUserName(data.userName || "");
            setPhoneNumber(data.phoneNumber || "");
            setAddress(data.address || "");
            setShipping(String(data.shipping || 0));
            setDiscount(String(data.discount || 0));
            setNotes(data.notes || "");
            setStatus(data.status || "pending");
        } catch (error) {
            console.error("Failed to load order:", error);
            Alert.alert(t("error"), t("failedToLoadOrder"));
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const updateItemQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        const newItems = [...items];
        newItems[index] = { ...newItems[index], count: newQuantity };
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) {
            Alert.alert(t("error"), t("cannotRemoveLastItem"));
            return;
        }
        Alert.alert(
            t("removeItem"),
            t("removeItemQuestion"),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("remove"),
                    style: "destructive",
                    onPress: () => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                    },
                },
            ]
        );
    };

    const openAddItemModal = () => {
        setSelectedProduct(null);
        setSelectedSize("");
        setSelectedColor("");
        setNewItemQuantity(1);
        setShowAddItemModal(true);
    };

    const addNewItem = () => {
        if (!selectedProduct) {
            Alert.alert(t("error"), t("pleaseSelectProduct"));
            return;
        }

        const newItem: OrderItem = {
            prod_id: selectedProduct,
            size: selectedSize,
            color: selectedColor,
            price: selectedProduct.price,
            count: newItemQuantity,
        };

        setItems([...items, newItem]);
        setShowAddItemModal(false);
    };

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.count), 0);
        const shippingCost = parseFloat(shipping) || 0;
        const discountAmount = parseFloat(discount) || 0;
        return Math.max(0, subtotal + shippingCost - discountAmount);
    };

    const handleSave = async () => {
        if (!order || items.length === 0) {
            Alert.alert(t("error"), t("orderMustHaveOneItem"));
            return;
        }

        setIsSaving(true);
        try {
            await updateOrder(id, {
                items: items.map(item => ({
                    prod_id: typeof item.prod_id === 'object' ? item.prod_id._id : item.prod_id,
                    size: item.size,
                    color: item.color,
                    price: item.price,
                    count: item.count,
                })),
                userName,
                phoneNumber,
                address,
                shipping: parseFloat(shipping) || 0,
                discount: parseFloat(discount) || 0,
                notes,
                status,
            });

            Alert.alert("Success", "Order updated successfully", [
                {
                    text: t("ok"),
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: any) {
            Alert.alert(t("error"), error.message || t("failedToUpdateOrder"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !order) {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text>{t("loading")}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.count), 0);
    const total = calculateTotal();

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <ScrollView>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()}>
                            <ArrowLeft size={24} color="#111827" />
                        </Pressable>
                        <Text style={styles.headerTitle}>{t("editOrder")}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <View style={styles.content}>
                        {/* Order ID */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("orderInformation")}</Text>
                            <Text style={styles.orderId}>{t("order")} #{order._id.slice(-8).toUpperCase()}</Text>
                        </View>

                        {/* Customer Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("customerInformation")}</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t("customerName")}</Text>
                                <Input>
                                    <InputField
                                        value={userName}
                                        onChangeText={setUserName}
                                        placeholder={t("customerName")}
                                    />
                                </Input>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t("phoneNumber")}</Text>
                                <Input>
                                    <InputField
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        placeholder={t("phoneNumber")}
                                        keyboardType="phone-pad"
                                    />
                                </Input>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t("address")}</Text>
                                <Input>
                                    <InputField
                                        value={address}
                                        onChangeText={setAddress}
                                        placeholder={t("deliveryAddress")}
                                        multiline
                                    />
                                </Input>
                            </View>
                        </View>

                        {/* Order Items (Editable) */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("orderItems")}</Text>
                            {items.map((item, index) => {
                                const product = typeof item.prod_id === 'object' ? item.prod_id : null;
                                return (
                                    <View key={index} style={styles.itemCard}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>
                                                    {product?.name || t("product")}
                                                </Text>
                                                {item.size && (
                                                    <Text style={styles.itemDetail}>{t("size")}: {item.size}</Text>
                                                )}
                                                {item.color && (
                                                    <Text style={styles.itemDetail}>{t("color")}: {item.color}</Text>
                                                )}
                                                <Text style={styles.itemPrice}>
                                                    {formatPrice(item.price, currency)} {t("each")}
                                                </Text>
                                            </View>

                                            {/* Quantity Controls */}
                                            <View style={styles.quantityContainer}>
                                                <Pressable
                                                    style={styles.quantityButton}
                                                    onPress={() => updateItemQuantity(index, item.count - 1)}
                                                >
                                                    <Minus size={18} color="#111827" />
                                                </Pressable>
                                                <Text style={styles.quantityText}>{item.count}</Text>
                                                <Pressable
                                                    style={styles.quantityButton}
                                                    onPress={() => updateItemQuantity(index, item.count + 1)}
                                                >
                                                    <Plus size={18} color="#111827" />
                                                </Pressable>
                                            </View>
                                        </View>

                                        <View style={styles.itemActions}>
                                            <Text style={styles.itemTotal}>
                                                {formatPrice(item.price * item.count, currency)}
                                            </Text>
                                            <Pressable
                                                style={styles.deleteButton}
                                                onPress={() => removeItem(index)}
                                            >
                                                <Trash2 size={20} color="#EF4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Add Item Button */}
                            <Pressable
                                style={styles.addItemButton}
                                onPress={openAddItemModal}
                            >
                                <Plus size={20} color="#3B82F6" />
                                <Text style={styles.addItemText}>{t("addItem")}</Text>
                            </Pressable>
                        </View>

                        {/* Financial Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("financialDetails")}</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t("shippingCost")}</Text>
                                <Input>
                                    <InputField
                                        value={shipping}
                                        onChangeText={setShipping}
                                        placeholder="0"
                                        keyboardType="decimal-pad"
                                    />
                                </Input>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t("discount")}</Text>
                                <Input>
                                    <InputField
                                        value={discount}
                                        onChangeText={setDiscount}
                                        placeholder="0"
                                        keyboardType="decimal-pad"
                                    />
                                </Input>
                            </View>

                            {/* Order Summary */}
                            <View style={styles.summaryCard}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>{t("subtotal")}</Text>
                                    <Text style={styles.summaryValue}>{formatPrice(subtotal, currency)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>{t("shipping")}</Text>
                                    <Text style={styles.summaryValue}>{formatPrice(parseFloat(shipping) || 0, currency)}</Text>
                                </View>
                                {parseFloat(discount) > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>{t("discount")}</Text>
                                        <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                                            -{formatPrice(parseFloat(discount) || 0, currency)}
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.summaryRow, styles.summaryTotal]}>
                                    <Text style={styles.summaryTotalLabel}>{t("total")}</Text>
                                    <Text style={styles.summaryTotalValue}>{formatPrice(total, currency)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Order Status */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("orderStatus")}</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(value) => setStatus(value as any)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label={t("pending")} value="pending" />
                                    <Picker.Item label={t("paid")} value="paid" />
                                    <Picker.Item label={t("shipped")} value="shipped" />
                                    <Picker.Item label={t("completed")} value="completed" />
                                    <Picker.Item label={t("cancelled")} value="cancelled" />
                                </Picker>
                            </View>
                        </View>

                        {/* Notes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{t("notes")}</Text>
                            <Input>
                                <InputField
                                    value={notes}
                                    onChangeText={setNotes}
                                    placeholder={t("addNotes")}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </Input>
                        </View>

                        {/* Save Button */}
                        <Button
                            onPress={handleSave}
                            disabled={isSaving}
                            size="lg"
                            className="mt-6"
                        >
                            {isSaving ? t("saving") : t("saveChanges")}
                        </Button>
                    </View>
                </ScrollView>

                {/* Add Item Modal */}
                <Modal
                    visible={showAddItemModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowAddItemModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t("addItemToOrder")}</Text>
                                <Pressable onPress={() => setShowAddItemModal(false)}>
                                    <X size={24} color="#111827" />
                                </Pressable>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Product Selection */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>{t("product")}</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={selectedProduct?._id || ""}
                                            onValueChange={(value) => {
                                                const product = products.find(p => p._id === value);
                                                setSelectedProduct(product || null);
                                                if (product) {
                                                    setSelectedSize(product.sizes?.[0] || "");
                                                    setSelectedColor(product.colors?.[0] || "");
                                                }
                                            }}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label={t("selectAProduct")} value="" />
                                            {products.map((product) => (
                                                <Picker.Item
                                                    key={product._id}
                                                    label={`${product.name} - ${format Price(product.price, currency)}`}
                                            value={product._id}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                </View>

                                {selectedProduct && (
                                    <>
                                        {/* Size Selection */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>{t("size")}</Text>
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={selectedSize}
                                                    onValueChange={setSelectedSize}
                                                    style={styles.picker}
                                                >
                                                    {selectedProduct.sizes?.map((size) => (
                                                        <Picker.Item key={size} label={size} value={size} />
                                                    ))}
                                                </Picker>
                                            </View>
                                        </View>

                                        {/* Color Selection */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>{t("color")}</Text>
                                            <View style={styles.pickerContainer}>
                                                <Picker
                                                    selectedValue={selectedColor}
                                                    onValueChange={setSelectedColor}
                                                    style={styles.picker}
                                                >
                                                    {selectedProduct.colors?.map((color) => (
                                                        <Picker.Item key={color} label={color} value={color} />
                                                    ))}
                                                </Picker>
                                            </View>
                                        </View>

                                        {/* Quantity */}
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>{t("quantity")}</Text>
                                            <View style={styles.quantityContainer}>
                                                <Pressable
                                                    style={styles.quantityButton}
                                                    onPress={() => setNewItemQuantity(Math.max(1, newItemQuantity - 1))}
                                                >
                                                    <Minus size={18} color="#111827" />
                                                </Pressable>
                                                <Text style={styles.quantityText}>{newItemQuantity}</Text>
                                                <Pressable
                                                    style={styles.quantityButton}
                                                    onPress={() => setNewItemQuantity(newItemQuantity + 1)}
                                                >
                                                    <Plus size={18} color="#111827" />
                                                </Pressable>
                                            </View>
                                        </View>

                                        {/* Price Preview */}
                                        <View style={styles.pricePreview}>
                                            <Text style={styles.pricePreviewLabel}>{t("total")}:</Text>
                                            <Text style={styles.pricePreviewValue}>
                                                {formatPrice(selectedProduct.price * newItemQuantity, currency)}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </ScrollView>

                            {/* Modal Actions */}
                            <View style={styles.modalActions}>
                                <Button
                                    onPress={() => setShowAddItemModal(false)}
                                    variant="outline"
                                    className="flex-1 mr-2"
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    onPress={addNewItem}
                                    className="flex-1 ml-2"
                                    disabled={!selectedProduct}
                                >
                                    {t("addItem")}
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
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
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 16,
    },
    orderId: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 8,
    },
    itemCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
    },
    itemDetail: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 2,
    },
    itemPricing: {
        alignItems: "flex-end",
    },
    itemPrice: {
        fontSize: 12,
        color: "#6B7280",
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginTop: 4,
    },
    summaryCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#6B7280",
    },
    summaryValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "500",
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingTop: 12,
        marginTop: 4,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 8,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        minWidth: 30,
        textAlign: "center",
    },
    itemActions: {
        alignItems: "flex-end",
        gap: 8,
    },
    deleteButton: {
        marginTop: 8,
        padding: 8,
    },
    addItemButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        marginTop: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderStyle: "dashed",
        backgroundColor: "#EFF6FF",
    },
    addItemText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3B82F6",
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        paddingBottom: 30
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    modalBody: {
        padding: 16,
        maxHeight: 400,
    },
    modalActions: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    pricePreview: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        marginTop: 16,
    },
    pricePreviewLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
    pricePreviewValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
});
