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

    <!-- 新增订单按钮 -->
    <el-button type="primary" @click="openAddOrderDialog">新增订单</el-button>

    <!-- 订单表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column prop="name" label="订单编号" width="180" />
      <el-table-column prop="category" label="客户编号" width="180" />
      <el-table-column prop="price" label="总金额" width="100" />
      <el-table-column prop="111" label="总金额" width="100" />

      <el-table-column label="操作" width="200">
        <el-button plain @click="dialogTableVisible = true">查看详情</el-button>
        <el-button type="danger" @click="confirmDeleteOrder">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 订单列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 订单详情对话框 -->
    <el-dialog v-model="dialogTableVisible" title="订单详情" width="60%">
      <el-table :data="dialogCurrentPageData" style="width: 100%">
        <el-table-column prop="productId" label="产品ID" width="180" />
        <el-table-column prop="productName" label="产品名称" width="180" />
        <el-table-column prop="productPrice" label="产品价格" width="100" />
        <el-table-column prop="quantity" label="购买数量" width="100" />
      </el-table>

      <!-- 始终显示的订单详情分页 -->
      <el-pagination :current-page="dialogCurrentPage" :page-size="pageSize" :total="orderDetailData.length"
        @current-change="handleDialogPageChange" layout="total, prev, pager, next, jumper" background class="pagination-dialog" />

      <!-- 删除按钮放在这里 -->
      <div class="dialog-footer" style="margin-top: 20px; text-align: center;">
      </div>
    </el-dialog>

    <!-- 新增订单对话框 -->
    <el-dialog v-model="addOrderDialogVisible" title="新增订单" width="60%">
      <el-form :model="newOrder" ref="form" label-width="100px">
        <el-form-item label="订单编号" :rules="[{ required: true, message: '请输入订单编号', trigger: 'blur' }]">
          <el-input v-model="newOrder.name" />
        </el-form-item>
        <el-form-item label="客户编号" :rules="[{ required: true, message: '请输入客户编号', trigger: 'blur' }]">
          <el-input v-model="newOrder.customer" />
        </el-form-item>
        <el-form-item label="总金额" :rules="[{ required: true, message: '请输入总金额', trigger: 'blur' }]">
          <el-input v-model="newOrder.price" />
        </el-form-item>

        <!-- 增加产品按钮 -->
        <el-button type="success" @click="addProductRow">增加产品</el-button>

        <!-- 产品选择行 -->
        <div v-for="(productRow, index) in newOrder.selectedProducts" :key="index" class="product-row">
          <el-form-item label="选择产品">
            <el-select v-model="productRow.product" placeholder="请选择产品" @change="updateOrderTotal" filterable>
              <el-option v-for="product in products" :key="product.id" :value="product" :label="product.name" />
            </el-select>
          </el-form-item>

          <!-- 显示产品价格 -->
          <el-form-item label="产品价格">
            <el-input :value="productRow.product ? productRow.product.price : 0" disabled />
          </el-form-item>

          <el-form-item label="购买数量">
            <el-input v-model="productRow.quantity" type="number" placeholder="请输入数量" @input="updateOrderTotal" />
          </el-form-item>

          <!-- 删除按钮 -->
          <el-button type="danger" @click="removeProductRow(index)" class="delete-btn">删除</el-button>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddOrder">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineExpose } from 'vue'

interface Product {
  id: string
  name: string
  category: string
  price: number
}

interface ProductRow {
  product: Product | null
  quantity: number | null
}

interface Order {
  name: string
  customer: string
  price: string
  selectedProducts: ProductRow[]
}

const products: Product[] = [
  { id: '1', name: '产品1', category: 'A', price: 100 },
  { id: '2', name: '产品2', category: 'A', price: 150 },
  { id: '3', name: '产品3', category: 'B', price: 200 },
  { id: '4', name: '产品4', category: 'B', price: 250 },
  { id: '5', name: '产品5', category: 'C', price: 300 },
]

const orderDetailData = [
  { productId: '101', productName: '产品A', productPrice: '50', quantity: '2' },
  { productId: '102', productName: '产品B', productPrice: '60', quantity: '1' },
  { productId: '103', productName: '产品C', productPrice: '70', quantity: '3' },
]

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dialogTableVisible = ref(false)
const dialogCurrentPage = ref(1)
const addOrderDialogVisible = ref(false)
const newOrder = ref<Order>({
  name: '',
  customer: '',
  price: '',
  selectedProducts: [{ product: null, quantity: null }],
})

const form = ref()

defineExpose({ form })

const filteredData = computed(() => {
  if (!searchQuery.value) {
    return products
  }
  return products.filter(item =>
    item.name.includes(searchQuery.value) || item.category.includes(searchQuery.value)
  )
})

const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const openAddOrderDialog = () => {
  addOrderDialogVisible.value = true
}

const handleAddOrder = () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  newOrder.value.selectedProducts.forEach((productRow) => {
    if (productRow.product) {
      // 这里可以处理订单保存逻辑，比如将 productRow 发送到后端
    }
  })

  addOrderDialogVisible.value = false
  newOrder.value = { name: '', customer: '', price: '', selectedProducts: [{ product: null, quantity: null }] } // 清空订单数据
}

const dialogCurrentPageData = computed(() => {
  const start = (dialogCurrentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return orderDetailData.slice(start, end)
})

const handleDialogPageChange = (page: number) => {
  dialogCurrentPage.value = page
}

const handleSearch = () => {
  currentPage.value = 1
}

const addProductRow = () => {
  newOrder.value.selectedProducts.push({ product: null, quantity: null })
}

const removeProductRow = (index: number) => {
  newOrder.value.selectedProducts.splice(index, 1)
  updateOrderTotal()
}

const updateOrderTotal = () => {
  const total = newOrder.value.selectedProducts.reduce((sum, productRow) => {
    if (productRow.product && productRow.quantity) {
      return sum + (productRow.product.price * productRow.quantity)
    }
    return sum
  }, 0)
  newOrder.value.price = total.toFixed(2)
}

// 删除订单时确认
const confirmDeleteOrder = () => {
  if (window.confirm('确定要删除这个订单吗？')) {
    // 执行删除操作
  }
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

.product-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.product-row .el-form-item {
  flex: 1;
  margin-right: 10px;
}

.product-row .el-button {
  margin-left: 10px;
}

.delete-btn {
  margin-left: 10px;
  align-self: center;
  margin-top: -15px;
}

.el-dialog {
  width: 60%;
}

.dialog-footer {
  text-align: right;
}
</style>
