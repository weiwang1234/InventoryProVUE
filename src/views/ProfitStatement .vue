<template>
  <div class="profit-statement-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>盈利表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="search-box" style="margin-bottom: 20px;" gutter="10">
      <el-col :span="8" style="text-align: right;">
        <el-date-picker v-model="searchDateRange" type="monthrange" format="YYYY-MM" start-placeholder="选择开始月份"
          end-placeholder="选择结束月份" clearable style="width: 85%;" /> </el-col>

      <el-col :span="8">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearchFilters">重置</el-button>
      </el-col>
    </el-row>

    <!-- 盈利表格 -->
    <el-table :data="currentPageData" style="width: 100%;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="profitmonth" label="月份" width="180" />
      <el-table-column label="进货支出" width="180">
        <template v-slot="scope">
          {{ scope.row.purchasingexpenses !== null && scope.row.purchasingexpenses !== undefined ?
            scope.row.purchasingexpenses.toFixed(2) : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="其他支出" width="180">
        <template v-slot="scope">
          {{ scope.row.otherexpenses !== null && scope.row.otherexpenses !== undefined ?
            scope.row.otherexpenses.toFixed(2) : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="卖货收入" width="180">
        <template v-slot="scope">
          {{ scope.row.salesrevenue !== null && scope.row.salesrevenue !== undefined ? scope.row.salesrevenue.toFixed(2)
            : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="净利润" width="180">
        <template v-slot="scope">
          {{ scope.row.netprofit !== null && scope.row.netprofit !== undefined ? scope.row.netprofit.toFixed(2) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template v-slot="scope">
          <!-- 下载按钮 -->
          <el-button type="primary" @click="downloadData(scope.row)">
            下载
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';

const currentPage = ref(1);
const pageSize = ref(10);
const searchDateRange = ref([null, null]);  // 搜索框：日期范围

interface ProfitStatement {
  productid: string;
  productname: string;
  lastmonthinventory: number;
  monthPurchases: number;
  monthprocessedoutput: number;
  monthsoldquantity: number;
  stockmonth: string;
}

const profitStatements = ref<ProfitStatement[]>([]);  // 存储所有盈利数据
const filteredData = ref<ProfitStatement[]>([]);  // 存储经过查询筛选后的数据

// 获取盈利数据
const getProfitStatements = async () => {
  try {
    const response = await api.get('/profitstatement');
    profitStatements.value = response.data || [];
    filteredData.value = profitStatements.value;  // 初始时显示所有盈利数据
  } catch (error) {
    console.error('获取盈利数据失败:', error);
  }
};

// 查询
const handleSearch = async () => {
  const searchpama = {
    startDate: searchDateRange.value && searchDateRange.value[0] ? formatDate(searchDateRange.value[0]) : null,
    endDate: searchDateRange.value && searchDateRange.value[1] ? formatDate(searchDateRange.value[1]) : null,
  };

  try {
    // 确保URL路径正确
    const response = await api.post('/profitstatement/querySearch', searchpama);
    profitStatements.value = response.data || [];
    filteredData.value = profitStatements.value;  // 初始时显示所有盈利数据
  } catch (error) {
    console.error('获取盈利数据失败:', error);
  }
  currentPage.value = 1;
  // 根据查询条件过滤数据
};


// 重置搜索条件
const resetSearchFilters = () => {
  searchDateRange.value = [null, null];
  currentPage.value = 1;
};

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 计算当前页显示的数据
const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = currentPage.value * pageSize.value;
  return filteredData.value.slice(startIndex, endIndex);  // 返回当前页数据
});
function formatDate(dateStr: string): string {
  const date = new Date(dateStr); // 解析日期字符串
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  return `${year}-${month}`; // 返回 YYYY-MM 格式
}
const downloadData = async (row: any) => {
  try {


    const profitmonth = row.profitmonth
    const params = new URLSearchParams();
    params.append('profitmonth', profitmonth + '%');  // 以查询参数形式传递 profitmonth


    // 请求后端下载 Excel 文件
    // const exportType = "StockTaking"; // 替换为需要的导出类型，例如 "orders" 或 "users"

    console.log(params);
    const response = await api.post('/exports/ProfitStatement', params, { responseType: 'blob' });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${row.profitmonth}月进库存盘点明细.xlsx`;  // 文件名中添加 stockmonth

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载失败:', error);
  }
}
// 页面加载时初始化数据
onMounted(() => {
  getProfitStatements();
});
</script>

<style scoped>
.profit-statement-page {
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
</style>
