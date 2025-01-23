<template>
  <div class="home-page">
    <!-- 销售统计 -->
    <el-row gutter={25}>
      <el-col :span="5">
        <el-card>
          <div class="stat-card">
            <div>当日销售总金额</div>
            <div class="stat-value">{{ dailySalesAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card>
          <div class="stat-card">
            <div>当月销售总金额</div>
            <div class="stat-value">{{ monthlySalesAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card>
          <div class="stat-card">
            <div>当日进货总金额</div>
            <div class="stat-value">{{ dailyPurchaseAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card>
          <div class="stat-card">
            <div>当月进货总金额</div>
            <div class="stat-value">{{ monthlyPurchaseAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card @click="openReminderDialog">
          <div class="stat-card">
            <div>保养提醒</div>
            <div class="stat-value">{{ reminderCount }} 条</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-dialog v-model="isReminderDialogVisible" title="保养提醒列表" width="60%" :modal="true" :close-on-click-modal="false"
      :close-on-press-escape="false" :lock-scroll="false">
      <div>
        <!-- 假设您会根据实际数据动态展示提醒列表 -->
        <el-table :data="reminderList" style="width: 100%">
          <el-table-column v-if="showorderid" label="订单编号" prop="orderid" />
          <el-table-column label="客户" prop="orderparname" />
          <el-table-column label="上次保养时间" prop="orderdate" />
          <el-table-column label="电话号码" prop="partnerphone" />
          <el-table-column label="操作">
            <template v-slot="scope">
              <el-button type="danger" @click="editOrder(scope.row.orderid)">不再提醒</el-button>
            </template>
          </el-table-column>

        </el-table>
      </div>
    </el-dialog>

    <!-- 销售曲线图 -->
    <el-card>
      <div class="chart-container">
        <div></div>
        <div ref="salesChart" style="height: 400px;"></div>
      </div>
    </el-card>

    <!-- 产品库存柱状图 -->
    <!-- <el-card>
      <div class="chart-container">
        <div></div>
        <div ref="inventoryChart" style="height: 400px;"></div>
      </div>
    </el-card> -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import api from '../api';

const inventoryData = ref([]);  // 用于存储库存数据
const salesData = ref([]);  // 用于存储库存数据

const dailySalesAmount = ref(0);
const monthlySalesAmount = ref(0);
const dailyPurchaseAmount = ref(0);
const monthlyPurchaseAmount = ref(0);
const isReminderDialogVisible = ref(false);
const reminderCount = ref(5);  // 假设有5条提醒
const reminderList = ref([]); // 用于存储从后端获取的数据
const showorderid = ref(false) // 控制是否显示产品ID列

// 点击“保养提醒”卡片时调用此方法
const openReminderDialog = async () => {
  isReminderDialogVisible.value = true;
};

// 模拟的销售数据（包括销售和进货金额）
// const salesData = [
//   { date: '2024-01-01', sales: 500, purchase: 300 },
//   { date: '2024-01-02', sales: 700, purchase: 500 },
//   { date: '2024-01-03', sales: 400, purchase: 200 },
//   { date: '2024-01-04', sales: 800, purchase: 600 },
//   { date: '2024-01-05', sales: 600, purchase: 400 },
// ]

// ECharts 配置和数据处理
const salesChart = ref(null)
// const inventoryChart = ref(null)
const editOrder = async (orderId) => {
  try {
    // 发送 POST 请求到后端，传递 orderId 在请求体中
    const response = await api.post('/orders/updatereminder', null, {
      params: { orderid: orderId }, // 这里参数名字要和后端匹配
    });
    console.log('编辑订单成功:', response.data);
    getOrders();
  } catch (error) {
    console.error('编辑订单失败:', error);
  }
};

const getOrders = async () => {
  try {
    // 在 URL 中传递查询参数
    const targetDate = '2025-05-20'; // 目标日期
    const daysDifference = 20; // 天数差异

    // 使用 URL 查询参数发送 POST 请求
    const response = await api.post('/orders/find', null, {
      params: {
        targetDate: targetDate,
        daysDifference: daysDifference
      }
    });
    reminderList.value = response.data; // 假设返回的数据是订单列表
    // 处理返回的数据
    console.log('返回的数据:', response.data);
    // 你可以根据需要更新前端的状态或视图
  } catch (error) {
    console.error('获取订单数据失败:', error);
  }
};



const fetchDailySalesAmount = async () => {
  try {
    const response = await api.post('/orders/getHomepageSum', { /* 可以传递查询条件 */ });
    console.log(response.data)

    dailySalesAmount.value = response.data.dailySalesAmount || 0;
    monthlySalesAmount.value = response.data.monthlySalesAmount || 0;
    dailyPurchaseAmount.value = response.data.dailyPurchaseAmount || 0;
    monthlyPurchaseAmount.value = response.data.monthlyPurchaseAmount || 0;
    salesData.value = response.data.salesStatistics || [];  // 如果需要销售统计数据
    console.log(salesData.value)
    inventoryData.value = response.data.inventory || [];  // 假设库存数据在此
  } catch (error) {
    console.error('获取销售数据失败', error);
  }
};

const initCharts = () => {
  nextTick(() => {
    const salesChartInstance = echarts.init(salesChart.value)
    // const inventoryChartInstance = echarts.init(inventoryChart.value)

    // 销售曲线图配置
    salesChartInstance.setOption({
      title: {
        text: '销售与进货曲线图',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['销售', '进货'],
      },
      xAxis: {
        type: 'category',
        data: salesData.value.map(item => item.date),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '销售',
          type: 'line',
          data: salesData.value.map(item => item.sales),
        },
        {
          name: '进货',
          type: 'line',
          data: salesData.value.map(item => item.purchase),
        },
      ],
    })

    // 产品库存柱状图配置
    // const inventoryData = [
    //   { product: '产品A', stock: 120 },
    //   { product: '产品B', stock: 80 },
    //   { product: '产品C', stock: 150 },
    //   { product: '产品D', stock: 200 },
    //   { product: '产品E', stock: 5 },

    // ]

  })
}

onMounted(() => {
  getOrders()
  fetchDailySalesAmount().then(() => {
    initCharts();
  });
});
</script>

<style scoped>
.chart-container {
  margin-top: 20px;
}
</style>