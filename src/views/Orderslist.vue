<template>
  <div class="orders-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/product-list">订单列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框 -->
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

    <!-- 新增订单按钮 -->
    <el-button type="primary" @click="openAddOrderDialog">新增订单</el-button>

    <!-- 订单表格 -->
    <el-table :data="currentPageData" style="width: 100%">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="id" label="订单编号" width="180" /> -->
      <el-table-column v-if="showorderid" prop="orderid" label="产品ID" />

      <el-table-column v-if="showorderid" prop="orderparid" label="客户编号" width="180" />
      <el-table-column prop="orderparname" label="客户名称" width="180" />
      <el-table-column prop="ordertotalamount" label="订单金额" width="180">
        <template v-slot="scope">
          {{ Number(scope.row.ordertotalamount).toFixed(2) }}
        </template>
      </el-table-column> <el-table-column prop="orderdate" label="订单日期" width="180" />
      <el-table-column label="操作" width="200">

        <template v-slot="scope">
          <el-button plain @click="openOrderDetailsDialog(scope.row.orderid)">查看详情</el-button>
          <el-button type="danger" @click="confirmDeleteOrder(scope.row.orderid)">删除</el-button>
        </template>

      </el-table-column>
    </el-table>
    <div class="total-summary">
      订单总金额：{{ totalAmount }} 元
    </div>
    <!-- 订单列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 订单详情对话框 -->
    <el-dialog v-model="dialogTableVisible" title="订单详情" width="60%" @close="refreshOrderList"> <!-- 添加关闭事件 -->

      <el-table :data="dialogCurrentPageData" style="width: 100%">

        <el-table-column v-if="showorderid" prop="orderid" label="订单编号" width="180" />
        <el-table-column v-if="showorderid" prop="ordetailid" label="订单详情编号" width="180" />
        <el-table-column v-if="showorderid" prop="productid" label="产品ID" width="180" />
        <el-table-column prop="productname" label="产品名称" width="180" />
        <el-table-column prop="unitprice" label="产品总价" width="180">
          <template v-slot="scope">
            {{ parseFloat(scope.row.unitprice).toFixed(2) }}
          </template>
        </el-table-column> <el-table-column prop="quantity" label="购买数量" width="180" />

        <!-- 每行增加一个删除按钮 -->
        <el-table-column label="操作" width="120">
          <template v-slot="scope">
            <el-button type="danger" @click="removeProductFromDialog(scope.row.ordetailid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 订单详情分页 -->
      <el-pagination :current-page="dialogCurrentPage" :page-size="pageSize" :total="orderDetailData.length"
        @current-change="handleDialogPageChange" layout="total, prev, pager, next, jumper" background
        class="pagination-dialog" />
    </el-dialog>

    <!-- 新增订单对话框 -->
    <el-dialog v-model="addOrderDialogVisible" title="新增订单" width="60%">
      <el-form :model="newOrder" ref="form" label-width="100px">
        <el-form-item v-if="showorderid" label="客户编号"
          :rules="[{ required: true, message: '请输入客户编号', trigger: 'blur' }]">
          <el-input v-model="newOrder.orderparid" />
        </el-form-item>

        <el-form-item label="客户名称" :rules="[{ required: true, message: '请选择客户', trigger: 'blur' }]">
          <el-select v-model="newOrder.orderparname" filterable placeholder="请输入客户名称" @change="handleCustomerSelect"
            style="width: 220px;">
            <el-option v-for="customer in customers" :key="customer.partnerid" :value="customer.partnername"
              :label="customer.partnername" />
          </el-select>
        </el-form-item>




        <el-form-item label="订单日期" :rules="[{ required: true, message: '请输入订单日期', trigger: 'blur' }]">
          <el-date-picker v-model="newOrder.orderdate" type="date" placeholder="请选择一个日期" />

        </el-form-item>

        <el-form-item label="总金额" :rules="[{ required: true, message: '请输入总金额', trigger: 'blur' }]">
          <el-input v-model="newOrder.ordertotalamount" readonly style="width: 220px;" />
        </el-form-item>

        <!-- 增加产品按钮 -->
        <el-button type="success" @click="addProductRow">增加产品</el-button>

        <!-- 产品选择行 -->
        <div v-for="(productRow, index) in newOrder.selectedProducts" :key="index" class="product-row">
          <!-- 隐藏产品 ID -->
          <el-form-item label="产品 ID" style="display: none;">
            <el-input :model-value="productRow.product?.productid"
              @input="(value: string) => updateProductId(index, value)" disabled />
          </el-form-item>

          <!-- 选择产品 -->
          <el-form-item label="选择产品">
            <el-select v-model="productRow.productId" placeholder="请选择产品" @change="handleProductSelect(index)"
              filterable>
              <el-option v-for="product in products" :key="product.productid" :value="product.productid"
                :label="product.productname">
                {{ product.productname }}
              </el-option>
            </el-select>

          </el-form-item>
          <!-- 产品总价 -->
          <el-form-item label="产品总价">
            <el-input v-model="productRow.unitprice" type="number" placeholder="请输入产品总价" @input="updateOrderTotal" />
          </el-form-item>

          <!-- 产品数量 -->
          <el-form-item label="产品数量">
            <el-input v-model="productRow.quantity" type="number" placeholder="请输入数量" @input="updateOrderTotal" />
          </el-form-item>
          <el-button type="danger" class="delete-btn" @click="removeProductRow(index)">删除</el-button>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addOrderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddOrder">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
