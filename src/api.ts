// src/api.ts
import axios from 'axios';

// 创建一个 Axios 实例
const api = axios.create({
  baseURL: 'http://localhost:8082', // 你可以设置你的后端 API 地址
  timeout: 10000, // 设置请求超时时间
});

// 添加请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 每个请求都会自动带上 Authorization 头
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // 如果 token 验证失败，跳转到登录页面并清除 localStorage 中的数据
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/'; // 或者你可以使用 router.push('/') 进行跳转
    }
    return Promise.reject(error);
  }
);

export default api;
