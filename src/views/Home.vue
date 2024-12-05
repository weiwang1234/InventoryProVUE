<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header style="background-color: #409EFF; color: white; padding: 0;">
      <div style="line-height: 60px; padding-left: 20px; font-size: 20px;">欢迎来到后台管理系统</div>
    </el-header>

    <el-container>
      <!-- Sidebar -->
      <el-aside width="200px" style="background-color: #f4f4f4;">
        <el-menu :default-active="activeMenu" background-color="#ffffff" text-color="#333" active-text-color="#409EFF" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
          <!-- 首页菜单 -->
          <el-menu-item index="home" @click="navigateTo('/home')">
            <el-icon><location /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <!-- 用户列表菜单 -->
          <el-sub-menu index="1">
            <template #title>
              <el-icon><location /></el-icon>
              <span>用户列表</span>
            </template>
            <el-menu-item-group title="Group One">
              <el-menu-item index="1-1" @click="navigateTo('/home/product-list')">item one</el-menu-item>
              <el-menu-item index="1-2" @click="navigateTo('/home/1-2')">item two</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="Group Two">
              <el-menu-item index="1-3" @click="navigateTo('/home/1-3')">item three</el-menu-item>
            </el-menu-item-group>
            <el-sub-menu index="1-4">
              <template #title>item four</template>
              <el-menu-item index="1-4-1" @click="navigateTo('/home/1-4-1')">item one</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>

          <el-menu-item index="2" @click="navigateTo('/home/2')">
            <el-icon><icon-menu /></el-icon>
            <span>Navigator Two</span>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <el-icon><document /></el-icon>
            <span>Navigator Three</span>
          </el-menu-item>
          <el-menu-item index="4" @click="navigateTo('/home/4')">
            <el-icon><setting /></el-icon>
            <span>Navigator Four</span>
          </el-menu-item>
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
import { Document, Menu as IconMenu, Location, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = ref('home') // 默认激活首页菜单

const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const navigateTo = (path: string) => {
  router.push(path) // 执行路由跳转
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
