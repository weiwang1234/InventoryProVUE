<template>
  <el-container style="height: 100vh; display: flex; align-items: center; justify-content: center;">
    <el-card shadow="never" style="width: 400px; text-align: center;">
      <h2>登录</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.loginid" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" style="width: 100%;">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-container>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const form = reactive({
  loginid: '',
  password: '',
})

const handleLogin = async () => {
  try {
    // 发起 POST 请求到后端登录接口
    const response = await api.post('/users/login', form)

    // 假设后端返回用户名
    if (response.status === 200 && response.data && response.data.token) {
      // 登录成功，保存用户名到 localStorage
      localStorage.setItem('username', response.data.username)  // 保存后端返回的用户名
      localStorage.setItem('token', response.data.token)        // 保存 token

      // 跳转到首页
      router.push('/home')
    } else {
      // 登录失败，提示错误
      alert('用户名或密码错误')
    }
  } catch (error) {
    console.error("请求出错：", error)
    alert('请求失败，请稍后再试')
  }
}
</script>
