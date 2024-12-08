<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header style="background-color: #409EFF; color: white; padding: 0;">
      <div style="line-height: 60px; padding-left: 20px; font-size: 20px;">欢迎来到后台管理系统</div>
    </el-header>

    <el-container>
      <!-- Sidebar -->
      <el-aside width="200px" style="background-color: #f4f4f4;">
        <el-menu :default-active="activeMenu" background-color="#ffffff" text-color="#333" active-text-color="#409EFF"
          class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
          <!-- 首页菜单 -->
          <el-menu-item index="home" @click="navigateTo('/home')">
            <el-icon>
              <Discount />
            </el-icon>
            <span>首页</span>
          </el-menu-item>

          <!-- 订单管理菜单 -->
          <el-menu-item index="1" @click="navigateTo('/home/Orders-list')">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>订单管理</span>
          </el-menu-item>

          <!-- 产品管理菜单 -->
          <el-menu-item index="2" @click="navigateTo('/home/product-management')">
            <el-icon>
              <DishDot />
            </el-icon>
            <span>产品管理</span>
          </el-menu-item>

          <!-- 合作方管理菜单 -->
          <el-menu-item index="3" @click="navigateTo('/home/partner-management')">
            <el-icon>
              <Expand />
            </el-icon>
            <span>合作方管理</span>
          </el-menu-item>

          <!-- 用户列表菜单 -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon>
                <Expand />
              </el-icon>
              <span>用户列表</span>
            </template>
            <el-menu-item index="4-1" @click="navigateTo('/home/product-list')">item one</el-menu-item>
            <el-menu-item index="4-2" @click="navigateTo('/home/1-2')">item two</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="5" @click="navigateTo('/home/2')">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>Navigator Two</span>
          </el-menu-item>
          <el-menu-item index="6" disabled>
            <el-icon>
              <Document />
            </el-icon>
            <span>Navigator Three</span>
          </el-menu-item>
          <el-menu-item index="7" @click="navigateTo('/home/User-list')">
            <el-icon>
              <Setting />
            </el-icon>
            <span>用户管理</span>
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Menu as IconMenu, Setting } from '@element-plus/icons-vue'
import { Discount } from '@element-plus/icons-vue';
import { Expand } from '@element-plus/icons-vue';
import { DishDot } from '@element-plus/icons-vue';

const router = useRouter()
const activeMenu = ref('home') // 默认激活首页菜单

// 监听路由变化，确保每次跳转时，菜单正确选中
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/home') {
    activeMenu.value = 'home'  // 如果路由是 /home，选中首页菜单
  } else if (newPath === '/home/product-list') {
    activeMenu.value = '1'  // 订单管理菜单
  } else if (newPath === '/home/product-management') {
    activeMenu.value = '2'  // 产品管理菜单
  } else if (newPath === '/home/partner-management') {
    activeMenu.value = '3'  // 合作方管理菜单
  } else if (newPath === '/home/member-user') {
    activeMenu.value = '4'  // 用户列表菜单
  }
})

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
