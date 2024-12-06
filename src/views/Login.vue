<template>
  <el-container style="height: 100vh; display: flex; align-items: center; justify-content: center;">
    <el-card shadow="never" style="width: 400px; text-align: center;">
      <h2>登录</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
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

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const handleLogin = () => {
  if (form.username === 'admin' && form.password === 'admin') {
    // 登录成功，跳转到首页
    router.push('/home') // 跳转到 Home 页面
  } else {
    // 登录失败，提示错误
    alert('用户名或密码错误')
  }
}
</script>