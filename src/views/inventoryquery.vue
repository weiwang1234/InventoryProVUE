<template>
  <div class="inventory-management-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>库存查询</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入产品名称" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
      </el-col>
    </el-row>

    <!-- 库存表格 -->
    <el-table :data="currentPageData" style="width: 500px; margin-top: 20px;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="productname" label="产品名称" width="180" />
      <el-table-column prop="quantity" label="库存量" width="130" />
    </el-table>

    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';

interface Inventory {
  productname: string;
  quantity: number;
}

const inventories = ref<Inventory[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

// 获取库存数据
const getInventories = async () => {
  try {
    const response = await api.post('/inventory/getAll', { searchQuery: searchQuery.value });
    console.log(response.data);
    inventories.value = response.data || [];
  } catch (error) {
    console.error('获取库存数据失败:', error);
  }
};

// 计算过滤后的数据
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return inventories.value;
  }
  return inventories.value.filter((item) =>
    item.product_name.includes(searchQuery.value)
  );
});

// 计算当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 页面加载时初始化数据
onMounted(() => {
  getInventories();
});

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  getInventories();
};
</script>

<style scoped>
.inventory-management-page {
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
