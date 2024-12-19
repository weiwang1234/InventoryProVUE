<template>
  <div class="purchase-orders-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>进货订单管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框和操作按钮 -->
    <el-row class="search-box" style="margin-bottom: 20px;" gutter="10">
      <el-col :span="8" style="text-align: right;">
        <el-date-picker v-model="searchDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" clearable />
      </el-col>
      <el-col :span="4">
        <el-input v-model="searchQuery" placeholder="请输入客户名称" clearable suffix-icon="el-icon-search" />
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearchFilters">重置</el-button>
      </el-col>
    </el-row>

    <!-- 进货订单表格 -->
    <el-table :data="currentPageData" style="width: 100%; margin-top: 20px;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="orderid" label="订单编号" width="150" />
      <el-table-column prop="orderparname" label="商户名称" width="200" />
      <el-table-column prop="ordertotalamount" label="订单总金额" width="120" :formatter="formatAmount" />
      <el-table-column prop="orderdate" label="订单日期" width="150" />
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button plain @click="viewDetails(scope.row.orderid)">查看详情</el-button>
          <el-button type="danger" @click="deleteOrder(scope.row.orderid)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单总金额 -->
    <div class="total-summary">
      订单总金额：{{ totalOrderAmount }} 元
    </div>

    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="purchaseOrders.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';

interface PurchaseOrder {
  orderid: string;
  orderparname: string;
  ordertotalamount: number;
  orderdate: string;
}

const purchaseOrders = ref<PurchaseOrder[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const searchDateRange = ref<[string, string] | null>(null);

// 获取进货订单数据
const getPurchaseOrders = async () => {
  try {

    const searchpama = {
      searchQuery: searchQuery.value,
      startDate: searchDateRange.value ? formatDate(searchDateRange.value[0]) : null,
      endDate: searchDateRange.value ? formatDate(searchDateRange.value[1]) : null,
    };
    console.log(searchpama)
    const response = await api.post('/purchaseorders/searchOrders', searchpama);

    console.log(response.data);
    purchaseOrders.value = response.data || [];
  } catch (error) {
    console.error('获取进货订单数据失败:', error);
  }
};
const getpurchaseorderlist = async () => {
  try {


    const response = await api.post('/purchaseorders/list')

    console.log(response.data);
    purchaseOrders.value = response.data || [];
  } catch (error) {
    console.error('获取进货订单数据失败:', error);
  }
};

// 计算当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return purchaseOrders.value.slice(start, end);
});

// 计算所有页的总金额
const totalOrderAmount = computed(() => {
  return purchaseOrders.value
    .reduce((total, item) => total + item.ordertotalamount, 0)
    .toFixed(2);
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr); // 解析 ISO 8601 格式的日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  const day = String(date.getDate()).padStart(2, '0'); // 日期格式化为2位数
  return `${year}-${month}-${day}`;
}

// 页面加载时初始化数据
onMounted(() => {
  getpurchaseorderlist();
});

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 查询
const handleSearch = () => {
  currentPage.value = 1;
  getPurchaseOrders();
};

// 重置
const resetSearchFilters = () => {
  searchQuery.value = '';
  searchDateRange.value = null;
  currentPage.value = 1;
  getPurchaseOrders();
};

// 查看订单详情
const viewDetails = (orderid: string) => {
  console.log('查看订单详情:', orderid);
  // 可跳转到详情页面或弹窗展示详情
};

// 删除订单
const deleteOrder = async (orderid: string) => {
  try {
    await api.post('/purchaseorders/delete', { orderid });
    console.log('订单删除成功:', orderid);
    getPurchaseOrders();
  } catch (error) {
    console.error('删除订单失败:', error);
  }
};

// 格式化订单金额
const formatAmount = (row: PurchaseOrder) => {
  return row.ordertotalamount.toFixed(2);
};
</script>

<style scoped>
.purchase-orders-page {
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

.order-total {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  text-align: right;
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

.total-summary {
  margin-top: 10px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 5px;
  text-align: left;
  color: #333;
}
</style>
