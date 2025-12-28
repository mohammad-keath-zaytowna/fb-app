import apiClient, { API_BASE_URL } from "./config";
import { Product } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface GetProductsParams {
  page?: number;
  rowsPerPage?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: string;
  sortBy?: string;
}

export interface ProductListResponse {
  products: Product[];
  meta?: {
    page: number;
    rowsPerPage: number;
    total: number;
    totalPages: number;
  };
}

export const getProducts = async (
  params?: GetProductsParams
): Promise<ProductListResponse> => {
  try {
    const queryParams: Record<string, any> = {
      page: params?.page || 1,
      rowsPerPage: params?.rowsPerPage || 10,
      status: "active", // Mobile app only shows active products
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search;
    }

    if (params?.category && params.category.trim() !== "") {
      queryParams.category = params.category;
    }

    // Don't allow overriding status in mobile app
    // We always want only active products

    if (params?.sort) {
      queryParams.sort = params.sort;
    }

    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }

    const { data } = await apiClient.get("/products", { params: queryParams });
    return data?.data || { products: [], meta: undefined };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch products";
    throw new Error(message);
  }
};

export const getProductById = async (productId: string): Promise<Product> => {
  try {
    const { data } = await apiClient.get(`/products/${productId}`);
    return data?.data?.product;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch product";
    throw new Error(message);
  }
};

export const createProduct = async (productData: {
  name: string;
  image: any; // File or URI for React Native
  category: string;
  price: number;
  description?: string;
  colors?: string[];
  sizes?: string[];
}): Promise<Product> => {
  try {
    const formData = new FormData();
    formData.append("name", productData.name);

    // Handle image - can be a local URI or file
    if (productData.image) {
      // For React Native, image from expo-image-picker has uri property
      const imageUri = productData.image.uri || productData.image;
      
      // Get file extension and determine MIME type
      const uriParts = imageUri.split('.');
      const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
      };
      const mimeType = mimeTypes[fileExtension] || 'image/jpeg';
      
      // Create proper file name
      const fileName = productData.image.fileName || `product_${Date.now()}.${fileExtension}`;

      // React Native requires this specific format for file uploads
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);
    }

    formData.append("category", productData.category);
    formData.append("price", productData.price.toString());
    if (productData.description) {
      formData.append("description", productData.description);
    }
    if (productData.colors && productData.colors.length > 0) {
      formData.append("colors", JSON.stringify(productData.colors));
    }
    if (productData.sizes && productData.sizes.length > 0) {
      formData.append("sizes", JSON.stringify(productData.sizes));
    }

    const token = await AsyncStorage.getItem("@auth_token");
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    const data = await response.json();
    return data?.data?.product;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create product";
    throw new Error(message);
  }
};

