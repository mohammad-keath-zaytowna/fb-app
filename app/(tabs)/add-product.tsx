import RHFInput from "@/components/react-hook-form/rhf-input";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/lib/api/products";
import { productFormSchema } from "@/lib/forms/product";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus } from "lucide-react-native";
import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";
import { useTranslation } from "react-i18next";

export default function AddProductScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<any>(null);
  const { t } = useTranslation();

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
      Alert.alert(t('permissionNeeded'), t('grantPermissions'));
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
      Alert.alert(t('error'), t('selectImage'));
      return;
    }

    setIsLoading(true);
    try {
      await createProduct({
        ...data,
        image,
      });
      Alert.alert(t('success'), t('productCreatedSuccess'), [
        {
          text: t('ok'),
          onPress: () => {
            form.reset();
            setImage(null);
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToCreateProduct'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} >
      <SafeAreaView style={styles.container} edges={['top']}>

        <ScrollView>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('addNewProduct')}</Text>
            </View>

            <FormProvider {...form}>
              {/* Image Upload */}
              <View style={styles.imageUploadContainer}>
                <Text style={styles.sectionTitle}>{t('addPhoto')}</Text>
                <Pressable
                  style={styles.imageUploadArea}
                  onPress={pickImage}
                >
                  {image ? (
                    <Text style={styles.imageUploadText}>
                      {image.fileName || t('imageSelected')}
                    </Text>
                  ) : (
                    <>
                      <ImagePlus size={48} color="#9CA3AF" />
                      <Text style={styles.imageUploadTitle}>{t('addPhoto')}</Text>
                      <Text style={styles.imageUploadSubtitle}>
                        {t('uploadAnImage')}
                      </Text>
                      <Button
                        variant="outline"
                        size="md"
                        onPress={pickImage}
                        className="mt-4"
                      >
                        {t('uploadImage')}
                      </Button>
                    </>
                  )}
                </Pressable>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                <RHFInput
                  name="name"
                  label={t('productName')}
                  placeholder={t('productNamePlaceholder')}
                  type="text"
                />

                <View style={{ marginTop: 16 }}>
                  <RHFInput
                    name="category"
                    label={t('category')}
                    placeholder={t('categoryPlaceholder')}
                    type="text"
                  />
                </View>

                <View style={{ marginTop: 16 }}>
                  <RHFInput
                    name="price"
                    label={t('price')}
                    placeholder={t('pricePlaceholder')}
                    type="number"
                  />
                </View>

                <View style={{ marginTop: 16 }}>
                  <RHFInput
                    name="description"
                    label={t('description')}
                    placeholder={t('descriptionPlaceholder')}
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
                {t('saveProduct')}
              </Button>
            </FormProvider>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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

