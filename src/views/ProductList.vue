<template>
  <div class="orders-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/product-list">订单列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入订单编号或客户编号" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 订单表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column prop="name" label="订单编号" width="180" />
      <el-table-column prop="customer" label="客户编号" width="180" />
      <el-table-column prop="price" label="总金额" width="100" />
      <el-table-column label="操作" width="180">
        <!-- 点击查看订单详情 -->
        <el-button plain @click="dialogTableVisible = true">查看详情</el-button>


      </el-table-column>
    </el-table>

    <!-- 固定在表格下方的分页组件 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 订单详情对话框 -->
    <el-dialog v-model="dialogTableVisible" title="订单详情" width="50%">
      <el-table :data="orderDetailData" style="width: 100%">
        <el-table-column prop="productId" label="产品ID" width="180" />
        <el-table-column prop="productName" label="产品名称" width="180" />
        <el-table-column prop="productPrice" label="产品价格" width="100" />
        <el-table-column prop="quantity" label="购买数量" width="100" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

// 定义订单详情的类型
interface OrderDetail {
  productId: string
  productName: string
  productPrice: string
  quantity: string
}

const products = [
  { name: '1', customer: '1', price: '100' },
  { name: '2', customer: '2', price: '100' },
  { name: 'ww', customer: '1', price: '100' },
  { name: '2', customer: 'dd', price: '100' },
  { name: '1', customer: '1', price: '100' },
  { name: '2', customer: '2', price: '100' },
  // 更多订单数据...
]

const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示的数量
const searchQuery = ref('') // 搜索关键词
const dialogTableVisible = ref(false)
const dialogVisible = ref(false) // 控制对话框显示隐藏
const orderDetailData = [
  { productId: '101', productName: '产品A', productPrice: '50', quantity: '2' },
  { productId: '102', productName: '产品B', productPrice: '60', quantity: '1' },] // 显式定义类型

// 根据搜索条件过滤数据
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return products
  }
  return products.filter(item =>
    item.name.includes(searchQuery.value) || item.customer.includes(searchQuery.value)
  )
})

// 当前页的数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理搜索输入
const handleSearch = () => {
  currentPage.value = 1 // 搜索时，跳转到第一页
}


</script>

<style scoped>
.orders-page {
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
  margin-bottom: 10px;
  /* Space between table and pagination */
}

.pagination {
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
</style>
