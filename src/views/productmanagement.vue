<template>
  <div class="product-management-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/product-management">产品管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入产品编号或产品名称" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增产品按钮 -->
    <el-button type="primary" @click="openAddProductDialog">新增产品</el-button>

    <!-- 产品表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column prop="id" label="产品编号" width="180" />
      <el-table-column prop="name" label="产品名称" width="180" />
      <el-table-column prop="category" label="产品厂家" width="180" />
      <el-table-column prop="price" label="产品价格" width="100" />
      <el-table-column label="操作" width="200">
        <el-button type="danger" @click="confirmDeleteProduct">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 产品列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增产品对话框 -->
    <el-dialog v-model="addProductDialogVisible" title="新增产品" width="60%">
      <el-form :model="newProduct" ref="form" label-width="100px">
        <el-form-item label="产品编号" :rules="[{ required: true, message: '请输入产品编号', trigger: 'blur' }]">
          <el-input v-model="newProduct.id" />
        </el-form-item>
        <el-form-item label="产品名称" :rules="[{ required: true, message: '请输入产品名称', trigger: 'blur' }]">
          <el-input v-model="newProduct.name" />
        </el-form-item>
        <el-form-item label="产品厂家" :rules="[{ required: true, message: '请输入产品类别', trigger: 'blur' }]">
          <el-input v-model="newProduct.category" />
        </el-form-item>
        <el-form-item label="产品价格" :rules="[{ required: true, message: '请输入产品价格', trigger: 'blur' }]">
          <el-input v-model="newProduct.price" />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addProductDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddProduct">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Product {
  id: string
  name: string
  category: string
  price: number
}

const products: Product[] = [
  { id: '1', name: '产品1', category: 'A', price: 100 },
  { id: '2', name: '产品2', category: 'B', price: 150 },
  { id: '3', name: '产品3', category: 'A', price: 200 },
  { id: '4', name: '产品4', category: 'C', price: 250 },
  { id: '5', name: '产品5', category: 'B', price: 300 },
]

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const addProductDialogVisible = ref(false)
const newProduct = ref<Product>({
  id: '',
  name: '',
  category: '',
  price: 0,
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

const openAddProductDialog = () => {
  addProductDialogVisible.value = true
}

const handleAddProduct = () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  // 这里可以处理产品保存逻辑，比如将 newProduct 发送到后端
  products.push({ ...newProduct.value })

  addProductDialogVisible.value = false
  newProduct.value = { id: '', name: '', category: '', price: 0 } // 清空产品数据
}






const handleSearch = () => {
  currentPage.value = 1
}

// 删除产品时确认
const confirmDeleteProduct = () => {
  if (window.confirm('确定要删除这个产品吗？')) {
    // 执行删除操作
    console.log('产品已删除')
  }
}
</script>

<style scoped>
.product-management-page {
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

.dialog-footer {
  text-align: right;
}
</style>
