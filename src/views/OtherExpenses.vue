<template>
  <div class="other-expenses-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>其他支出</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 新增支出按钮 -->

    <!-- 搜索区域 -->
    <el-row class="search-box" style="margin-bottom: 20px;" gutter="10">
      <el-col :span="8" style="text-align: right;">
        <el-date-picker v-model="searchDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" clearable />
      </el-col>
      <el-col :span="4">
        <el-input v-model="searchQuery" placeholder="请输入支出名称" clearable suffix-icon="el-icon-search" />
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearchFilters">重置</el-button>
      </el-col>
    </el-row>
    <el-button type="primary" @click="openAddExpenseDialog" style="width: 100%">新增支出</el-button>

    <!-- 其他支出表格 -->
    <el-table :data="currentPageData" style="width: 100%;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="otherexpensesid" label="支出ID" width="80" />
      <el-table-column prop="otherexpensesname" label="支出名称" width="180" />
      <el-table-column prop="otherexpensesamount" label="支出金额" width="100" />
      <el-table-column prop="otherexpensesremak" label="备注" width="180" />
      <el-table-column prop="otherexpensesdate" label="支出时间" width="180" />

      <!-- 新增的删除按钮列 -->
      <el-table-column label="操作" width="120">
        <template v-slot="scope">
          <el-button type="danger" @click="deleteExpense(scope.row.otherexpensesid)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="total-summary">
      其他支出总金额：{{ totalAmount }} 元
    </div>
    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 新增支出的对话框 -->
    <el-dialog v-model="addExpenseDialogVisible" title="新增支出" width="40%" :modal="true" :lock-scroll="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="newExpense" ref="form" label-width="100px">
        <el-form-item label="支出名称" prop="otherexpensesname"
          :rules="[{ required: true, message: '请输入支出名称', trigger: 'blur' }]">
          <el-input v-model="newExpense.otherexpensesname" placeholder="请输入支出名称" style="width: 220px;" />
        </el-form-item>
        <el-form-item label="支出金额" prop="otherexpensesamount"
          :rules="[{ required: true, message: '请输入支出金额', trigger: 'blur' }]">
          <el-input-number v-model="newExpense.otherexpensesamount" placeholder="请输入支出金额" :min="0"
            style="width: 220px;" />
        </el-form-item>
        <el-form-item label="备注">
          <!-- 改为大文本框 -->
          <el-input type="textarea" v-model="newExpense.otherexpensesremak" placeholder="请输入备注" rows="4"
            style="width: 220px;" />
        </el-form-item>
        <el-form-item label="支出时间" prop="otherexpensesdate"
          :rules="[{ required: true, message: '请选择支出时间', trigger: 'blur' }]">
          <el-date-picker v-model="newExpense.otherexpensesdate" type="date" placeholder="请选择支出时间"
            style="width: 220px;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeAddExpenseDialog">取 消</el-button>
        <el-button type="primary" @click="saveExpense" :disabled="isSubmitting">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { ElMessageBox } from 'element-plus';
import { ElMessage } from 'element-plus';



// 当前页、分页大小、查询条件等
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');  // 搜索框：支出名称
const searchDateRange = ref([null, null]);  // 搜索框：日期范围

interface OtherExpense {
  otherexpensesid: string;
  otherexpensesname: string;
  otherexpensesamount: number;
  otherexpensesremak: string;
  otherexpensesdate: string;
}

const otherExpenses = ref<OtherExpense[]>([]);  // 存储所有其他支出数据
const filteredData = ref<OtherExpense[]>([]);  // 存储经过查询筛选后的数据
const isSubmitting = ref(false)

// 控制新增支出对话框的显示
const addExpenseDialogVisible = ref(false);
const newExpense = ref<OtherExpense>({
  otherexpensesid: '',
  otherexpensesname: '',
  otherexpensesamount: 0,
  otherexpensesremak: '',
  otherexpensesdate: ''
});

// 获取其他支出数据
const getOtherExpenses = async () => {
  try {
    const response = await api.post('/otherexpenses/getAll', { searchQuery: searchQuery.value });
    otherExpenses.value = response.data || [];
    filteredData.value = otherExpenses.value;  // 初始时显示所有数据
  } catch (error) {
    console.error('获取其他支出数据失败:', error);
  }
};

