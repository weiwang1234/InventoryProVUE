<template>
  <div class="home-page">
    <!-- 销售统计 -->
    <el-row gutter={20}>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div>当日销售总金额</div>
            <div class="stat-value">{{ dailySalesAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div>当月销售总金额</div>
            <div class="stat-value">{{ monthlySalesAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div>当日进货总金额</div>
            <div class="stat-value">{{ dailyPurchaseAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-card">
            <div>当月进货总金额</div>
            <div class="stat-value">{{ monthlyPurchaseAmount }} 元</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售曲线图 -->
    <el-card>
      <div class="chart-container">
        <div></div>
        <div ref="salesChart" style="height: 400px;"></div>
      </div>
    </el-card>

    <!-- 产品库存柱状图 -->
    <el-card>
      <div class="chart-container">
        <div></div>
        <div ref="inventoryChart" style="height: 400px;"></div>
      </div>
    </el-card>
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
const inventoryChart = ref(null)

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
    const inventoryChartInstance = echarts.init(inventoryChart.value)

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
    inventoryChartInstance.setOption({
      title: {
        text: '产品库存柱状图',
      },
      tooltip: {
        trigger: 'item',
      },
      xAxis: {
        type: 'category',
        data: inventoryData.value.map(item => item.productname),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '库存',
          type: 'bar',
          data: inventoryData.value.map(item => item.quantity),
          itemStyle: {
            // 使用 itemStyle 来动态设置每个柱状图的颜色
            normal: {
              color: (params) => {
                // 判断 quantity 值，若小于 10 则为红色，大于等于 10 则为蓝色
                return params.data < 10 ? '#F56C6C' : '#0052D9'; // Element Plus 红色和蓝色
              }
            }
          }
        },
      ],
    })
  })
}

onMounted(() => {
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
