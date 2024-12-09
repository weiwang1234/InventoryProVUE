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
        <el-input v-model="searchQuery" placeholder="请输入合作方姓名或电话" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增合作方按钮 -->
    <el-button type="primary" @click="openAddPartnerDialog">新增合作方</el-button>

    <!-- 合作方表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showPartnerId" prop="partnerid" label="合作方ID" />
      <el-table-column prop="partnername" label="合作方名称" width="180" />
      <el-table-column prop="partnerphone" label="合作方电话" width="180" />
      <el-table-column prop="partnerstatus" label="合作方状态" width="180" />
      <el-table-column prop="partneraddress" label="合作方地址" width="200" />
      <el-table-column prop="partnertype" label="合作方类型" width="180" />
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button type="danger" @click="confirmDeletePartner(scope.row.partnerid)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 合作方列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增合作方对话框 -->
    <el-dialog v-model="addPartnerDialogVisible" title="新增合作方" width="60%">
      <el-form :model="newPartner" ref="form" label-width="100px">
        <!-- 合作方名称 -->
        <el-form-item label="合作方名称" :rules="[{ required: true, message: '请输入合作方名称', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnername" />
        </el-form-item>

        <!-- 合作方电话 -->
        <el-form-item label="合作方电话" :rules="[{ required: true, message: '请输入合作方电话', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnerphone" />
        </el-form-item>

        <!-- 合作方状态 -->
        <el-form-item v-if="showPartnerId" label="合作方状态"
          :rules="[{ required: true, message: '请输入合作方状态', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnerstatus" :value="1" />
        </el-form-item>

        <!-- 合作方地址 -->
        <el-form-item label="合作方地址" :rules="[{ required: true, message: '请输入合作方地址', trigger: 'blur' }]">
          <el-input v-model="newPartner.partneraddress" />
        </el-form-item>

        <!-- 合作方类型 -->
        <el-form-item label="合作方类型" :rules="[{ required: true, message: '请输入合作方类型', trigger: 'blur' }]">
          <el-select v-model="newPartner.partnertype" placeholder="请选择合作方类型">
            <el-option label="进货方" value="1"></el-option>
            <el-option label="送货方" value="2"></el-option>
          </el-select>
        </el-form-item>a
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addPartnerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddPartner">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const showPartnerId = ref(false) // 控制是否显示合作方ID列

interface Partner {
  partnerid: string
  partnername: string
  partnerphone: string
  partnerstatus: string
  partneraddress: string
  partnertype: string
}

const partners = ref<Partner[]>([]) // 使用 ref 使 partners 绑定到响应式数据

const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示条数
const searchQuery = ref('') // 搜索查询内容
const addPartnerDialogVisible = ref(false) // 控制新增合作方对话框显示
const newPartner = ref<Partner>({
  partnerid: '',
  partnername: '',
  partnerphone: '',
  partnerstatus: '1',
  partneraddress: '',
  partnertype: ''
})

const form = ref()

defineExpose({ form })

// 获取合作方数据
const getPartners = async () => {
  try {
    const response = await api.post('/partners/getAll', { searchQuery: searchQuery.value }) // 获取所有合作方
    partners.value = response.data // 更新响应式数组，确保页面会重新渲染
  } catch (error) {
    console.error('获取合作方数据失败:', error)
  }
}

// 计算过滤后的数据
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return partners.value
  }
  return partners.value.filter(item =>
    item.partnername.includes(searchQuery.value) || item.partnerphone.includes(searchQuery.value) // 根据姓名或电话号码进行搜索
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
  getPartners()
})

// 处理分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getPartners() // 调用 API 重新加载数据
}

// 新增合作方
const openAddPartnerDialog = () => {
  addPartnerDialogVisible.value = true
}

// 处理新增合作方的提交
const handleAddPartner = async () => {
  const isValid = await form.value?.validate()
  if (!isValid) return

  try {
    console.log(newPartner.value);
    const response = await api.post('/partners/add', newPartner.value) // 调用新增合作方接口
    partners.value.push(response.data) // 将新数据添加到列表
    addPartnerDialogVisible.value = false
    newPartner.value = { partnerid: '', partnername: '', partnerphone: '', partnerstatus: '', partneraddress: '', partnertype: '' } // 清空合作方数据
  } catch (error) {
    console.error('新增合作方失败:', error)
  }
}

// 删除合作方时确认
const confirmDeletePartner = async (partnerid: string) => {
  if (window.confirm('确定要删除这个合作方吗？')) {
    try {
      const partner = { partnerid: parseInt(partnerid, 10) }
      api.post('/partners/delete', partner) // 调用删除接口
      partners.value = partners.value.filter(partner => partner.partnerid !== partnerid) // 更新前端数据
      console.log('合作方已删除')
    } catch (error) {
      console.error('删除合作方失败:', error)
    }
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

.el-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}
</style>
