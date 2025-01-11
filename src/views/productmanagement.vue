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
        <el-input v-model="searchQuery" placeholder="请输入产品名称或编号" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增产品按钮 -->
    <el-button type="primary" @click="openAddProductDialog">新增产品</el-button>

    <!-- 产品表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showProductId" prop="productid" label="产品ID" />
      <el-table-column prop="productname" label="产品名称" width="180" />
      <el-table-column label="产品状态" width="180">
        <template v-slot="scope">
          <span>{{ scope.row.productstatus === '1' ? '有效' : '失效' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button type="danger" @click="confirmDeleteProduct(scope.row.productid)">失效</el-button>
          <el-button type="success" @click="confirmtakeeffectPartner(scope.row.productid)">生效</el-button>

        </template>
      </el-table-column>
    </el-table>

    <!-- 产品列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增产品对话框 -->
    <el-dialog v-model="addProductDialogVisible" title="新增产品" width="60%" :modal="true" :lock-scroll="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="newProduct" ref="form" label-width="100px">
        <!-- 产品名称 -->
        <el-form-item label="产品名称" :rules="[{ required: true, message: '请输入产品名称', trigger: 'blur' }]">
          <el-input v-model="newProduct.productname" />
        </el-form-item>
        <!-- 隐藏状态字段 -->
        <el-input v-model="newProduct.productstatus" type="hidden" />
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addProductDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddProduct">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'; // 使用 Element Plus 的消息提示组件

const showProductId = ref(false) // 控制是否显示产品ID列

interface Product {
  productid: string
  productname: string
  productstatus: number // 添加状态字段
}

const products = ref<Product[]>([]) // 使用 ref 使 products 绑定到响应式数据

const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示条数
const searchQuery = ref('') // 搜索查询内容
const addProductDialogVisible = ref(false) // 控制新增产品对话框显示
const newProduct = ref<Product>({
  productid: '',
  productname: '',
  productstatus: 1 // 默认为1，表示启用
})

const form = ref()

defineExpose({ form })

// 获取产品数据
const getProducts = async () => {
  try {
    const response = await api.post('/products/getAll', { searchQuery: searchQuery.value }) // 获取所有产品
    products.value = response.data // 更新响应式数组，确保页面会重新渲染
  } catch (error) {
    console.error('获取产品数据失败:', error)
  }
}

// 计算过滤后的数据
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return products.value
  }
  return products.value.filter(item =>
    item.productname.includes(searchQuery.value) // 根据名称进行搜索
  )
})

// 计算当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 页面初始化时加载数据
onMounted(() => {
  getProducts()
})

// 处理分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getProducts() // 调用 API 重新加载数据
}

// 新增产品
const openAddProductDialog = () => {
  addProductDialogVisible.value = true
}

// 处理新增产品的提交
const handleAddProduct = async () => {
  const isValid = await form.value?.validate()
  if (!isValid) return


  const isExist = products.value.some(partner => partner.productname === newProduct.value.productname);
  if (isExist) {
    // 如果存在相同名称的合作方，提示用户
    ElMessage.error('产品存在');
    return; // 退出，不进行新增操作
  }

  try {
    const response = await api.post('/products/add', newProduct.value) // 调用新增产品接口
    products.value.push(response.data) // 将新数据添加到列表
    addProductDialogVisible.value = false
    newProduct.value = { productid: '', productname: '', productstatus: 1 } // 清空产品数据，状态默认1
  } catch (error) {
    console.error('新增产品失败:', error)
  }
}

// 删除产品时确认
const confirmDeleteProduct = async (productid: string) => {
  if (window.confirm('确定要删除这个产品吗？')) {
    const Product = {
      productid: parseInt(productid, 10),
      productname: '',  // 如果不需要可以留空或提供默认值
      productstatus: '', // 默认状态，或者留空
    }

    try {
      console.log(productid)
      await api.post('/products/delete', Product) // 传递完整的产品对象
      // products.value = products.value.filter(product => product.productid !== productid) // 更新前端数据
      getProducts()
      console.log('产品已删除')
    } catch (error) {
    }
  }
}


const confirmtakeeffectPartner = async (productid: string) => {
  if (window.confirm('确定要生效这个合作方吗？')) {
    const Product = {
      productid: parseInt(productid, 10),
      productname: '',  // 如果不需要可以留空或提供默认值
      productstatus: '', // 默认状态，或者留空
    }
    try {
      await api.post('/products/takeeffectPartner', Product) // 调用删除接口
      // partners.value = partners.value.filter(partner => partner.partnerid !== partnerid) // 更新前端数据
      getProducts()
      console.log('合作方已删除')
    } catch (error) {
      console.error('删除合作方失败:', error)
    }
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

.el-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>
