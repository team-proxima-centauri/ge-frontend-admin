const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Match the IP used in frontend test project

// --- safeLocalStorage Utility ---
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// --- Auth Interfaces ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

// --- Product Interfaces ---
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  stock_quantity: number;
  image_url: string;
  created_at: string;
}

// --- API Response Interface ---
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// --- API Request Helper with Auth Headers ---
const apiRequest = async (
  endpoint: string,
  method: string = 'GET',
  body?: Record<string, unknown>
): Promise<ApiResponse> => {
  // Get authentication token
  const token = safeLocalStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Using auth token for request');
  } else {
    console.warn('No auth token available for request');
  }

  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Include cookies for cross-origin requests if needed
  };

  try {
    // Log request details for debugging
    console.log(`Requesting ${method} ${API_BASE_URL}${endpoint}`, {
      headers: headers,
      withCredentials: true
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Try to parse response as JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      const textResponse = await response.text();
      console.log('Text response:', textResponse.substring(0, 500));
      data = {
        success: false,
        message: 'Invalid JSON response'
      };
    }
    
    // Handle non-successful response
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data);
      return {
        success: false,
        message: data.message || `Error ${response.status}: ${response.statusText}`,
        error: `Status: ${response.status}`
      };
    }
    
    return data;
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: String(error)
    };
  }
};

