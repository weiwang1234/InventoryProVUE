<template>
  <div class="inventory-check-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>库存盘点</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="search-box" style="margin-top: 20px; margin-bottom: 20px;" gutter="10">
      <el-col :span="8" style="text-align: right;">
        <el-date-picker v-model="searchDateRange" type="month" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" clearable />
      </el-col>
      <el-col :span="4">
        <el-input v-model="searchQuery" placeholder="请输入产品名称" clearable suffix-icon="el-icon-search" />
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearchFilters">重置</el-button>
      </el-col>
    </el-row>

    <!-- 盘点结果表格 -->
    <el-table :data="currentPageData" style="width: 100%;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="productid" label="产品ID" width="80" />
      <el-table-column prop="productname" label="产品名称" width="180" />
      <el-table-column prop="lastmonthinventory" label="上月库存" />
      <el-table-column prop="monthPurchases" label="本月进货" />
      <el-table-column prop="monthprocessedoutput" label="本月加工产出" />
      <el-table-column prop="monthsoldquantity" label="本月卖出数量" />
      <el-table-column prop="stockmonth" label="盘点月份" />
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
const searchQuery = ref('');  // 搜索框：产品名称
const searchDateRange = ref([null, null]);  // 搜索框：日期范围

interface Inventory {
  productid: string;
  productname: string;
  lastmonthinventory: number;
  monthPurchases: number;
  monthprocessedoutput: number;
  monthsoldquantity: number;
  stockmonth: string;
}

const inventories = ref<Inventory[]>([]);  // 存储所有库存数据
const filteredData = ref<Inventory[]>([]);  // 存储经过查询筛选后的数据

// 获取库存数据
const getInventories = async () => {
  try {
    const response = await api.post('/inventory/getAll', { searchQuery: searchQuery.value });
    inventories.value = response.data || [];
    filteredData.value = inventories.value;  // 初始时显示所有库存数据
  } catch (error) {
    console.error('获取库存数据失败:', error);
  }
};

// 查询
const handleSearch = () => {
  currentPage.value = 1;
  // 根据查询条件过滤数据
  filteredData.value = inventories.value.filter((item) => {
    const matchName = item.productname.includes(searchQuery.value);
    const matchDateRange =
      (!searchDateRange.value[0] || !searchDateRange.value[1]) ||
      (new Date(item.stockmonth) >= new Date(searchDateRange.value[0]) &&
        new Date(item.stockmonth) <= new Date(searchDateRange.value[1]));
    return matchName && matchDateRange;
  });
};

// 重置搜索条件
const resetSearchFilters = () => {
  searchQuery.value = '';
  searchDateRange.value = [null, null];
  currentPage.value = 1;
  filteredData.value = inventories.value;  // 重置时显示所有数据
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

// 页面加载时初始化数据
onMounted(() => {
  getInventories();
});
</script>

<style scoped>
.inventory-check-page {
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
</style>