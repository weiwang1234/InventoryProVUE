  <template>
    <div class="orders-query-page">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>
          <a href="/home/orders-query">订单查询</a>
        </el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 查询条件 -->
      <div class="search-box">
        <el-form :inline="true" label-width="80px" class="filter-form">
          <el-form-item label="日期范围">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="customerName" placeholder="请输入客户名称" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchOrders">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 静态文本提示 -->
        <div class="filter-text-tip">* 请选择日期范围以查询订单信息</div> <!-- 修改：新增提示文本 -->
      </div>


      <!-- 订单表格 -->
      <div class="table-actions">
        <el-button type="primary" @click="exportData">导出</el-button> <!-- 导出按钮 -->
      </div>
      <el-table :data="currentPageData" style="width: 100%">
        <el-table-column label="序号" width="80">
          <template v-slot="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column v-if="showCustomerId" prop="orderparid" label="客户ID" width="150" /> <!-- 新增客户ID列 -->

        <el-table-column prop="orderparname" label="客户名称" width="180" />
        <el-table-column label="总金额" width="150">
          <template v-slot="scope" prop="totalamount">
            {{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <!-- 新增“详情”按钮 -->
        <el-table-column label="操作" width="200">
          <template v-slot="scope">
            <el-button plain @click="openOrderDetailsDialog(scope.row.orderparid)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>


      <!-- 汇总信息 -->
      <div class="total-summary">
        总金额汇总: {{ totalAmountSummary.toFixed(2) }}
      </div>
      <!-- 订单详情对话框 -->
      <el-dialog v-model="dialogVisible" width="60%" :modal="true" :lock-scroll="false" :close-on-click-modal="false"
        :close-on-press-escape="false">
        <template #title>
          <span>订单详情</span>
          <!-- <span class="date-text">
      开始日期：{{ dateRange && dateRange[0] ? formatDate(dateRange[0]) : '无' }} &nbsp;&nbsp;
      结束日期：{{ dateRange && dateRange[1] ? formatDate(dateRange[1]) : '无' }}
    </span> -->
        </template>
        <el-table :data="dialogCurrentPageData" style="width: 100%">
          <el-table-column label="产品名称" prop="productname" />
          <el-table-column label="数量" prop="quantity" />
          <el-table-column label="总金额" prop="unitprice">
            <template v-slot="scope">
              {{ parseFloat(scope.row.unitprice).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination :current-page="dialogCurrentPage" :page-size="pageSize" :total="orderDetailData.length"
          @current-change="handleDialogPageChange" layout="total, prev, pager, next, jumper" background
          class="pagination-dialog" />
      </el-dialog>
      <!-- 订单列表分页 -->
      <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
        @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />
    </div>
  </template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { ElMessageBox, ElLoading } from 'element-plus';

interface Order {
  orderid: string;
  orderparid: string;
  customername: string;
  totalAmount: number;
}

interface Orderdetail {
  orderparid: string;
  orderparname: string;
  productid: string;
  productname: string;
  quantity: number;
  unitprice: number;
}

const orders = ref<Order[]>([]); // 使用 ref 使 orders 绑定到响应式数据
const showCustomerId = ref(false); // 控制客户ID列显示与隐藏

const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页显示条数
const dateRange = ref<[string, string] | null>(null); // 日期范围
const customerName = ref(''); // 客户名称
const queryExecuted = ref(false); // 是否执行过查询
const loadingInstance = ref<any>(null);

// 获取订单数据
const getOrders = async () => {
  try {
    // const response = await api.post('/orders/summary', {}); // 获取所有订单
    // orders.value = response.data || []; // 更新响应式数组，确保页面会重新渲染
  } catch (error) {
    console.error('获取订单数据失败:', error);
  }
};

// 搜索订单
const searchOrders = async () => {
  try {

    if (
      (!dateRange.value && (!customerName.value || customerName.value.trim() === ''))
    ) {
      ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return; // 如果没有输入查询条件，则直接返回
    }


    const startDateformat = dateRange.value ? dateRange.value[0] : '';
    const endDateformat = dateRange.value ? dateRange.value[1] : '';

    const sWhere = JSON.stringify({
      StartDate: formatDate(startDateformat),
      EndDate: formatDate(endDateformat),
      orderparname: customerName.value,
    });
    console.log(sWhere)
    const response = await api.post('/orders/summary', { sWhere });

    console.log(response.data)

    orders.value = response.data || [];
    orders.value = response.data || [];
    queryExecuted.value = true; // 标记已执行查询
    if (orders.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
    currentPage.value = 1; // 重置到第一页
  } catch (error) {
    console.error('搜索订单失败:', error);
  }
};

// 重置筛选条件
const resetFilters = () => {
  dateRange.value = null;
  customerName.value = '';
  getOrders();
};

// 计算过滤后的数据
const filteredData = computed(() => {
  return orders.value;
});

// 计算当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 计算总金额汇总
const totalAmountSummary = computed(() => {
  return orders.value.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
});

// 页面初始化时加载数据
onMounted(() => {
  getOrders();
});

// 处理分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

function formatDate(dateStr: string): string {
  if (!dateStr) {
    return ''; // 如果输入字符串为空，返回空字符串
  }
  const date = new Date(dateStr); // 解析 ISO 8601 格式的日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  const day = String(date.getDate()).padStart(2, '0'); // 日期格式化为2位数
  return `${year}-${month}-${day}`;
}
// 导出数据的方法
// 导出数据的方法
const exportData = async () => {
  try {
    const startDateformat = dateRange.value ? formatDate(dateRange.value[0]) : '';
    const endDateformat = dateRange.value ? formatDate(dateRange.value[1]) : '';

    // 请求参数
    const sWhere = {
      StartDate: startDateformat,
      EndDate: endDateformat,
      orderparname: customerName.value,
    };

    loadingInstance.value = ElLoading.service({
      text: '正在导出，请稍等...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    });

    // 向后端发送请求，生成 Excel 文件
    const response = await api.post('/exports/exportordersquery', sWhere, { responseType: 'blob' });

    // 创建 Blob 对象并生成下载链接
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '订单数据导出.xlsx'); // 下载文件名
    document.body.appendChild(link);
    link.click();

    // 移除链接并释放 URL
    link.remove();
    URL.revokeObjectURL(url);
    loadingInstance.value.close();

  } catch (error) {
    console.error('导出 Excel 数据失败:', error);
  }
};


const dialogVisible = ref(false); // 控制详情对话框显示
const dialogCurrentPage = ref(1); // 当前对话框页码
const orderDetailData = ref<Orderdetail[]>([]); // 存储订单详情数据

// 打开订单详情对话框
const openOrderDetailsDialog = async (orderId: string) => {
  await getOrderDetails(orderId); // 获取订单详情数据
  dialogVisible.value = true; // 打开对话框
};

// 获取订单详情
const getOrderDetails = async (orderparid: string) => {
  try {

    const startDateformat = dateRange.value ? dateRange.value[0] : '';
    const endDateformat = dateRange.value ? dateRange.value[1] : '';

    const sWhere = JSON.stringify({
      StartDate: formatDate(startDateformat),
      EndDate: formatDate(endDateformat),
      orderparid: orderparid,
    });

    const response = await api.post('/orders/summarydetailsviews', { sWhere });
    orderDetailData.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('获取订单详情失败:', error);
    orderDetailData.value = [];
  }
};

// 分页逻辑
const dialogCurrentPageData = computed(() => {
  const start = (dialogCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return orderDetailData.value.slice(start, end);
});

const handleDialogPageChange = (page: number) => {
  dialogCurrentPage.value = page;
};




</script>

<style scoped>
.orders-query-page {
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

.summary {
  margin-top: 10px;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
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

.filter-text-tip {
  /* 修改：提示文本的样式 */
  color: #c94c4c;
  /* 提示文字颜色 */
  font-size: 14px;
  /* 提示文字大小 */
}

.table-actions {
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
  /* 右侧内边距 */
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

.date-text {
  font-size: 14px;
  margin-left: 20px;
  /* 与标题保持适当间距 */
  vertical-align: middle;
  /* 垂直居中对齐 */
  display: inline-block;
  color: #c94c4c;
  /* 提示文字颜色 */
  font-size: 14px;
  /* 提示文字大小 */

}
</style>
