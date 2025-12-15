import RHFInput from "@/components/react-hook-form/rhf-input";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/lib/api/products";
import { productFormSchema } from "@/lib/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";

export default function AddProductScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<any>(null);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      description: "",
    },
    mode: "onChange",
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async (data: z.infer<typeof productFormSchema>) => {
    if (isLoading || !image) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    setIsLoading(true);
    try {
      await createProduct({
        ...data,
        image,
      });
      Alert.alert("Success", "Product created successfully", [
        {
          text: "OK",
          onPress: () => {
            form.reset();
            setImage(null);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add New Product</Text>
          </View>

          <FormProvider {...form}>
            {/* Image Upload */}
            <View style={styles.imageUploadContainer}>
              <Text style={styles.sectionTitle}>Add Photo</Text>
              <Pressable
                style={styles.imageUploadArea}
                onPress={pickImage}
              >
                {image ? (
                  <Text style={styles.imageUploadText}>
                    {image.fileName || "Image selected"}
                  </Text>
                ) : (
                  <>
                    <ImagePlus size={48} color="#9CA3AF" />
                    <Text style={styles.imageUploadTitle}>Add Photo</Text>
                    <Text style={styles.imageUploadSubtitle}>
                      Upload an image for your product
                    </Text>
                    <Button
                      variant="outline"
                      size="md"
                      onPress={pickImage}
                      className="mt-4"
                    >
                      Upload Image
                    </Button>
                  </>
                )}
              </Pressable>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              <RHFInput
                name="name"
                label="Product Name"
                placeholder="e.g., Vintage Leather Jacket"
                type="text"
              />

              <View style={{ marginTop: 16 }}>
                <RHFInput
                  name="category"
                  label="Category"
                  placeholder="Select a category"
                  type="text"
                />
              </View>

              <View style={{ marginTop: 16 }}>
                <RHFInput
                  name="price"
                  label="Price"
                  placeholder="$0.00"
                  type="number"
                />
              </View>

              <View style={{ marginTop: 16 }}>
                <RHFInput
                  name="description"
                  label="Description"
                  placeholder="Enter a brief description..."
                  type="text"
                />
              </View>
            </View>

            {/* Action Button */}
            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              className="w-full mt-6"
            >
              Save Product
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
  content: {
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  imageUploadContainer: {
    marginBottom: 24,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    minHeight: 200,
  },
  imageUploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 12,
  },
  imageUploadSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  imageUploadText: {
    fontSize: 14,
    color: "#3B82F6",
    marginTop: 12,
  },
  form: {
    marginBottom: 24,
  },
});

