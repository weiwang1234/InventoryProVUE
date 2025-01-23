<template>
  <div class="partner-management-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/partner-management">客户管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入客户姓名名或电话" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 新增合作方按钮 -->
    <el-button type="primary" @click="openAddPartnerDialog">新增客户</el-button>

    <!-- 合作方表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showPartnerId" prop="partnerid" label="合作方ID" />
      <el-table-column prop="partnername" label="名称" width="180" />
      <el-table-column prop="partnerphone" label="电话" width="180" />
      <el-table-column prop="partneraddress" label="地址" width="200" />
      <el-table-column label="状态" width="180">
        <template v-slot="scope">
          <span>{{ scope.row.partnerstatus === '1' ? '有效' : '失效' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="partnertype" label="合作方类型" width="180">
        <template v-slot="scope">
          <span>{{ scope.row.partnertype === '1' ? '客户' : '进货厂家' }}</span>
        </template>
      </el-table-column> <el-table-column label="操作" width="250">
        <template v-slot="scope">
          <el-button type="danger" @click="confirmDeletePartner(scope.row.partnerid)">失效</el-button>
          <el-button type="success" @click="confirmtakeeffectPartner(scope.row.partnerid)">生效</el-button>
          <el-button type="primary" @click="editPartner(scope.row.partnerid)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 合作方列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增合作方对话框 -->
    <el-dialog v-model="addPartnerDialogVisible" title="新增合作方" width="60%" :modal="true" :lock-scroll="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="newPartner" ref="form" label-width="100px">
        <!-- 合作方名称 -->
        <el-form-item label="名称" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnername" style="width: 300px;" />
        </el-form-item>

        <!-- 合作方电话 -->
        <el-form-item label="电话" :rules="[{ required: true, message: '请输入方电话', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnerphone" style="width: 300px;" />
        </el-form-item>

        <!-- 合作方状态 -->
        <el-form-item v-if="showPartnerId" label="状态" :rules="[{ required: true, message: '请输入状态', trigger: 'blur' }]">
          <el-input v-model="newPartner.partnerstatus" :value="1" style="width: 300px;" />
        </el-form-item>

        <!-- 合作方地址 -->
        <el-form-item label="地址" :rules="[{ required: true, message: '请输入地址', trigger: 'blur' }]">
          <el-input v-model="newPartner.partneraddress" style="width: 300px;" />
        </el-form-item>

        <!-- 合作方类型 -->
        <el-form-item label="类型" :rules="[{ required: true, message: '请输入类型', trigger: 'blur' }]">
          <el-select v-model="newPartner.partnertype" placeholder="请选择类型" style="width: 300px;">
            <el-option label="客户" value="1"></el-option>
            <el-option label="厂家" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addPartnerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddPartner">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="编辑合作方" v-model="dialogVisible" width="60%" :modal="true">
      <el-form :model="partner" ref="formRef" label-width="100px">
        <el-form-item label="合作方名称">
          <el-input v-model="partner.partnername" disabled></el-input>
        </el-form-item>

        <el-form-item label="合作方地址">
          <el-input v-model="partner.partneraddress"></el-input>
        </el-form-item>

        <el-form-item label="合作方电话">
          <el-input v-model="partner.partnerphone"></el-input>
        </el-form-item>

        <el-form-item label="合作方状态" v-if="showorderid">
          <el-input v-model="partner.partnerstatus" disabled></el-input>
        </el-form-item>

        <el-form-item label="合作方类型" v-if="showorderid">
          <el-input v-model="partner.partnertype" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditPartner">保存</el-button>
      </span>

    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'; // 使用 Element Plus 的消息提示组件

const showPartnerId = ref(false) // 控制是否显示合作方ID列
const showorderid = ref(false) // 控制是否显示产品ID列

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
const dialogVisible = ref(false)
const newPartner = ref<Partner>({
  partnerid: '',
  partnername: '',
  partnerphone: '',
  partnerstatus: '1',
  partneraddress: '',
  partnertype: ''
})
const partner = ref({
  partnerid: null,
  partnername: '',
  partneraddress: '',
  partnerphone: '',
  partnerstatus: '',
  partnertype: ''
})
const form = ref()

defineExpose({ form })
const editPartner = async (partnerId: string) => {
  try {
    // 假设你有一个 API 来获取合作方信息
    // const response = await fetch(`/api/partners/${partnerId}`);
    // const partnerData = await response.json();

    // 处理获取到的数据，比如显示到编辑对话框中
    dialogVisible.value = true // 显示编辑对话框
    console.log("获取到的合作方数据:" + partnerId);

    const response = await api.post('/partners/getById', null, {
      params: { partnerId: partnerId } // 将partnerId作为查询参数
    });
    partner.value = response.data;
    console.log(response.data)
    console.log("获取到的合作方数据:" + partnerId);


  } catch (error) {
    console.error("编辑合作方失败:", error);
  }
}
// 获取合作方数据
const getPartners = async () => {
  try {
    const response = await api.post('/partners/getAll', { searchQuery: searchQuery.value }) // 获取所有合作方
    partners.value = response.data // 更新响应式数组，确保页面会重新渲染
    console.log(response.data)
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

const handleEditPartner = async () => {
  try {
    // 提交修改后的数据
    const partnerid = partner.value.partnerid
    const response = await api.post(`/partners/update/${partnerid}`, partner.value)
    console.log(response.data)
    if (response.data) {
      ElMessage.success('编辑成功')
      getPartners()
      dialogVisible.value = false // 关闭对话框
    } else {
      ElMessage.error('编辑方失败')
    }
  } catch (error) {
    console.error('编辑合作方失败:', error)
    ElMessage.error('编辑合作方失败')
  }
}

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

  const isExist = partners.value.some(partner => partner.partnername === newPartner.value.partnername);

  if (isExist) {
    // 如果存在相同名称的合作方，提示用户
    ElMessage.error('合作方已存在');
    return; // 退出，不进行新增操作
  }


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
  if (window.confirm('确定要失效这个合作方吗？')) {
    try {
      const partner = { partnerid: parseInt(partnerid, 10) }
      await api.post('/partners/delete', partner) // 调用删除接口
      // partners.value = partners.value.filter(partner => partner.partnerid !== partnerid) // 更新前端数据
      console.log('合作方已删除')
      getPartners()
    } catch (error) {
      console.error('删除合作方失败:', error)
    }
  }
}

const confirmtakeeffectPartner = async (partnerid: string) => {
  if (window.confirm('确定要生效这个合作方吗？')) {
    try {
      const partner = { partnerid: parseInt(partnerid, 10) }
      await api.post('/partners/takeeffectPartner', partner) // 调用删除接口
      // partners.value = partners.value.filter(partner => partner.partnerid !== partnerid) // 更新前端数据
      console.log('合作方已删除')
      getPartners()
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
