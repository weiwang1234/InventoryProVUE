<template>
  <el-container style="height: 100vh;">
    <!-- Header -->
    <el-header
      style="background-color: #409EFF; color: white; padding: 0; display: flex; justify-content: space-between; align-items: center;">
      <div style="line-height: 60px; padding-left: 20px; font-size: 20px;">欢迎来到后台管理系统</div>

      <!-- 右侧欢迎和退出按钮 -->
      <div style="display: flex; align-items: center; padding-right: 20px;">
        <span style="color: white; margin-right: 20px; font-size: 14px;">欢迎, {{ username || '用户名' }}</span>
        <el-dropdown>
          <el-button type="primary" style="color: white; position: relative;" @click="handleLogout">
            退出
            <el-icon style="color: white;">
              <SwitchButton />
            </el-icon>
          </el-button>
        </el-dropdown>
      </div>
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
          <el-sub-menu index="1">
            <template #title>
              <el-icon>
                <IconMenu />
              </el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="1-1" @click="navigateTo('/home/Orders-list')">送货订单管理</el-menu-item>
            <el-menu-item index="1-2" @click="navigateTo('/home/Orders-query')">送货订单汇总查询</el-menu-item>
            <el-menu-item index="1-3" @click="navigateTo('/home/PurchaseOrders-list')">进货订单管理</el-menu-item>
            <el-menu-item index="1-4" @click="navigateTo('/home/PurchaseSummary-Query')">进货订单汇总查询</el-menu-item>
          </el-sub-menu>

          <!-- 月底盘账一级菜单 -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon>
                <Document />
              </el-icon>
              <span>月底盘账</span>
            </template>
            <el-menu-item index="2-1" @click="navigateTo('/home/inventory-query')">当前库存查询</el-menu-item>
          </el-sub-menu>

          <!-- 产品管理菜单 -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon>
                <DishDot />
              </el-icon>
              <span>产品管理</span>
            </template>
            <el-menu-item index="3-1" @click="navigateTo('/home/product-management')">产品列表</el-menu-item>
            <el-menu-item index="3-2" @click="navigateTo('/home/ProductProcessing-Action')">产品加工</el-menu-item>
            <el-menu-item index="3-3" @click="navigateTo('/home/product-processing')">产品加工设置</el-menu-item>
            <!-- 新增产品加工菜单项 -->
          </el-sub-menu>

          <!-- 合作方管理菜单 -->
          <el-menu-item index="4" @click="navigateTo('/home/partner-management')">
            <el-icon>
              <Expand />
            </el-icon>
            <span>合作方管理</span>
          </el-menu-item>

          <!-- 用户列表菜单 -->
          <el-sub-menu index="5">
            <template #title>
              <el-icon>
                <Expand />
              </el-icon>
              <span>用户列表</span>
            </template>
            <el-menu-item index="5-1" @click="navigateTo('/home/product-list')">item one</el-menu-item>
            <el-menu-item index="5-2" @click="navigateTo('/home/1-2')">item two</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="6" @click="navigateTo('/home/2')">
            <el-icon>
              <IconMenu />
            </el-icon>
            <span>Navigator Two</span>
          </el-menu-item>
          <el-menu-item index="7" disabled>
            <el-icon>
              <Document />
            </el-icon>
            <span>Navigator Three</span>
          </el-menu-item>
          <el-menu-item index="8" @click="navigateTo('/home/User-list')">
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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Menu as IconMenu, Setting } from '@element-plus/icons-vue'
import { Discount } from '@element-plus/icons-vue';
import { Expand } from '@element-plus/icons-vue';
import { DishDot } from '@element-plus/icons-vue';
import { SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = ref('home') // 默认激活首页菜单
const username = ref('')

// 监听页面加载时，获取保存的用户名
onMounted(() => {
  username.value = localStorage.getItem('username') || ''  // 从localStorage获取用户名
})

// 监听路由变化，确保每次跳转时，菜单正确选中
watch(() => router.currentRoute.value.path, (newPath) => {
  if (newPath === '/home') {
    activeMenu.value = 'home'
  } else if (newPath === '/home/product-list') {
    activeMenu.value = '3'
  } else if (newPath === '/home/inventory-query') {
    activeMenu.value = '2'
  } else if (newPath === '/home/product-management') {
    activeMenu.value = '3'
  } else if (newPath === '/home/partner-management') {
    activeMenu.value = '4'
  } else if (newPath === '/home/product-processing') {
    activeMenu.value = '3-2'
  } else if (newPath === '/home/product-processing-new') {
    activeMenu.value = '3-3'
  }
})

// 路由跳转
const navigateTo = (path: string) => {
  router.push(path)
}

// 退出操作
const handleLogout = () => {
  console.log("点击退出按钮");

  // 清除 localStorage 中的用户名
  localStorage.removeItem('username')
  localStorage.removeItem('token')

  // 跳转到登录页面
  router.push('/')
}

// 处理菜单展开事件
const handleOpen = (key: string, keyPath: string[]) => {
  console.log('Menu Opened:', key, keyPath)
}

// 处理菜单收起事件
const handleClose = (key: string, keyPath: string[]) => {
  console.log('Menu Closed:', key, keyPath)
}
</script>

<style scoped>
.el-header {
  background-color: #409EFF;
  color: white;
  text-align: center;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
