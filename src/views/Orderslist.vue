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
    <el-row class="search-box" style="margin-bottom: 20px;">
      <el-col :span="24">
        <el-input v-model="searchQuery" placeholder="请输入订单编号或客户编号" clearable suffix-icon="el-icon-search"
          @input="handleSearch" />
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

      <el-table-column prop="orderparid" label="客户编号" width="180" />
      <el-table-column prop="orderparname" label="客户名称" width="100" />
      <el-table-column prop="ordertotalamount" label="订单金额" width="180" />
      <el-table-column prop="orderdate" label="订单日期" width="180" />
      <el-table-column label="操作" width="200">
        <template v-slot="scope">

          <el-button plain @click="openOrderDetailsDialog(scope.row.orderid)">查看详情</el-button>
          <el-button type="danger" @click="confirmDeleteOrder(scope.row.orderid)">删除</el-button>
        </template>

      </el-table-column>
    </el-table>

    <!-- 订单列表分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 订单详情对话框 -->
    <el-dialog v-model="dialogTableVisible" title="订单详情" width="60%">
      <el-table :data="dialogCurrentPageData" style="width: 100%">

        <el-table-column v-if="showorderid" prop="orderid" label="订单编号" width="180" />
        <el-table-column v-if="showorderid" prop="ordetailid" label="订单详情编号" width="180" />
        <el-table-column v-if="showorderid" prop="productid" label="产品ID" width="180" />
        <el-table-column prop="productname" label="产品名称" width="180" />
        <el-table-column prop="unitprice" label="产品单价" width="180" />
        <el-table-column prop="quantity" label="购买数量" width="180" />

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
        <el-form-item label="客户名称" :rules="[{ required: true, message: '请输入客户编号', trigger: 'blur' }]">
          <el-input v-model="newOrder.orderparname" />
        </el-form-item>




        <el-form-item label="订单日期" :rules="[{ required: true, message: '请输入订单日期', trigger: 'blur' }]">
          <el-date-picker v-model="newOrder.orderdate" type="date" placeholder="请选择一个日期" />

        </el-form-item>

        <el-form-item label="总金额" :rules="[{ required: true, message: '请输入总金额', trigger: 'blur' }]">
          <el-input v-model="newOrder.ordertotalamount" />
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

          <!-- 隐藏产品名称 -->
          <el-form-item label="产品名称" style="display: none;">
            <el-input :model-value="productRow.product?.productname"
              @input="(value: string) => updateProductName(index, value)" disabled />
          </el-form-item>

          <!-- 选择产品 -->
          <el-form-item label="选择产品">
            <el-select v-model="productRow.product" placeholder="请选择产品" @change="handleProductSelect(index)" filterable>
              <el-option v-for="product in products" :key="product.productid" :value="product"
                :label="`${product.productname}`" />
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


interface Product {
  ordetailid: string
  orderid: string
  productid: string
  productname: string
  quantity: number
  unitprice: number

}

interface ProductRow {
  product: Product | null; // 添加 product 属性
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

// const products: Product[] = [
//   { id: '1', name: '羊头', factory: '羊场', price: 100 },
//   { id: '2', name: '羊蹄', factory: '樊城', price: 150 },
//   { id: '3', name: '羊脑', factory: '发货', price: 200 },
//   { id: '4', name: '羊肚子', factory: 'aa', price: 250 },
//   { id: '5', name: '羊肉', factory: 'aaa', price: 300 },
// ]

const products = ref([
  { productid: '1', productname: '羊头' },
  { productid: '2', productname: '羊尾' },
]);


const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const dialogTableVisible = ref(false)
const dialogCurrentPage = ref(1)
const addOrderDialogVisible = ref(false)
// const orderDetailData: Product[] = []  // 初始化为空数组
const orderDetailData = ref<Product[]>([]); // 将 orderDetailData 声明为响应式数组

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
    const response = await api.post('/orders/getAll', { searchQuery: searchQuery.value })
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
  if (!searchQuery.value) {
    return orderList.value
  }
  return orderList.value.filter(item =>
    item.orderparname.includes(searchQuery.value)
  )
})


const addProductRow = () => {
  newOrder.value.selectedProducts.push({
    product: null, // 确保包含 product 属性
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

const handleAddOrder = () => {
  const isValid = form.value?.validate()
  if (!isValid) return

  newOrder.value.selectedProducts.forEach((productRow) => {
    if (productRow.product) {
      // 处理订单保存逻辑
    }
  })

  addOrderDialogVisible.value = false
}

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

const handleSearch = () => {
  currentPage.value = 1
  getOrders() // 调用 API 重新加载订单数据
}

const openOrderDetailsDialog = (orderId: string) => {
  getOrderDetails(orderId) // 打开订单详情
  dialogTableVisible.value = true
}

const removeProductFromDialog = async (orderDetailId: string) => {
  if (window.confirm('确定要删除这条订单详情吗？')) {
    try {
      // 调用后端删除 API，传递订单详情编号
      const OrderDetail = { orderDetailId: parseInt(orderDetailId, 10) }
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
    if (productRow.unitprice && productRow.quantity) {
      return sum + productRow.unitprice * productRow.quantity;
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
  if (selectedRow && selectedRow.product) {
    selectedRow.unitprice = selectedRow.product.unitprice || 0; // 更新产品总价
  }
};

const updateProductName = (index: number, value: string) => {
  const selectedRow = newOrder.value.selectedProducts[index];
  if (selectedRow && selectedRow.product) {
    selectedRow.product.productname = value; // 更新产品名称
  }
};

const updateProductId = (index: number, value: string) => {
  const selectedRow = newOrder.value.selectedProducts[index];
  if (selectedRow && selectedRow.product) {
    selectedRow.product.productid = value; // 更新产品 ID
  }
};


// 页面初始化时加载订单数据
onMounted(() => {
  getOrders()
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
</style>