// --- Auth API Functions ---
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting login for:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Login failed with status ${response.status}:`, errorText);
      return { 
        success: false, 
        message: `Login failed with status ${response.status}` 
      };
    }
    
    const data: AuthResponse = await response.json();
    console.log('Login response data:', data);
    
    if (data.success && data.data) {
      // Store authentication data securely
      console.log('Storing auth token and user data');
      safeLocalStorage.setItem('token', data.data.token);
      safeLocalStorage.setItem('user', JSON.stringify(data.data.user));
      
      // For debug purposes, log stored values
      console.log('Token stored:', !!safeLocalStorage.getItem('token'));
      console.log('User data stored:', !!safeLocalStorage.getItem('user'));
    } else {
      console.error('Login response not successful:', data.message);
    }
    
    return data;
  } catch (error) {
    console.error('Login request error:', error);
    return { success: false, message: 'Login request failed. Please try again.' };
  }
};

export const logout = (): void => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = safeLocalStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      safeLocalStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const getToken = (): string | null => {
  return safeLocalStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getCurrentUser();
  return !!token && !!user && user.role === 'admin';
};

// --- Products API Functions ---
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiRequest('/products');
    if (response.success && Array.isArray(response.data)) {
      return response.data.map((product: Partial<Product>): Product => ({
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        unit: product.unit || '',
        category: product.category || '',
        image_url: product.image_url || '',
        created_at: product.created_at || new Date().toISOString(),
        price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
        stock_quantity: typeof product.stock_quantity === 'string' 
          ? parseInt(product.stock_quantity, 10) 
          : (product.stock_quantity || 0),
      }));
    }
    throw new Error(response.message || 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string): Promise<Product> => {
  try {
    const response = await apiRequest(`/products/${id}`);
    if (response.success && response.data) {
      const product = response.data as Partial<Product>;
      return {
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        unit: product.unit || '',
        category: product.category || '',
        image_url: product.image_url || '',
        created_at: product.created_at || new Date().toISOString(),
        price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
        stock_quantity: typeof product.stock_quantity === 'string' 
          ? parseInt(product.stock_quantity, 10) 
          : (product.stock_quantity || 0),
      };
    }
    throw new Error(response.message || 'Failed to fetch product');
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  try {
    const response = await apiRequest('/products', 'POST', product);
    if (response.success && response.data) {
      const returnedProduct = response.data as Partial<Product>;
      return {
        id: returnedProduct.id || '',
        name: returnedProduct.name || '',
        description: returnedProduct.description || '',
        unit: returnedProduct.unit || '',
        category: returnedProduct.category || '',
        image_url: returnedProduct.image_url || '',
        created_at: returnedProduct.created_at || new Date().toISOString(),
        price: typeof returnedProduct.price === 'string' ? parseFloat(returnedProduct.price) : (returnedProduct.price || 0),
        stock_quantity: typeof returnedProduct.stock_quantity === 'string' 
          ? parseInt(returnedProduct.stock_quantity, 10) 
          : (returnedProduct.stock_quantity || 0),
      };
    }
    throw new Error(response.message || 'Failed to create product');
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> => {
  try {
    const response = await apiRequest(`/products/${id}`, 'PUT', product);
    if (response.success && response.data) {
      const returnedProduct = response.data as Partial<Product>;
      return {
        id: returnedProduct.id || id,
        name: returnedProduct.name || '',
        description: returnedProduct.description || '',
        unit: returnedProduct.unit || '',
        category: returnedProduct.category || '',
        image_url: returnedProduct.image_url || '',
        created_at: returnedProduct.created_at || new Date().toISOString(),
        price: typeof returnedProduct.price === 'string' ? parseFloat(returnedProduct.price) : (returnedProduct.price || 0),
        stock_quantity: typeof returnedProduct.stock_quantity === 'string' 
          ? parseInt(returnedProduct.stock_quantity, 10) 
          : (returnedProduct.stock_quantity || 0),
      };
    }
    throw new Error(response.message || 'Failed to update product');
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const response = await apiRequest(`/products/${id}`, 'DELETE');
    return response.success;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// --- Users API Functions ---
export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user'; // Assuming 'admin' and 'user' are the only roles
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
}

export const createUser = async (userData: NewUser): Promise<User> => {
  try {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await apiRequest('/users', 'POST', userData as unknown as Record<string, unknown>);
    if (response.success && response.data) {
      const returnedUser = response.data as Partial<User>;
      return {
        id: returnedUser.id || '',
        name: returnedUser.name || '',
        email: returnedUser.email || '',
        role: returnedUser.role || 'user',
        created_at: returnedUser.created_at || new Date().toISOString()
      };
    }
    throw new Error(response.message || 'Failed to create user');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await apiRequest(`/users/${id}`, 'GET');
    if (response.success && response.data) {
      const returnedUser = response.data as Partial<User>; 
      return {
        id: returnedUser.id || '',
        name: returnedUser.name || '',
        email: returnedUser.email || '',
        role: returnedUser.role || 'user',
        created_at: returnedUser.created_at || new Date().toISOString(),
      };
    }
    if (!response.success) {
        console.warn(`Failed to fetch user ${id}: ${response.message}`);
        return null; 
    }
    return null; 
  } catch (error) {
    console.error(`Error fetching user by ID ${id}:`, error);
    throw error; 
  }
};

export const updateUser = async (id: string, userData: UpdateUserData): Promise<User> => {
  try {
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await apiRequest(`/users/${id}`, 'PUT', userData as unknown as Record<string, unknown>);
    if (response.success && response.data) {
      const returnedUser = response.data as Partial<User>; 
      return {
        id: returnedUser.id || id, 
        name: returnedUser.name || '',
        email: returnedUser.email || '',
        role: returnedUser.role || 'user',
        created_at: returnedUser.created_at || new Date().toISOString(), 
      };
    }
    throw new Error(response.message || 'Failed to update user');
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    console.log('Fetching users from:', `${API_BASE_URL}/users`);
    const token = safeLocalStorage.getItem('token');
    if (!token) {
      console.warn('No token found for fetching users, attempting public fetch.');
      // Allow fetching users even without a token for public/admin mixed scenarios
      // The backend should handle authorization if the endpoint is protected
    }

    const data = await apiRequest('/users', 'GET');
    
    // Log the raw response for debugging
    console.log('Raw users response:', data);

    if (data.success && Array.isArray(data.data)) {
      console.log('Users data successfully fetched and is an array:', data.data);
      // Filter out any potential null/undefined entries if necessary
      const validUsers = data.data.filter(user => user !== null && user !== undefined) as User[];
      return validUsers;
    }
    
    if (data.success && data.data && !Array.isArray(data.data)) {
      // Handle cases where data.data is not an array but success is true
      // This could be an single object if the API endpoint changes for specific queries
      // For a general get Users, it should be an array.
      console.warn('Users data received but not in expected array format:', data.data);
      // If a single user object is returned in 'data' for some reason:
      // return [data.data as User]; 
      return []; // Or handle as an error, depending on API contract
    }

    // Handle cases where success is false or data is not as expected
    console.error('Failed to fetch users or data in unexpected format:', data.message || 'Unknown error');
    return []; 
  } catch (error) {
    console.error('Error fetching users:', error);
    return []; 
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await apiRequest(`/users/${id}`, 'DELETE');
    return response.success;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// --- Orders & Transactions Interfaces ---
export interface Order {
  id: string;
  cart_id: string;
  owner_id?: string;
  user_name?: string;
  email?: string;
  total_amount: number;
  payment_method: string;
  delivery_address: string;
  delivery_status: string;
  status?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  order_id: string;
  payment_status: string;
  payment_provider: string;
  created_at: string;
}

// --- Orders API Functions ---
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await apiRequest('/orders');
    if (response.success && Array.isArray(response.data)) {
      return response.data.map((order: Partial<Order>): Order => ({
        id: order.id || '',
        cart_id: order.cart_id || '',
        owner_id: order.owner_id,
        user_name: order.user_name || '',
        email: order.email || '',
        total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : (order.total_amount || 0),
        payment_method: order.payment_method || '',
        delivery_address: order.delivery_address || '',
        delivery_status: (order.delivery_status || order.status || '') as string,
        status: order.status,
        created_at: order.created_at || new Date().toISOString(),
      }));
    }
    throw new Error(response.message || 'Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// --- Transactions API Functions ---
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await apiRequest('/transactions');
    if (response.success && Array.isArray(response.data)) {
      return response.data.map((tx: Partial<Transaction>): Transaction => ({
        id: tx.id || '',
        order_id: tx.order_id || '',
        payment_status: tx.payment_status || '',
        payment_provider: tx.payment_provider || '',
        created_at: tx.created_at || new Date().toISOString(),
      }));
    }
    throw new Error(response.message || 'Failed to fetch transactions');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// --- Order details interface with cart items and other relevant information
interface OrderDetails extends Order {
  cart_items?: Array<{
    id: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    price?: number;
    added_by: string;
    created_at: string;
    product?: Product;
  }>;
  user?: User;
  shipping_address?: string;
  billing_address?: string;
}

export const getOrderDetails = async (id: string): Promise<OrderDetails> => {
  try {
    const response = await apiRequest(`/orders/${id}`);
    if (response.success && response.data) {
      const orderData = response.data as Partial<OrderDetails>;
      return {
        id: orderData.id || id,
        cart_id: orderData.cart_id || '',
        delivery_address: orderData.delivery_address || '',
        delivery_status: orderData.delivery_status || 'pending',
        payment_method: orderData.payment_method || '',
        created_at: orderData.created_at || new Date().toISOString(),
        total_amount: typeof orderData.total_amount === 'string' 
          ? parseFloat(orderData.total_amount) 
          : (orderData.total_amount || 0),
        cart_items: orderData.cart_items || [],
        user: orderData.user,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address
      };
    }
    throw new Error(response.message || 'Failed to fetch order details');
  } catch (error) {
    console.error(`Error fetching order details ${id}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  try {
    const response = await apiRequest(`/orders/${id}/status`, 'PUT', { delivery_status: status });
    if (response.success && response.data) {
      const orderData = response.data as Partial<Order>;
      return {
        id: orderData.id || id,
        cart_id: orderData.cart_id || '',
        delivery_address: orderData.delivery_address || '',
        delivery_status: orderData.delivery_status || status,
        payment_method: orderData.payment_method || '',
        created_at: orderData.created_at || new Date().toISOString(),
        total_amount: typeof orderData.total_amount === 'string' 
          ? parseFloat(orderData.total_amount) 
          : (orderData.total_amount || 0)
      };
    }
    throw new Error(response.message || 'Failed to update order status');
  } catch (error) {
    console.error(`Error updating order status ${id}:`, error);
    throw error;
  }
};