const showorderid = ref(false) // 控制是否显示产品ID列
import { ElMessage } from 'element-plus'; // 使用 Element Plus 的消息提示组件


interface Product {
  ordetailid: string
  orderid: string
  productid: string
  productname: string
  quantity: number
  unitprice: number

}

interface ProductRow {
  productId: string | null; // 存储产品 ID
  product: Product | null; // 存储产品对象
  unitprice: number | null;
  quantity: number | null;
}


interface Order {
  orderid: string
  orderparid: string
  orderparname: string
  ordertotalamount: number
  orderdate: string
  selectedProducts: ProductRow[]
}

// 获取产品列表
const getProducts = async () => {
  try {
    const response = await api.post('/products/getAll'); // 调用后端接口
    products.value = response.data; // 将返回的数据赋值给响应式变量
  } catch (error) {
    console.error('获取产品列表失败:', error);
  }
};

// const products: Product[] = [
//   { id: '1', name: '羊头', factory: '羊场', price: 100 },
//   { id: '2', name: '羊蹄', factory: '樊城', price: 150 },
//   { id: '3', name: '羊脑', factory: '发货', price: 200 },
//   { id: '4', name: '羊肚子', factory: 'aa', price: 250 },
//   { id: '5', name: '羊肉', factory: 'aaa', price: 300 },
// ]

const totalAmount = computed(() => {
  return currentPageData.value.reduce((sum, order) => {
    const amount = Number(order.ordertotalamount) || 0; // 转换为数字，默认值为 0
    return sum + amount;
  }, 0).toFixed(2); // 保留两位小数
});

const removeProductRow = (index: number) => {
  // 删除指定索引的产品行
  newOrder.value.selectedProducts.splice(index, 1);
  updateOrderTotal(); // 更新订单总金额
};
const searchDateRange = ref<string[] | null>(null);




const products = ref<Product[]>([]); // 从后端动态获取数据

const customers = ref<Customer[]>([])

interface Customer {
  partnerid: string
  partnername: string
}

const handleCustomerSelect = (value: string) => {
  // 根据客户名称找到对应的客户ID并赋值
  const selectedCustomer = customers.value.find(customer => customer.partnername === value)
  if (selectedCustomer) {
    newOrder.value.orderparid = selectedCustomer.partnerid  // 将客户ID赋给 orderparid
  }
}

//搜索功能
const resetSearchFilters = () => {
  searchQuery.value = ''; // 清空客户名称搜索框
  searchDateRange.value = null; // 清空日期范围
  getOrders(); // 调用 API 获取全部订单
};


// 获取客户数据
const getCustomers = async () => {
  try {
    const response = await api.post('/partners/getAll', { searchQuery: searchQuery.value }) // 获取所有合作方
    customers.value = response.data // 更新响应式数组，确保页面会重新渲染
  } catch (error) {
    console.error('获取合作方数据失败:', error)
  }
};

const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dialogTableVisible = ref(false)
const dialogCurrentPage = ref(1)
const addOrderDialogVisible = ref(false)
// const orderDetailData: Product[] = []  // 初始化为空数组
const orderDetailData = ref<Product[]>([]); // 将 orderDetailData 声明为响应式数组
import { ElMessageBox } from 'element-plus';


// 维护客户列表

// 订单列表数据
const orderList = ref<Order[]>([])

const newOrder = ref<Order>({
  orderid: '',
  orderparid: '',
  orderparname: '',
  ordertotalamount: 0,
  orderdate: '',
  selectedProducts: [
    {
      productId: null,
      product: null, // 初始化为 null
      unitprice: null,
      quantity: null,
    },
  ],
});