// 查询
const handleSearch = async () => {
  try {
    // 如果没有输入查询条件，则提示用户
    if (
      (!searchDateRange.value && (!searchQuery.value || searchQuery.value.trim() === ''))
    ) {
      ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return; // 如果没有输入查询条件，则直接返回
    }

    const startDateformat = searchDateRange.value && searchDateRange.value[0] ? formatDate(searchDateRange.value[0]) : '';
    const endDateformat = searchDateRange.value && searchDateRange.value[1] ? formatDate(searchDateRange.value[1]) : '';

    console.log(startDateformat)
    console.log(endDateformat)


    // 直接传递查询条件对象给后端
    const searchCriteria = {
      startDate: startDateformat, // 假设 formatDate 用于格式化日期
      endDate: endDateformat,
      name: searchQuery.value,  // 产品名称
    };

    console.log('查询条件:', searchCriteria);

    // 发送请求到后端，直接传递查询条件
    const response = await api.post('/otherexpenses/search', searchCriteria);

    console.log('查询结果:', response.data);

    // 处理返回的数据
    filteredData.value = response.data || [];
    otherExpenses.value = response.data || [];
    if (otherExpenses.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
    currentPage.value = 1; // 重置到第一页
  } catch (error) {
    console.error('搜索失败:', error);
  }





};

// 重置搜索条件
const resetSearchFilters = () => {
  searchQuery.value = '';
  searchDateRange.value = [null, null];
  currentPage.value = 1;
  filteredData.value = otherExpenses.value;
};

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 计算当前页显示的数据
const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = currentPage.value * pageSize.value;
  return filteredData.value.slice(startIndex, endIndex);
});

const deleteExpense = async (id: number) => {
  try {
    // 使用 axios 发送 POST 请求，确保 Content-Type 是 application/json
    await api.post('/otherexpenses/delete', id, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // 刷新列表
    getOtherExpenses();

    // 提示删除成功
    ElMessage({
      message: '支出数据已成功删除。',
      type: 'success',
      duration: 2000, // 消息显示时间
    });

  } catch (error) {
    console.error('删除支出数据失败:', error);

    // 提示删除失败
    ElMessage({
      message: '删除支出数据失败，请重试。',
      type: 'error',
      duration: 2000,
    });
  }
};

// 打开新增支出对话框
const openAddExpenseDialog = () => {
  isSubmitting.value = false; // 设置按钮禁用状态
  addExpenseDialogVisible.value = true;
};

// 关闭新增支出对话框
const closeAddExpenseDialog = () => {
  addExpenseDialogVisible.value = false;
  // 重置表单数据
  newExpense.value = {
    otherexpensesid: '',
    otherexpensesname: '',
    otherexpensesamount: 0,
    otherexpensesremak: '',
    otherexpensesdate: ''
  };
};

// 保存新增的支出数据
const saveExpense = async () => {

  if (!newExpense.value.otherexpensesname) {
    ElMessageBox.alert('请输入支出名称!', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }

  if (newExpense.value.otherexpensesamount < 1) {
    ElMessageBox.alert('请输入支出金额！', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }
  if (!newExpense.value.otherexpensesdate) {
    ElMessageBox.alert('请选择支出日期！', '警告', {
      type: 'warning',
    });
    return;
  }

  if (isSubmitting.value) return;  // 如果正在提交，则不再执行

  isSubmitting.value = true; // 设置按钮禁用状态


  try {

    newExpense.value.otherexpensesdate = formatDate(newExpense.value.otherexpensesdate)
    console.log(newExpense.value)
    await api.post('/otherexpenses/create', newExpense.value);
    getOtherExpenses();  // 刷新列表
    closeAddExpenseDialog();  // 关闭对话框
  } catch (error) {
    console.error('保存支出数据失败:', error);
  }
};


function formatDate(dateStr: string): string {
  const date = new Date(dateStr); // 解析 ISO 8601 格式的日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  const day = String(date.getDate()).padStart(2, '0'); // 日期格式化为2位数
  return `${year}-${month}-${day}`;
}


const totalAmount = computed(() => {
  return currentPageData.value.reduce((sum, order) => {
    const amount = Number(order.otherexpensesamount) || 0; // 转换为数字，默认值为 0
    return sum + amount;
  }, 0).toFixed(2); // 保留两位小数
});

// 页面加载时初始化数据
onMounted(() => {
  getOtherExpenses();
});
</script>

<style scoped>
.other-expenses-page {
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

.total-summary {
  margin-top: 10px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  background-color: #f5f7fa;
  /* 浅灰色背景 */
  border: 1px solid #ebeef5;
  /* 浅色边框 */
  border-radius: 5px;
  /* 圆角 */
  text-align: left;
  /* 右对齐 */
  color: #333;
  /* 深色字体 */
}
</style>
