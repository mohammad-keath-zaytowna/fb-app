import apiClient from "./config";
import { Order } from "@/types";

export interface GetOrdersParams {
  page?: number;
  rowsPerPage?: number;
  search?: string;
  status?: string;
  user?: string;
  sort?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResponse {
  orders: Order[];
  meta?: {
    page: number;
    rowsPerPage: number;
    total: number;
    totalPages: number;
  };
}

export const getOrders = async (
  params?: GetOrdersParams
): Promise<OrderListResponse> => {
  try {
    const queryParams: Record<string, any> = {
      page: params?.page || 1,
      rowsPerPage: params?.rowsPerPage || 10,
    };

    if (params?.search && params.search.trim() !== "") {
      queryParams.search = params.search;
    }

    if (params?.status && params.status.trim() !== "") {
      queryParams.status = params.status;
    }

    if (params?.user && params.user.trim() !== "") {
      queryParams.user = params.user;
    }

    if (params?.sort) {
      queryParams.sort = params.sort;
    }

    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }

    if (params?.startDate) {
      queryParams.startDate = params.startDate;
    }

    if (params?.endDate) {
      queryParams.endDate = params.endDate;
    }

    const { data } = await apiClient.get("/orders", { params: queryParams });
    return data?.data || { orders: [], meta: undefined };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch orders";
    throw new Error(message);
  }
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const { data } = await apiClient.get(`/orders/${orderId}`);
    return data?.data?.order;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch order";
    throw new Error(message);
  }
};

export const createOrder = async (orderData: {
  items: Array<{
    prod_id: string;
    count: number;
    size?: string;
    color?: string;
    price: number;
  }>;
  userName: string;
  phoneNumber: string;
  address: string;
  shipping: number;
  discount?: number;
  notes?: string;
  userNotes?: string;
  facebookProfile?: string;
}): Promise<Order> => {
  try {
    const { data } = await apiClient.post("/orders/cart", orderData);
    return data?.data?.order;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create order";
    throw new Error(message);
  }
};