const form = ref()

defineExpose({ form })

// 获取订单数据
const getOrders = async () => {
  try {
    const response = await api.post('/orders/getsamday', { searchQuery: searchQuery.value })
    // console.log(response.data)
    orderList.value = response.data // 更新响应式数据，确保页面渲染
  } catch (error) {
    console.error('获取订单数据失败:', error)
  }
}

// 获取订单详细数据
const getOrderDetails = async (orderid: string) => {
  try {
    const OrderDetail = { orderid: parseInt(orderid, 10) };
    const response = await api.post('/ordersdetail/getByOrderId', OrderDetail);
    console.log('Order details fetched:', response.data);

    // 确保返回数据是数组
    if (Array.isArray(response.data)) {
      orderDetailData.value = response.data;
    } else {
      console.error('API 返回的数据不是数组:', response.data);
      orderDetailData.value = [];
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    orderDetailData.value = [];
  }
};


// 计算过滤后的数据
const filteredData = computed(() => {
  return orderList.value;
});




const addProductRow = () => {
  newOrder.value.selectedProducts.push({
    product: null, // 确保包含 product 属性
    productId: null,
    unitprice: 0,
    quantity: 1,
  });
};



// 计算当前页数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const openAddOrderDialog = () => {
  addOrderDialogVisible.value = true
}

const handleAddOrder = async () => {
  // 校验表单
  form.value?.validate(async (valid: boolean) => {
    if (!valid) {
      console.error('表单校验未通过');
      return;
    }
    // 自定义校验逻辑
    if (!newOrder.value.orderparname) {
      alert('请选择客户名称');
      return;
    }

    if (!newOrder.value.orderdate) {
      alert('请选择订单日期');
      return;
    }

    // 自定义校验逻辑
    if (newOrder.value.selectedProducts.length === 0) {
      alert('请至少添加一个产品');
      return;
    }

    for (const productRow of newOrder.value.selectedProducts) {
      if (!productRow.product) {
        alert('请确保所有产品都已选择');
        return;
      }
      if (!productRow.unitprice || productRow.unitprice <= 0) {
        alert('产品总价必须为正数');
        return;
      }
      if (!productRow.quantity || productRow.quantity <= 0) {
        alert('产品数量必须为正数');
        return;
      }
    }

    // 整理需要发送的订单数据
    const orderData = {
      order: {
        orderid: newOrder.value.orderid,
        orderparid: newOrder.value.orderparid,
        orderparname: newOrder.value.orderparname,
        orderdate: formatDate(newOrder.value.orderdate),
        ordertotalamount: newOrder.value.ordertotalamount,
      },
      orderDetails: newOrder.value.selectedProducts.map((productRow) => ({
        productid: productRow.product?.productid,
        productname: productRow.product?.productname,
        quantity: productRow.quantity,
        unitprice: productRow.unitprice,
        orderdate: formatDate(newOrder.value.orderdate),
        orderparid: newOrder.value.orderparid,
        orderparname: newOrder.value.orderparname,
      })),
    };
    console.log(orderData);
    try {
      // 发送订单数据到后端
      const response = await api.post('/orders/addall', orderData);
      console.log('订单新增成功:', response.data);
      // 显示成功消息
      ElMessage({
        message: '订单新增成功！',
        type: 'success',
      });
      // 成功后关闭对话框并清空表单
      addOrderDialogVisible.value = false;
      resetOrderForm();

      // 刷新订单列表
      getOrders();
    } catch (error: any) { // 将 error 类型设置为 any，直接访问其属性
      console.error('订单新增失败:', error);

      const errorMessage = error.response?.data || '订单新增失败，发生未知错误';

      // 显示错误消息
      ElMessage({
        message: errorMessage,
        type: 'error',
        duration: 5000, // 持续时间（毫秒）
      });
    }
  });
};



function formatDate(dateStr: string): string {
  const date = new Date(dateStr); // 解析 ISO 8601 格式的日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  const day = String(date.getDate()).padStart(2, '0'); // 日期格式化为2位数
  return `${year}-${month}-${day}`;
}
const resetOrderForm = () => {
  newOrder.value = {
    orderid: '',
    orderparid: '',
    orderparname: '',
    ordertotalamount: 0,
    orderdate: '',
    selectedProducts: [
      {
        productId: null,
        product: null,
        unitprice: null,
        quantity: null,
      },
    ],
  };
};


