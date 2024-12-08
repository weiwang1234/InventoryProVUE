<template>
  <div class="user-list-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入用户ID或用户名" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增用户按钮 -->
    <el-button type="primary" @click="openAddUserDialog">新增用户</el-button>

    <!-- 用户表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column prop="userid" label="用户ID" width="180" />
      <el-table-column prop="loginid" label="登录ID" width="180" />
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="password" label="密码" width="180" />
      <el-table-column prop="status" label="状态" width="180" />
      <el-table-column label="操作" width="200">
        <el-button type="danger" @click="confirmDeleteUser">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 用户列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="totalUsers"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增用户对话框 -->
    <el-dialog v-model="addUserDialogVisible" title="新增用户" width="60%">
      <el-form :model="newUser" ref="form" label-width="100px">
        <!-- 用户ID -->
        <el-form-item label="用户ID" :rules="[{ required: true, message: '请输入用户ID', trigger: 'blur' }]">
          <el-input v-model="newUser.userid" />
        </el-form-item>

        <!-- 登录ID -->
        <el-form-item label="登录ID" :rules="[{ required: true, message: '请输入登录ID', trigger: 'blur' }]">
          <el-input v-model="newUser.loginid" />
        </el-form-item>

        <!-- 用户名 -->
        <el-form-item label="用户名" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input v-model="newUser.username" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" :rules="[{ required: true, message: '请输入密码', trigger: 'blur' }]">
          <el-input v-model="newUser.password" type="password" />
        </el-form-item>

        <!-- 用户状态 -->
        <el-form-item label="状态" :rules="[{ required: true, message: '请选择用户状态', trigger: 'blur' }]">
          <el-select v-model="newUser.status" placeholder="请选择用户状态">
            <el-option label="启用" value="enabled"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddUser">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

interface User {
  userid: string
  loginid: string
  username: string
  password: string
  status: string
}

const users = ref<User[]>([])  // 使用 ref 包装用户数据为响应式数组
const totalUsers = ref(0)  // 用户总数
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const addUserDialogVisible = ref(false)
const newUser = ref<User>({
  userid: '',
  loginid: '',
  username: '',
  password: '',
  status: 'enabled',
})

const form = ref()

// 获取用户数据
const fetchUsers = async (page: number = 1, pageSize: number = 10, searchQuery: string = '') => {
  try {
    const response = await api.post('/users/getAll', { page, pageSize, searchQuery })  // 获取所有用户
    console.log('API 返回数据:', response.data);  // 打印数据

    users.value = response.data  // 更新用户数据
    totalUsers.value = response.data.length  // 假设后台返回的数据中有 totalUsers 字段
  } catch (error) {
    console.error('获取用户数据失败', error)
  }
}

// 页面加载时获取用户数据
onMounted(() => {
  fetchUsers(currentPage.value, pageSize.value, searchQuery.value)
})

// 计算分页后的用户数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return users.value.slice(start, end)
})

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchUsers(currentPage.value, pageSize.value, searchQuery.value)
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers(currentPage.value, pageSize.value, searchQuery.value)
}

// 打开新增用户对话框
const openAddUserDialog = () => {
  addUserDialogVisible.value = true
}

// 处理新增用户
const handleAddUser = () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  // 发送新增用户请求
  api.post('/users', newUser.value)
    .then(() => {
      addUserDialogVisible.value = false
      fetchUsers(currentPage.value, pageSize.value, searchQuery.value)  // 重新加载数据
    })
    .catch(error => {
      console.error('新增用户失败', error)
    })

  newUser.value = { userid: '', loginid: '', username: '', password: '', status: 'enabled' }  // 清空用户数据
}

// 删除用户时确认
const confirmDeleteUser = (userid: string) => {
  if (window.confirm('确定要删除这个用户吗？')) {
    api.delete(`/users/${userid}`)
      .then(() => {
        fetchUsers(currentPage.value, pageSize.value, searchQuery.value)  // 重新加载数据
      })
      .catch(error => {
        console.error('删除用户失败', error)
      })
  }
}
</script>

<style scoped>
.user-list-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f9f9f9;
}

.el-breadcrumb {
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}

.pagination-dialog {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  padding: 10px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.el-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>
