import apiClient from "./config";
import { Product } from "@/types";

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
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search;
    }

    if (params?.category && params.category.trim() !== "") {
      queryParams.category = params.category;
    }

    if (params?.status && params.status.trim() !== "") {
      queryParams.status = params.status;
    }

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
      const imageName = productData.image.fileName || `image_${Date.now()}.jpg`;
      const imageType = productData.image.type || "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: imageName,
        type: imageType,
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

    const { data } = await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data?.data?.product;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create product";
    throw new Error(message);
  }
};

