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

    <el-button type="primary" class="add-order-button" @click="openAddOrderDialog">新增订单</el-button>

    <!-- 进货订单表格 -->
    <el-table :data="currentPageData" style="width: 100%; margin-top: 0;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showorderid" prop="orderid" label="订单编号" width="150" />
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
    <!-- 详情 -->
    <el-dialog v-model="dialogTableVisible" title="订单详情" width="60%" @close="refreshOrderList">
      <el-table :data="dialogCurrentPageData" style="width: 100%">
        <el-table-column v-if="showorderid" prop="orderid" label="订单编号" width="180" />
        <el-table-column v-if="showorderid" prop="ordetailid" label="订单详情编号" width="180" />
        <el-table-column v-if="showorderid" prop="productid" label="产品ID" width="180" />
        <el-table-column prop="productname" label="产品名称" width="180" />
        <el-table-column prop="unitprice" label="产品总价" width="180">
          <template v-slot="scope">
            {{ parseFloat(scope.row.unitprice).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="购买数量" width="180" />
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

        <el-button type="success" @click="addProductRow">增加产品</el-button>

        <div v-for="(productRow, index) in newOrder.selectedProducts" :key="index" class="product-row">
          <!-- 隐藏的产品ID列 -->
          <el-form-item label="产品ID" class="form-item-inline" style="display: none;">
            <el-input v-model="productRow.productId" readonly />
          </el-form-item>

          <!-- 产品名称列 -->
          <el-form-item label="产品名称" class="form-item-inline">
            <el-select v-model="productRow.productId" placeholder="请选择产品" @change="handleProductSelect(index)"
              filterable>
              <el-option v-for="product in products" :key="product.productid" :value="product.productid"
                :label="product.productname">
                {{ product.productname }}
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 产品总价 -->
          <el-form-item label="产品总价" class="form-item-inline">
            <el-input v-model="productRow.unitprice" type="number" placeholder="请输入产品总价" @input="updateOrderTotal" />
          </el-form-item>

          <!-- 产品数量 -->
          <el-form-item label="产品数量" class="form-item-inline">
            <el-input v-model="productRow.quantity" type="number" placeholder="请输入数量" @input="updateOrderTotal" />
          </el-form-item>

          <!-- 删除按钮 -->
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
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { ElMessageBox } from 'element-plus';

interface PurchaseOrder {
  orderid: string;
  orderparname: string;
  ordertotalamount: number;
  orderdate: string;
}

interface OrderDetail {
  orderid: string;
  ordetailid: string;
  productid: string;
  productname: string;
  unitprice: number;
  quantity: number;
}
const showorderid = ref(false) // 控制是否显示产品ID列
const dialogTableVisible = ref(false);
const dialogCurrentPage = ref(1);
const orderDetailData = ref<OrderDetail[]>([]);
const dialogCurrentPageData = computed(() => {
  const start = (dialogCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return orderDetailData.value.slice(start, end);
});
// 查看订单详情
const viewDetails = async (orderid: string) => {
  try {
    // 使用动态路径参数传递订单ID
    const response = await api.post(`/purchaseorderdetails/getorderid/${orderid}`);
    orderDetailData.value = response.data || [];
    dialogTableVisible.value = true; // 打开对话框
  } catch (error) {
    console.error('获取订单详情失败:', error);
  }
};


const removeProductFromDialog = async (ordetailid: string) => {
  try {
    // 使用路径参数传递 ordetailid
    await api.post(`/purchaseorderdetails/delete/${ordetailid}`);

    // 从前端数据中移除已删除的产品
    orderDetailData.value = orderDetailData.value.filter((item) => item.ordetailid !== ordetailid);

    // 提示删除成功
    ElMessageBox.alert(`订单删除成功！`, '成功', {
      confirmButtonText: '确定',
      type: 'success',
    });
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      // 捕获库存不足错误，并提示具体的错误信息
      ElMessageBox.alert(error.response.data, '库存不足', {
        confirmButtonText: '确定',
        type: 'error',
      });
    } else {
      console.error('删除产品失败:', error);

      // 提示其他错误
      ElMessageBox.alert('删除产品时发生错误，请稍后重试！', '错误', {
        confirmButtonText: '确定',
        type: 'error',
      });
    }
  }
};

// 详情对话框分页切换
const handleDialogPageChange = (page: number) => {
  dialogCurrentPage.value = page;
};

// 刷新订单列表
const refreshOrderList = () => {
  if (searchQuery.value || (searchDateRange.value && searchDateRange.value.length === 2)) {
    // 如果搜索框有值或者选择了日期范围，则重新加载搜索的数据列表
    handleSearch();
  } else {
    // 否则加载全部数据
    getpurchaseorderlist();
  }
};

const purchaseOrders = ref<PurchaseOrder[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const searchDateRange = ref<[string, string] | null>(null);

// 获取进货订单数据
const getPurchaseOrders = async () => {
  try {

    const searchpama = {
      customerName: searchQuery.value,
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
  getCustomers(); // 加载客户信息
  getProducts(); // 加载产品信息


});

// 分页切换
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 查询
const handleSearch = async () => {
  if (
    !searchQuery.value &&
    (!searchDateRange.value || searchDateRange.value.length !== 2) // 检查数组长度是否为2
  ) {
    ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
      confirmButtonText: '确定',
      type: 'warning',

    });
    return;
  }

  currentPage.value = 1;
  try {

    await getPurchaseOrders(); // 获取数据
    if (purchaseOrders.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
  } catch (error) {
    console.error('查询数据时出现错误:', error);
  }
};

// 重置
const resetSearchFilters = () => {
  searchQuery.value = '';
  searchDateRange.value = null;
  currentPage.value = 1;
};



// 删除订单
const deleteOrder = async (orderid: string) => {
  try {
    // 使用路径参数传递 orderid
    await api.post(`/purchaseorders/delete/${orderid}`);
    console.log('订单删除成功:', orderid);

    // 使用 ElMessageBox.alert 提示删除成功
    ElMessageBox.alert(`订单删除成功！`, '成功', {
      confirmButtonText: '确定',
      type: 'success',
    });

    getPurchaseOrders(); // 刷新订单列表
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      // 使用 ElMessageBox.alert 提示库存不足错误
      ElMessageBox.alert(error.response.data, '提示', {
        confirmButtonText: '确定',
        type: 'error',
      });
    } else {
      console.error('删除订单失败:', error);

      // 使用 ElMessageBox.alert 提示严重错误
      ElMessageBox.alert('删除订单时发生错误，请稍后重试！', '错误', {
        confirmButtonText: '确定',
        type: 'error',
      });
    }
  }
};




// 格式化订单金额
const formatAmount = (row: PurchaseOrder) => {
  return row.ordertotalamount.toFixed(2);
};


//新增订单------------------------------------------------------------------------
const addOrderDialogVisible = ref(false);
const newOrder = ref({
  orderparid: '',
  orderparname: '',
  orderdate: '',
  ordertotalamount: 0,
  selectedProducts: [] as ProductRow[],
});
interface Customer {
  partnerid: string;
  partnername: string;
}

interface Product {
  productid: string;
  productname: string;
  unitprice: number;
}

interface ProductRow {
  productId: string;
  productname: string; // 新增字段：产品名称
  unitprice: number;
  quantity: number;
}

const customers = ref<Customer[]>([]);
const products = ref<Product[]>([]);
const getCustomers = async () => {
  try {
    const response = await api.post('/partners/getpurchaseAll'); // 调用后端接口获取客户信息
    customers.value = response.data; // 更新客户信息
  } catch (error) {
    console.error('获取客户信息失败:', error);
  }
};

const getProducts = async () => {
  try {
    const response = await api.post('/products/getAll'); // 调用后台接口获取产品列表
    products.value = response.data; // 更新响应式变量 products
  } catch (error) {
    console.error('获取产品列表失败:', error);
  }
};


const handleCustomerSelect = (value: string) => {
  const selectedCustomer = customers.value.find(customer => customer.partnername === value);
  newOrder.value.orderparid = selectedCustomer ? selectedCustomer.partnerid : '';
};



const addProductRow = () => {
  newOrder.value.selectedProducts.push({
    productId: '',
    unitprice: 0,
    quantity: 0,
    productname: '',

  });
};

const removeProductRow = (index: number) => {
  newOrder.value.selectedProducts.splice(index, 1);
  updateOrderTotal();
};

const handleProductSelect = (index: number) => {
  const selectedProduct = products.value.find(
    product => product.productid === newOrder.value.selectedProducts[index].productId
  );
  if (selectedProduct) {
    newOrder.value.selectedProducts[index].productname = selectedProduct.productname; // 设置产品名称
    newOrder.value.selectedProducts[index].unitprice = selectedProduct.unitprice || 0;
  }
  updateOrderTotal();
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


const emptyProductRow = (): ProductRow => ({
  productId: '',
  unitprice: 0,
  quantity: 0,
  productname: ''// 新增字段：产品名称

});
const openAddOrderDialog = () => {
  newOrder.value.selectedProducts = [emptyProductRow()]; // 默认只添加一条空白产品行
  addOrderDialogVisible.value = true; // 打开对话框
};


const handleAddOrder = async () => {
  if (!newOrder.value.orderparid || !newOrder.value.orderparname) {
    ElMessageBox.alert('请选择完整的客户信息！', '提示', {
      confirmButtonText: '确定',
      type: 'warning',
    });
    return;
  }

  if (!newOrder.value.orderdate) {
    ElMessageBox.alert('请选择订单日期！', '提示', {
      confirmButtonText: '确定',
      type: 'warning',
    });
    return;
  }

  if (newOrder.value.selectedProducts.length === 0) {
    ElMessageBox.alert('请至少添加一个产品！', '提示', {
      confirmButtonText: '确定',
      type: 'warning',
    });
    return;
  }

  for (const [index, productRow] of newOrder.value.selectedProducts.entries()) {
    if (!productRow.productId) {
      ElMessageBox.alert(`第 ${index + 1} 行未选择产品！`, '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return;
    }
    if (!productRow.unitprice || productRow.unitprice <= 0) {
      ElMessageBox.alert(`第 ${index + 1} 行的产品总价必须为正数！`, '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return;
    }
    if (!productRow.quantity || productRow.quantity <= 0) {
      ElMessageBox.alert(`第 ${index + 1} 行的产品数量必须为正数！`, '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return;
    }
  }

  try {
    const formattedOrderDate = formatDate(newOrder.value.orderdate);

    const formattedOrder = {
      purchaseorder: {
        orderparid: newOrder.value.orderparid,
        orderparname: newOrder.value.orderparname,
        ordertotalamount: newOrder.value.ordertotalamount,
        orderdate: formattedOrderDate,
      },
      purchaseorderdetaillist: newOrder.value.selectedProducts.map(productRow => ({
        productid: productRow.productId,
        productname: productRow.productname,
        quantity: productRow.quantity,
        unitprice: productRow.unitprice,
        orderdate: formattedOrderDate,
      })),
    };
    console.log(formattedOrder)
    const response = await api.post('/purchaseorders/add', formattedOrder);

    if (response.status === 200) {
      ElMessageBox.alert('订单新增成功！', '提示', {
        confirmButtonText: '确定',
        type: 'success',
      });

      addOrderDialogVisible.value = false;
      newOrder.value = {
        orderparid: '',
        orderparname: '',
        orderdate: '',
        ordertotalamount: 0,
        selectedProducts: [],
      };

      searchQuery.value = '';
      searchDateRange.value = null;

      getpurchaseorderlist();
    } else {
      ElMessageBox.alert('新增订单失败，请重试！', '错误', {
        confirmButtonText: '确定',
        type: 'error',
      });
    }
  } catch (error) {
    console.error('新增订单失败:', error);
    ElMessageBox.alert('新增订单时发生错误，请稍后重试！', '错误', {
      confirmButtonText: '确定',
    });
  }
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

.add-order-button {
  display: block;
  width: 100%;
  /* 与表格宽度一致 */
  margin-bottom: 0;
  /* 紧贴数据表格 */
  border-radius: 0;
  /* 无圆角 */
  text-align: center;
  font-weight: bold;
  /* 使按钮文字更突出 */
}

.product-row {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 控制表单项之间的间距 */
  margin-bottom: 10px;
  /* 产品行之间的间距 */
}

.form-item-inline {
  flex: 1;
  /* 每个表单项占据相等宽度 */
  margin-bottom: 0;
  /* 移除默认的垂直间距 */
}

.delete-btn {
  margin-left: 10px;
  align-self: flex-start;
  /* 删除按钮与表单项顶部对齐 */
}
</style>
