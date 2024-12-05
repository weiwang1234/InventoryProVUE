<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header style="background-color: #409EFF; color: white; padding: 0;">
      <div style="line-height: 60px; padding-left: 20px; font-size: 20px;">欢迎来到后台管理系统</div>
    </el-header>

    <el-container>
      <!-- Sidebar -->
      <el-aside width="200px" style="background-color: #f4f4f4;">
        <el-menu :default-active="activeMenu" background-color="#ffffff" text-color="#333" active-text-color="#409EFF">
          <el-menu-item index="home" @click="navigateTo('/home')">首页</el-menu-item>
          <el-menu-item index="user-list" @click="navigateTo('/home/product-list')">用户列表</el-menu-item>
          <el-menu-item index="product-list" @click="navigateTo('/home/product-list')">商品列表</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main Content -->
      <el-main style="padding: 20px; background-color: #f5f7fa;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeMenu = ref('home')

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.el-header {
  background-color: #409EFF;
  color: white;
  text-align: center;
  padding: 10px;
}

.el-aside {
  background-color: #f4f4f4;
}

.el-menu {
  background-color: #ffffff;
}

.el-menu-item {
  padding-left: 20px;
}

.el-main {
  background-color: #f5f7fa;
}
</style>
