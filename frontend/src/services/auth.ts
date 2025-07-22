import axios from '@/utils/axios';

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const signup = async (data: { email: string; password: string }) => {
  try {
    const response = await axios.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    console.error('Signup error:', error.response?.data || error.message);
    throw error;
  }
};

export const checkEmail = async (email: string) => {
  try {
    const response = await axios.post("/auth/check-email", { email });
    return response.data;
  } catch (error: any) {
    console.error('Check email error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateOnboarding = async (data: Record<string, any>) => {
  try {
    const response = await axios.patch("/auth/onboarding", data);
    return response.data;
  } catch (error: any) {
    console.error('Update onboarding error:', error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error: any) {
    console.error('Get current user error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post("/auth/logout");
    return response.data;
  } catch (error: any) {
    console.error('Logout error:', error.response?.data || error.message);
    throw error;
  }
};

export const confirmEmail = async (token: string) => {
  try {
    const response = await axios.get(`/auth/confirm-email/${token}`);
    return response.data;
  } catch (error: any) {
    console.error('Confirm email error:', error.response?.data || error.message);
    throw error;
  }
};

