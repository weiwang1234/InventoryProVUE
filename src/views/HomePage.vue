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

// 模拟的销售数据（包括销售和进货金额）
const salesData = [
  { date: '2024-01-01', sales: 500, purchase: 300 },
  { date: '2024-01-02', sales: 700, purchase: 500 },
  { date: '2024-01-03', sales: 400, purchase: 200 },
  { date: '2024-01-04', sales: 800, purchase: 600 },
  { date: '2024-01-05', sales: 600, purchase: 400 },
]

// 计算日销售总金额和月销售总金额（这里简化为直接相加）
const dailySalesAmount = salesData.reduce((acc, item) => acc + item.sales, 0)
const monthlySalesAmount = salesData.reduce((acc, item) => acc + item.sales, 0)  // 假设是当天的数据，实际场景中可能需要按月份聚合

// 计算日进货总金额和月进货总金额
const dailyPurchaseAmount = salesData.reduce((acc, item) => acc + item.purchase, 0)
const monthlyPurchaseAmount = salesData.reduce((acc, item) => acc + item.purchase, 0)  // 同样可以按月份聚合

// ECharts 配置和数据处理
const salesChart = ref(null)
const inventoryChart = ref(null)

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
        data: salesData.map(item => item.date),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '销售',
          type: 'line',
          data: salesData.map(item => item.sales),
        },
        {
          name: '进货',
          type: 'line',
          data: salesData.map(item => item.purchase),
        },
      ],
    })

    // 产品库存柱状图配置
    const inventoryData = [
      { product: '产品A', stock: 120 },
      { product: '产品B', stock: 80 },
      { product: '产品C', stock: 150 },
      { product: '产品D', stock: 200 },
      { product: '产品E', stock: 5 },

    ]

    inventoryChartInstance.setOption({
      title: {
        text: '产品库存柱状图',
      },
      tooltip: {
        trigger: 'item',
      },
      xAxis: {
        type: 'category',
        data: inventoryData.map(item => item.product),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '库存',
          type: 'bar',
          data: inventoryData.map(item => item.stock),
          itemStyle: {
            // 使用颜色映射
            normal: {
              color: (params) => {
                const stock = inventoryData[params.dataIndex].stock
                // 如果库存小于 10，使用红色
                return stock < 10 ? '#FF4D4F' : '#1f77b4'
              }
            }
          }
        },
      ],
    })
  })
}

onMounted(() => {
  initCharts()
})
</script>

<style scoped>
.chart-container {
  margin-top: 20px;
}
</style>
