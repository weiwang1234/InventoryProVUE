// src/api.ts
import axios from 'axios'

// 设置基础 URL
const API_BASE_URL = 'http://localhost:8082'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 可设置请求超时
})

export default api