const dialogCurrentPageData = computed(() => {
  const start = (dialogCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  // 调用 slice 方法前确保 orderDetailData.value 是数组
  return Array.isArray(orderDetailData.value)
    ? orderDetailData.value.slice(start, end)
    : [];
});


const handleDialogPageChange = (page: number) => {
  dialogCurrentPage.value = page
}

const handleSearch = async () => {
  try {
    if (
      (!searchDateRange.value || searchDateRange.value.length === 0) &&
      (!searchQuery.value || searchQuery.value.trim() === '')
    ) {
      ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return;
    }

    // 格式化日期范围
    const startDate = searchDateRange.value ? searchDateRange.value[0] : '';
    const endDate = searchDateRange.value ? searchDateRange.value[1] : '';

    // 构造查询条件
    const searchCriteria = {
      startDate: startDate ? formatDate(startDate) : null,
      endDate: endDate ? formatDate(endDate) : null,
      orderparname: searchQuery.value || null, // 客户名称
    };

    console.log('查询条件:', searchCriteria);

    // 调用后端接口
    const response = await api.post('/orders/summary', searchCriteria);

    console.log('搜索结果:', response.data);

    // 更新订单数据
    orderList.value = response.data || [];
    currentPage.value = 1; // 重置到第一页

    // 如果没有数据，显示提示
    if (orderList.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
  } catch (error) {
    console.error('搜索订单失败:', error);
    ElMessage({
      message: '搜索订单失败，请稍后再试。',
      type: 'error',
    });
  }
};


const openOrderDetailsDialog = (orderId: string) => {
  getOrderDetails(orderId) // 打开订单详情
  dialogTableVisible.value = true
}

const removeProductFromDialog = async (orderDetailId: string) => {
  if (window.confirm('确定要删除这条订单详情吗？')) {
    try {
      // 调用后端删除 API，传递订单详情编号
      const OrderDetail = {

        ordetailid: parseInt(orderDetailId, 10)
      }
      console.log(OrderDetail);
      const response = await api.post('/ordersdetail/delete', OrderDetail);

      console.log('删除成功:', response.data);

      // 如果后端删除成功，从本地数组中移除对应数据
      orderDetailData.value = orderDetailData.value.filter(
        (detail) => detail.ordetailid !== orderDetailId
      );
    } catch (error) {
      console.error('删除订单详情失败:', error);
    }
  }
};


const updateOrderTotal = () => {
  const total = newOrder.value.selectedProducts.reduce((sum, productRow) => {
    if (productRow.unitprice) { // 只考虑 unitprice，不乘以 quantity
      const unitPrice = Number(productRow.unitprice) || 0;

      return sum + unitPrice;
    }
    return sum;
  }, 0);
  newOrder.value.ordertotalamount = Number(total.toFixed(2)); // 更新订单总金额
};


// 删除订单时确认
const confirmDeleteOrder = async (orderId: string) => {
  if (window.confirm('确定要删除这个订单吗？')) {
    try {
      // 将参数名改为 'id'
      const response = await api.post('/orders/delete', null, {
        params: { orderId: orderId }  // 传递 'id' 参数
      })
      console.log(response.data)  // 打印返回的消息
      orderList.value = orderList.value.filter(order => order.orderid !== orderId)
      console.log('订单已删除')
    } catch (error) {
      console.error('删除订单失败:', error)
    }
  }
}
const handleProductSelect = (index: number) => {
  const selectedRow = newOrder.value.selectedProducts[index];
  if (selectedRow && selectedRow.productId) {
    const selectedProduct = products.value.find(
      (product) => product.productid === selectedRow.productId
    );
    if (selectedProduct) {
      selectedRow.product = selectedProduct; // 保存完整的产品对象
      selectedRow.unitprice = selectedProduct.unitprice || 0; // 更新单价
      console.log(selectedProduct.productid);
      console.log(selectedProduct.productname);
    }
  }
};



const updateProductId = (index: number, value: string) => {
  const selectedRow = newOrder.value.selectedProducts[index];
  if (selectedRow && selectedRow.product) {
    selectedRow.product.productid = value; // 更新产品 ID
  }
};
const refreshOrderList = () => {
  getOrders(); // 调用获取订单列表的方法
};


// 页面初始化时加载订单数据
onMounted(() => {
  getOrders();
  getCustomers();
  getProducts(); // 加载产品数据

})
</script>


<style scoped>
.orders-page {
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

.product-row .el-form-item {
  flex: 1;
  margin-right: 10px;
}

.product-row .el-button {
  margin-left: 10px;
}

.delete-btn {
  margin-left: 10px;
  align-self: center;
  margin-top: -15px;
}

.el-dialog {
  width: 60%;
}

.dialog-footer {
  text-align: right;
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
