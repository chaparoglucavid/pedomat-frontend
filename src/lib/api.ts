const BASE_URL = 'http://127.0.0.1:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const TOKEN_KEY = 'auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const request = async (path: string, method: HttpMethod = 'GET', body?: any) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type');
  const data = contentType && contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    if (res.status === 401 || res.status === 419) {
      setToken(null);
      try { window.dispatchEvent(new Event('auth:logout')); } catch {}
    }
    throw { status: res.status, data };
  }
  return data;
};

const login = async (email: string, password: string) => {
  const data = await request('/login', 'POST', { email, password });
  if (data && (data.token || data.access_token)) {
    setToken(data.token || data.access_token);
  }
  return data;
};

const logout = async () => {
  try {
    await request('/logout', 'POST');
  } finally {
    setToken(null);
  }
};

const register = (payload: any) => request('/register', 'POST', payload);
const updateProfile = (payload: any) => request('/update-profile', 'POST', payload);
const userTransactionHistory = () => request('/user-transaction-history', 'GET');
const topUpBalance = (amount: number) => request('/top-up-balance', 'POST', { amount });

const orders = () => request('/orders', 'GET');
const orderStore = (payload: any) => request('/orders/store', 'POST', payload);
const cancelOrder = (payload: any) => request('/cancel-order', 'POST', payload);

const equipments = () => request('/equipments', 'GET');
const equipmentDetails = (id: number | string) => request(`/equipment-details/${id}`, 'GET');
const equipmentUpdate = (id: number | string, payload: any) => request(`/equipments/${id}`, 'PUT', payload);

const brands = () => request('/brands', 'GET');
const brandShow = (id: number | string) => request(`/brands/${id}`, 'GET');
const brandStore = (payload: any) => request('/brands', 'POST', payload);
const brandUpdate = (id: number | string, payload: any) => request(`/brands/${id}`, 'PUT', payload);
const brandDelete = (id: number | string) => request(`/brands/${id}`, 'DELETE');

const pedCategories = () => request('/ped-categories', 'GET');
const pedCategoryShow = (id: number | string) => request(`/ped-categories/${id}`, 'GET');
const pedCategoryStore = (payload: any) => request('/ped-categories', 'POST', payload);
const pedCategoryUpdate = (id: number | string, payload: any) => request(`/ped-categories/${id}`, 'PUT', payload);
const pedCategoryDelete = (id: number | string) => request(`/ped-categories/${id}`, 'DELETE');

const forums = () => request('/forums', 'GET');
const forumShow = (id: number | string) => request(`/forums/${id}`, 'GET');
const forumStore = (payload: any) => request('/forums', 'POST', payload);
const forumUpdate = (id: number | string, payload: any) => request(`/forums/${id}`, 'PUT', payload);
const forumDelete = (id: number | string) => request(`/forums/${id}`, 'DELETE');
const forumComment = (id: number | string, payload: any) => request(`/forums/${id}/comments`, 'POST', payload);

const stories = () => request('/stories', 'GET');
const storyShow = (id: number | string) => request(`/stories/${id}`, 'GET');
const storyStore = (formData: FormData) => {
  const token = getToken();
  return fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }).then(res => res.json());
};
const storyUpdate = (id: number | string, formData: FormData) => {
  const token = getToken();
  // Laravel multipart/form-data doesn't work well with PUT, so we use POST with _method=PUT or just a POST route
  return fetch(`${BASE_URL}/stories/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  }).then(res => res.json());
};
const storyDelete = (id: number | string) => request(`/stories/${id}`, 'DELETE');

const transactionHistories = () => request('/transaction-histories', 'GET');
const transactionHistoryShow = (id: number | string) => request(`/transaction-histories/${id}`, 'GET');
const me = () => request('/user', 'GET');
const users = () => request('/users', 'GET');
const userShow = (id: number | string) => request(`/users/${id}`, 'GET');
const userUpdate = (id: number | string, payload: any) => request(`/users/${id}`, 'PUT', payload);
const userUpdateStatus = (id: number | string, status: string) => request(`/users/${id}/status`, 'PUT', { system_status: status });
const userTopUpBalance = (id: number | string, amount: number, paymentMethod: string = 'card') => request(`/users/${id}/top-up-balance`, 'POST', { amount, paymentMethod, user_id: id }); // Added based on requirement

export const api = {
  login,
  logout,
  register,
  updateProfile,
  userTransactionHistory,
  topUpBalance,
  orders,
  orderStore,
  cancelOrder,
  equipments,
  equipmentDetails,
  equipmentUpdate,
  brands,
  brandShow,
  brandStore,
  brandUpdate,
  brandDelete,
  pedCategories,
  pedCategoryShow,
  pedCategoryStore,
  pedCategoryUpdate,
  pedCategoryDelete,
  forums,
  forumShow,
  forumStore,
  forumUpdate,
  forumDelete,
  forumComment,
  stories,
  storyShow,
  storyStore,
  storyUpdate,
  storyDelete,
  transactionHistories,
  transactionHistoryShow,
  me,
  users,
  userShow,
  userUpdate,
  userUpdateStatus,
  userTopUpBalance,
  getToken,
  setToken,
};
