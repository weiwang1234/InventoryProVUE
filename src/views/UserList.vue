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
      <!-- <el-table-column prop="password" label="密码" width="180" /> -->
      <el-table-column prop="status" label="状态" width="180" :formatter="statusFormatter" />
      <el-table-column label="操作" width="200">

        <template v-slot="scope">
          <el-button type="danger" @click="confirmDeleteUser(scope.row.userid)">删除</el-button>
        </template>

      </el-table-column>
    </el-table>

    <!-- 用户列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredUsers.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增用户对话框 -->
    <el-dialog v-model="addUserDialogVisible" title="新增用户" width="60%">
      <el-form :model="newUser" ref="form" label-width="100px">


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
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="2"></el-option>
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

const statusFormatter = (row: User) => {
  if (row.status === '1') {
    return '启用'
  } else if (row.status === '2') {
    return '禁用'
  }
  return '未知状态'  // 如果状态值不为 1 或 2，显示默认文字
}

const users = ref<User[]>([])  // 使用 ref 包装用户数据为响应式数组
const searchQuery = ref('')  // 搜索框查询条件
const currentPage = ref(1)  // 当前页码
const pageSize = ref(10)  // 每页显示的用户数
const addUserDialogVisible = ref(false)  // 新增用户对话框的显示状态
const newUser = ref<User>({
  userid: '',
  loginid: '',
  username: '',
  password: '',
  status: '',
})

const form = ref()

// 获取所有用户数据（去除分页请求）
const fetchUsers = async () => {
  try {
    const response = await api.post('/users/getAll', { searchQuery: searchQuery.value });  // 获取所有用户
    console.log('API 返回数据:', response.data);
    users.value = response.data;  // 更新用户数据
  } catch (error) {
    console.error('获取用户数据失败', error);
    alert('请求失败，请稍后再试');
  }
};


// 页面加载时获取用户数据
onMounted(() => {
  fetchUsers()
})

// 计算过滤后的用户数据
const filteredUsers = computed(() => {
  // 搜索过滤，确保字段转换为字符串
  return users.value.filter(user =>
    String(user.userid).includes(searchQuery.value) ||
    String(user.username).includes(searchQuery.value) ||
    String(user.loginid).includes(searchQuery.value)
  )
})

// 分页后的当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1  // 搜索时默认跳转到第一页
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
  api.post('/users/add', newUser.value)
    .then(() => {
      addUserDialogVisible.value = false
      fetchUsers()  // 重新加载数据
    })
    .catch(error => {
      console.error('新增用户失败', error)
    })

  newUser.value = { userid: '', loginid: '', username: '', password: '', status: '' }  // 清空用户数据
}

// 删除用户时确认
const confirmDeleteUser = (userid: string) => {
  if (window.confirm('确定要删除这个用户吗？')) {
    // 发送 POST 请求来删除用户
    const userInfo = { userid: parseInt(userid, 10) };
    console.log(userInfo)

    api.post('/users/delete', userInfo)
      .then(() => {
        fetchUsers()  // 重新加载数据
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
