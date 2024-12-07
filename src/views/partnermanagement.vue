<template>
  <div class="partner-management-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/partner-management">合作方管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入合作方ID或合作方姓名" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增合作方按钮 -->
    <el-button type="primary" @click="openAddPartnerDialog">新增合作方</el-button>

    <!-- 合作方表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column prop="id" label="合作方ID" width="180" />
      <el-table-column prop="name" label="合作方姓名" width="180" />
      <el-table-column prop="phone" label="合作方电话" width="180" />
      <el-table-column prop="wechat" label="合作方微信号" width="180" />
      <el-table-column prop="address" label="合作方地址" width="200" />
      <el-table-column prop="type" label="合作方类型" width="180" />
      <el-table-column label="操作" width="200">
        <el-button type="danger" @click="confirmDeletePartner">删除</el-button>
      </el-table-column>
    </el-table>

    <!-- 合作方列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增合作方对话框 -->
    <el-dialog v-model="addPartnerDialogVisible" title="新增合作方" width="60%">
      <el-form :model="newPartner" ref="form" label-width="100px">
        <!-- 合作方ID -->
        <el-form-item label="合作方ID" :rules="[{ required: true, message: '请输入合作方ID', trigger: 'blur' }]">
          <el-input v-model="newPartner.id" />
        </el-form-item>

        <!-- 合作方姓名 -->
        <el-form-item label="合作方姓名" :rules="[{ required: true, message: '请输入合作方姓名', trigger: 'blur' }]">
          <el-input v-model="newPartner.name" />
        </el-form-item>

        <!-- 合作方电话 -->
        <el-form-item label="合作方电话" :rules="[{ required: true, message: '请输入合作方电话', trigger: 'blur' }]">
          <el-input v-model="newPartner.phone" />
        </el-form-item>

        <!-- 合作方微信号 -->
        <el-form-item label="合作方微信号" :rules="[{ required: true, message: '请输入合作方微信号', trigger: 'blur' }]">
          <el-input v-model="newPartner.wechat" />
        </el-form-item>

        <!-- 合作方地址 -->
        <el-form-item label="合作方地址" :rules="[{ required: true, message: '请输入合作方地址', trigger: 'blur' }]">
          <el-input v-model="newPartner.address" />
        </el-form-item>

        <!-- 合作方类型 -->
        <el-form-item label="合作方类型" :rules="[{ required: true, message: '请输入合作方类型', trigger: 'blur' }]">
          <el-select v-model="newPartner.type" placeholder="请选择合作方类型">
            <el-option label="进货方" value="supplier"></el-option>
            <el-option label="送货方" value="distributor"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addPartnerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddPartner">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

interface Partner {
  id: string
  name: string
  phone: string
  wechat: string
  address: string
  type: string
}

const partners: Partner[] = [
  { id: '1', name: '合作方1', phone: '1234567890', wechat: 'wechat1', address: '地址11111111111111111111111', type: 'supplier' },
  { id: '2', name: '合作方2', phone: '0987654321', wechat: 'wechat2', address: '地址2', type: 'distributor' },
  { id: '3', name: '合作方3', phone: '1122334455', wechat: 'wechat3', address: '地址3', type: 'other' },
  { id: '4', name: '合作方4', phone: '2233445566', wechat: 'wechat4', address: '地址4', type: 'supplier' },
  { id: '5', name: '合作方5', phone: '3344556677', wechat: 'wechat5', address: '地址5', type: 'distributor' },
]

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const addPartnerDialogVisible = ref(false)
const newPartner = ref<Partner>({
  id: '',
  name: '',
  phone: '',
  wechat: '',
  address: '',
  type: 'supplier'
})

const form = ref()

defineExpose({ form })

const filteredData = computed(() => {
  if (!searchQuery.value) {
    return partners
  }
  return partners.filter(item =>
    item.id.includes(searchQuery.value) || item.name.includes(searchQuery.value)
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

const openAddPartnerDialog = () => {
  addPartnerDialogVisible.value = true
}

const handleAddPartner = () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  // 这里可以处理合作方保存逻辑，比如将 newPartner 发送到后端
  partners.push({ ...newPartner.value })

  addPartnerDialogVisible.value = false
  newPartner.value = { id: '', name: '', phone: '', wechat: '', address: '', type: 'supplier' } // 清空合作方数据
}

const handleSearch = () => {
  currentPage.value = 1
}

// 删除合作方时确认
const confirmDeletePartner = () => {
  if (window.confirm('确定要删除这个合作方吗？')) {
    // 执行删除操作
    console.log('合作方已删除')
  }
}
</script>

<style scoped>
.partner-management-page {
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
