export type User = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superAdmin";
  status: "active" | "blocked" | "deleted";
  createdAt?: string;
  updatedAt?: string;
};

export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  status?: "active" | "inactive" | "deleted";
  createdAt?: string;
  updatedAt?: string;
};

export type OrderItem = {
  prod_id:
    | {
        _id: string;
        name: string;
        image?: string;
      }
    | string;
  count: number;
  size?: string;
  color?: string;
  price: number;
};

export type Order = {
  _id: string;
  user:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  items: OrderItem[];
  address: string;
  shipping: number;
  total: number;
  discount?: number;
  notes?: string;
  userNotes?: string;
  facebookProfile?: string;
  phoneNumber?: string;
  userName?: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  createdByAdmin?:
    | {
        _id: string;
        name: string;
        email: string;
      }
    | string;
  createdAt?: string;
  updatedAt?: string;
  // Computed property for compatibility
  totalAmount?: number;
};

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type ApiError = {
  message: string;
  errors?: { field: string; message: string }[];
  status: number;
};

export interface CartItem {
  id: string; // product id
  name: string;
  price: number;
  image?: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
}
