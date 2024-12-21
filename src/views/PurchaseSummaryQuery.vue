<template>
  <div class="purchase-summary-query-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>进货汇总查询</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 查询条件 -->
    <div class="search-box">
      <el-form :inline="true" label-width="80px" class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="customerName" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchOrders">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="filter-text-tip">* 请选择日期范围以查询订单信息</div>
    </div>

    <!-- 汇总表格 -->
    <div class="table-actions">
      <el-button type="primary" @click="exportData">导出</el-button> <!-- 导出按钮 -->
    </div>
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showCustomerId" prop="orderparid" label="客户ID" width="150" />
      <el-table-column prop="orderparname" label="客户名称" width="180" />
      <el-table-column label="总金额" width="150">
        <template v-slot="scope">
          {{ scope.row.ordertotalamountsum ? scope.row.ordertotalamountsum.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template v-slot="scope">
          <el-button plain @click="viewOrderDetail(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>


    <el-dialog v-model="dialogVisible" title="订单详情" width="60%">
      <el-table :data="orderDetailsPageData" style="width: 100%">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="unitPrice" label="总金额">
          <template v-slot="scope">
            {{ scope.row.unitPrice != null ? scope.row.unitPrice.toFixed(2) : '0.00' }}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page="orderDetailsPage" :page-size="orderDetailsPageSize" :total="orderDetails.length"
        @current-change="handleOrderDetailsPageChange" layout="total, prev, pager, next, jumper" background
        class="pagination-dialog" />
    </el-dialog>
    <!-- 汇总信息 -->
    <div class="total-summary">
      总金额汇总: {{ totalAmountSummary.toFixed(2) }}
    </div>

    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import api from '../api';
import { ElMessageBox } from 'element-plus';

// 查询条件和表格数据
const dateRange = ref<[string, string] | null>(null);
const customerName = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const orders = ref<Order[]>([]); // 使用 ref 使 orders 绑定到响应式数据
const dialogVisible = ref(false);
const orderDetails = ref<{ productName: string; quantity: number; unitPrice: number }[]>([]);
const orderDetailsPage = ref(1); // 当前页
const orderDetailsPageSize = ref(5); // 每页显示 5 条订单详情



// 是否显示客户ID列
const showCustomerId = ref(false);
interface Order {
  orderparid: string;
  orderparname: string;
  ordertotalamountsum: number;
}


// 获取进货汇总数据
const getOrders = async () => {
  try {
    const response = await api.post('/purchase-summary/query', {});
    orders.value = response.data || [];
  } catch (error) {
    console.error('获取进货汇总数据失败:', error);
  }
};

// 查询订单
const searchOrders = async () => {
  try {
    if (!dateRange.value && (!customerName.value || customerName.value.trim() === '')) {
      ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
        lockScroll: false, // 允许页面滚动
      });
      return;
    }

    const params = {
      startDate: dateRange.value ? dateRange.value[0] : null,
      endDate: dateRange.value ? dateRange.value[1] : null,
      customerName: customerName.value,
    };

    const response = await api.post('/purchaseorders/getPurchaseOrderssum', params);

    console.log(response.data)
    orders.value = response.data || [];

    if (orders.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
    currentPage.value = 1;
  } catch (error) {
    console.error('查询订单失败:', error);
  }
};

// 重置查询条件
const resetFilters = () => {
  dateRange.value = null;
  customerName.value = '';
  getOrders();
};

// 导出数据
const exportData = async () => {
  try {
    const params = {
      startDate: dateRange.value ? dateRange.value[0] : null,
      endDate: dateRange.value ? dateRange.value[1] : null,
      customerName: customerName.value,
    };

    const response = await api.post('/purchase-summary/export', params, { responseType: 'blob' });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '进货汇总查询.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出数据失败:', error);
  }
};

// 分页数据
const filteredData = computed(() => orders.value);
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const orderDetailsPageData = computed(() => {
  const start = (orderDetailsPage.value - 1) * orderDetailsPageSize.value;
  const end = start + orderDetailsPageSize.value;
  return orderDetails.value.slice(start, end);
});

// 总金额汇总
const totalAmountSummary = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.ordertotalamountsum || 0), 0);
});

// 处理分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};
const handleOrderDetailsPageChange = (page: number) => {
  orderDetailsPage.value = page;
};


const viewOrderDetail = async (order: Order) => {
  try {
    dialogVisible.value = true;

    const params = {
      startDate: dateRange.value ? dateRange.value[0] : null,
      endDate: dateRange.value ? dateRange.value[1] : null,
      customerName: customerName.value,
      orderparid: order.orderparid, // 使用 orderparid
    };

    console.log(params)
    const response = await api.post('/purchaseorderdetails/getOrderDetailSummary', params);
    console.log(response.data)
    orderDetails.value = response.data || [];
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessageBox.alert('获取订单详情失败，请稍后再试！', '错误', {
      confirmButtonText: '确定',
      type: 'error',
    });
  }
};



</script>

<style scoped>
.purchase-summary-query-page {
  padding: 20px;
  background-color: #f9f9f9;
}

.breadcrumb {
  margin-bottom: 20px;
}

.search-box {
  margin-top: 20px;
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  /* 右侧内边距 */
}

.filter-text-tip {
  color: #c94c4c;
  font-size: 14px;
}

.total-summary {
  margin-top: 10px;
  font-weight: bold;
  background-color: #f5f7fa;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 5px;
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
</style>