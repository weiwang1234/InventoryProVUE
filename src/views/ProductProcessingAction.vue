<template>
  <div class="product-processing-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/home/product-list">订单列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索区域 -->
    <el-row class="search-box" style="margin-top: 20px; margin-bottom: 20px;" gutter="10">
      <el-col :span="8" style="text-align: right;">
        <el-date-picker v-model="searchDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" clearable />
      </el-col>
      <el-col :span="4">
        <el-input v-model="searchQuery" placeholder="请输入产品名称" clearable suffix-icon="el-icon-search" />
      </el-col>
      <el-col :span="8">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearchFilters">重置</el-button>
      </el-col>
    </el-row>

    <!-- 产品加工按钮 -->
    <el-button type="primary" style="width: 100%;" @click="handleProcessingClick">产品加工</el-button>

    <!-- 产品加工表格 -->
    <el-table :data="currentPageData" style="width: 100%;">
      <el-table-column label="序号" width="80">
        <template v-slot="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="showorderid" prop="processingid" label="加工id" width="80" />
      <el-table-column v-if="showorderid" prop="productid" label="产品ID" width="80" />
      <el-table-column prop="productname" label="产品名称" width="180" />
      <el-table-column prop="processingdate" label="加工日期" width="180" />

      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button plain @click="openProcessingDetailsDialog(scope.row.processingid)">查看详情</el-button>
          <el-button type="danger" @click="confirmDeleteProcessing(scope.row.processingid)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="detailsDialogVisible" title="查看产品加工详情" width="60%" :modal="true" :lock-scroll="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-table :data="currentDetailsPageData" style="width: 100%; text-align: left;">
        <el-table-column label="产出产品名称" prop="outputproductname" width="180" />
        <el-table-column label="产出数量" prop="outputcount" width="120" />
      </el-table>

      <!-- 分页 -->
      <el-pagination :current-page="detailsCurrentPage" :page-size="detailsPageSize" :total="detailsData.length"
        @current-change="handleDetailsPageChange" layout="total, prev, pager, next, jumper" background
        class="pagination-dialog" />
    </el-dialog>

    <!-- 分页 -->
    <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
      @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background class="pagination" />

    <!-- 产品加工对话框 -->
    <el-dialog v-model="dialogVisible" title="产品加工" width="60%" @close="resetForm" :modal="true" :lock-scroll="false"
      :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="formdd" ref="form" label-width="100px">
        <el-form-item v-if="showorderid" label="产品ID">
          <el-input v-model="formdd.productid" placeholder="请输入产品ID" style="width: 220px;" />
        </el-form-item>

        <!-- 产品名称选择框 -->
        <el-form-item label="产品名称">
          <el-select v-model="formdd.productname" placeholder="请选择产品名称" style="width: 220px;" filterable
            @change="handleProductChange">
            <el-option v-for="product in products" :key="product.productid" :label="product.productname"
              :value="product.productname" />
          </el-select>
        </el-form-item>
        <el-form-item label="加工日期" :rules="[{ required: true, message: '请输入订单日期', trigger: 'blur' }]">
          <el-date-picker v-model="formdd.processingdate" type="date" placeholder="请选择一个日期" />
        </el-form-item>

        <el-form-item label="数量">
          <el-input v-model.number="formdd.quantity" placeholder="请输入数量" type="number" style="width: 220px;" />
        </el-form-item>

        <!-- 自动转化按钮 -->
        <el-button type="success" @click="handleAutoConvert">自动转化</el-button>

        <!-- 新增表格 -->
        <el-table :data="formdd.outputRows" style="width: 100%; text-align: left">
          <el-table-column label="序号" width="80">
            <template v-slot="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>

          <el-table-column v-if="showorderid" prop="productid" label="产品ID" />
          <el-table-column v-if="showorderid" prop="productname" label="产品名称" />
          <el-table-column v-if="showorderid" prop="outputproductid" label="产品ID" />
          <el-table-column prop="outputproductname" label="产品名称" />
          <el-table-column prop="outputtype" label="产出类型">
            <template v-slot="scope">
              <!-- 根据 outputtype 值显示不同的文本 -->
              <span>{{ scope.row.outputtype === '1' ? '比例' : '数量' }}</span>
            </template>
          </el-table-column> <el-table-column label="产出数量">
            <template v-slot="scope">
              <el-input v-model="scope.row.outputcount" placeholder="请输入产出数量" type="number" style="width: 100px;" />
            </template>
          </el-table-column>

          <!-- 新增删除按钮列 -->
          <el-table-column label="操作" width="150">
            <template v-slot="scope">
              <el-button type="danger" @click="deleteRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :disabled="isSubmitting">确定</el-button>
        </div>
      </el-form>
    </el-dialog>


  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api'; // 导入 API 请求方法
import { ElMessageBox } from 'element-plus';

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');  // 搜索框：产品名称
const dialogVisible = ref(false);  // 控制对话框的显示与隐藏
const isSubmitting = ref(false)

interface ProductProcessing {
  processingid: string;
  productid: string;
  productname: string;
  outputcount: string;
  processingdate: string;

}
interface Product {
  productid: string;
  productname: string;
}
interface OutputRow {
  productid: string;
  productname: string;
  outputproductid: string;
  outputproductname: string;
  outputtype: string;
  outputcount: number;
}

interface FormData {
  productid: string;
  productname: string;
  processingdate: string,
  quantity: number;
  outputRows: OutputRow[];
}
const formdd = ref<FormData>({
  productid: '',
  productname: '',
  processingdate: '',
  quantity: 0,
  outputRows: [],  // 初始时有一行
});

const showorderid = ref(false) // 控制是否显示产品ID列

const products = ref<Product[]>([]); // 存储产品列表

const ProductProcessings = ref<ProductProcessing[]>([]); // 存储产品列表
const filteredData = ref<ProductProcessing[]>([]); // 存储经过筛选的数据
const detailsDialogVisible = ref(false);  // 控制查看详情对话框的显示

const searchDateRange = ref<[string, string] | null>(null);

// 计算当前页的数据
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 搜索功能
const handleSearch = async () => {
  try {
    // 如果没有输入查询条件，则提示用户
    if (
      (!searchDateRange.value && (!searchQuery.value || searchQuery.value.trim() === ''))
    ) {
      ElMessageBox.alert('请输入至少一个查询条件！', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
      return; // 如果没有输入查询条件，则直接返回
    }

    const startDateformat = searchDateRange.value && searchDateRange.value[0] ? formatDate(searchDateRange.value[0]) : '';
    const endDateformat = searchDateRange.value && searchDateRange.value[1] ? formatDate(searchDateRange.value[1]) : '';

    console.log(startDateformat)
    console.log(endDateformat)


    // 直接传递查询条件对象给后端
    const searchCriteria = {
      startDate: startDateformat, // 假设 formatDate 用于格式化日期
      endDate: endDateformat,
      name: searchQuery.value,  // 产品名称
    };

    console.log('查询条件:', searchCriteria);

    // 发送请求到后端，直接传递查询条件
    const response = await api.post('/productprocessing/getFilteredProductProcessing', searchCriteria);

    console.log('查询结果:', response.data);

    // 处理返回的数据
    filteredData.value = response.data || [];
    ProductProcessings.value = response.data || [];
    if (ProductProcessings.value.length === 0) {
      ElMessageBox.alert('暂无符合条件的数据，请调整查询条件后重试。', '提示', {
        confirmButtonText: '确定',
        type: 'warning',
      });
    }
    currentPage.value = 1; // 重置到第一页
  } catch (error) {
    console.error('搜索失败:', error);
  }
};

const ProcessingActions = async () => {
  try {
    const response = await api.post('/productprocessing/getAll'); // 假设接口返回产品列表
    ProductProcessings.value = response.data;
    filteredData.value = ProductProcessings.value; // 初始化时显示所有数据
  } catch (error) {
    console.error('获取产品列表失败:', error);
  }
}
// 获取产品列表
onMounted(async () => {
  ProcessingActions()
  getproducts()
});

interface DetailData {
  outputproductname: string;
  outputcount: number;
}

const detailsData = ref<DetailData[]>([]);
// 打开产品加工详情对话框
const openProcessingDetailsDialog = async (processingid: string) => {
  detailsDialogVisible.value = true;

  // 设置请求头为 application/json
  const response = await api.post('/productprocessing/getproductdetail', processingid, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data);
  detailsData.value = response.data;
  detailsCurrentPage.value = 1;  // 重置详情分页
};

const currentDetailsPageData = computed(() => {
  const start = (detailsCurrentPage.value - 1) * detailsPageSize.value;
  const end = detailsCurrentPage.value * detailsPageSize.value;
  return detailsData.value.slice(start, end);
});

const detailsCurrentPage = ref(1);
const detailsPageSize = ref(5);  // 每页显示5条数据
const handleDetailsPageChange = (page: number) => {
  detailsCurrentPage.value = page;
};

// 删除表格行的处理函数
const deleteRow = (index: number) => {
  formdd.value.outputRows.splice(index, 1);  // 删除该行数据
};
// 删除产品加工配置
const confirmDeleteProcessing = async (processingid: string) => {
  await ElMessageBox.confirm('确认删除该产品加工吗？', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })

  try {
    // 调用后端 API
    const response = await api.post('/productprocessing/delete', processingid, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    ProcessingActions()
    console.log('提交成功:', response.data);
    ElMessageBox.alert('删除成功！', '成功', {
      confirmButtonText: '确定',
      type: 'success',

    });
  } catch (error: any) { // 将 error 类型设置为 any，直接访问其属性
    if (error.response && error.response.status === 400) {
      // 处理库存不足的错误，显示提示

      ElMessageBox.alert(error.response.data, '错误', {
        confirmButtonText: '确定',
        type: 'error',

      });
    } else {
      // 其他错误处理
      ElMessageBox.alert('提交失败请联系管理员', '错误', {
        confirmButtonText: '确定',
        type: 'error',

      });
    }
  }



};

// 重置搜索
const resetSearchFilters = () => {
  searchQuery.value = '';
  searchDateRange.value = null;
};

// 处理产品加工按钮点击事件
const handleProcessingClick = () => {
  isSubmitting.value = false; // 设置按钮禁用状态
  dialogVisible.value = true; // 显示对话框
};

// 提交表单
const submitForm = async () => {

  if (!formdd.value.productid) {
    ElMessageBox.alert('请选择产品!', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }

  if (formdd.value.quantity < 1) {
    ElMessageBox.alert('请输入数量！', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }
  if (!formdd.value.processingdate) {
    ElMessageBox.alert('请选择加工日期！', '警告', {
      type: 'warning',
    });
    return;
  }
  if (!formdd.value.processingdate) {
    ElMessageBox.alert('请选择加工日期！', '警告', {
      type: 'warning',
    });
    return;
  }

  // 检查 outputRows 是否为空
  if (formdd.value.outputRows.length === 0) {
    ElMessageBox.alert('请点击自动转化按钮！', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }


  await ElMessageBox.confirm('确认转化产出数据是否正确？', '加工确认', {
    type: 'warning',
    confirmButtonText: '正确',
    cancelButtonText: '重新检查',
  })

  if (isSubmitting.value) return;  // 如果正在提交，则不再执行

  isSubmitting.value = true; // 设置按钮禁用状态


  const productProcessingRequest = {
    productprocessing: {
      productid: formdd.value.productid,
      productname: formdd.value.productname,
      processingdate: formatDate(formdd.value.processingdate),
      quantity: formdd.value.quantity,
    },
    productprocessingdetail: formdd.value.outputRows.map((row: any) => ({
      productid: row.productid,
      productname: row.productname,
      outputproductid: row.outputproductid,
      outputproductname: row.outputproductname,
      outputtype: row.outputtype,
      outputcount: row.outputcount,
    })),
  };

  // 打印请求数据，检查是否符合后端要求
  console.log('提交的产品加工信息:', productProcessingRequest);

  try {


    // 调用后端 API
    const response = await api.post('/productprocessing/add', productProcessingRequest);
    console.log('提交成功:', response.data);
    ProcessingActions()
    dialogVisible.value = false; // 关闭对话框
  } catch (error: any) { // 将 error 类型设置为 any，直接访问其属性
    if (error.response && error.response.status === 400) {
      // 处理库存不足的错误，显示提示

      ElMessageBox.alert(error.response.data, '错误', {
        confirmButtonText: '确定',
        type: 'error',

      });
    } else {
      // 其他错误处理
      ElMessageBox.alert('提交失败请联系管理员', '错误', {
        confirmButtonText: '确定',
        type: 'error',

      });
    }
  }

};

// 重置表单
const resetForm = () => {

};
// 自动转化按钮点击事件
const handleAutoConvert = () => {
  if (!formdd.value.productid) {
    ElMessageBox.alert('请选择产品!', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }

  if (formdd.value.quantity < 1) {
    ElMessageBox.alert('请输入数量！', '警告', {
      type: 'warning',
    });
    return; // 终止后续逻辑
  }



  // 清空现有的 outputRows
  formdd.value.outputRows = [];



  // 根据 productTypeList 生成空行，并赋值
  productTypeList.value.forEach(product => {
    let calculatedOutputCount = product.outputcount || 0;
    if (product.outputtype === '1') {
      calculatedOutputCount = parseFloat((formdd.value.quantity * (product.outputcount || 0)).toFixed(2));
    } else if (product.outputtype === '2') {
      calculatedOutputCount = product.outputcount
    }
    console.log(product)
    formdd.value.outputRows.push({
      productid: product.productid,
      productname: product.productname,
      outputproductid: product.outputproductid,
      outputproductname: product.outputproductname,
      outputtype: product.outputtype || '', // 使用 productTypeList 中的 outputtype
      outputcount: calculatedOutputCount, // 使用计算后的 outputcount
    });
  });
};

// 当选择产品名称时，更新产品ID
const handleProductChange = (selectedProductName: string) => {

  const selectedProduct = products.value.find(product => product.productname === selectedProductName);
  if (selectedProduct) {
    formdd.value.productid = selectedProduct.productid;  // 根据产品名称更新产品ID
  }
  getProductTypes();

};
const getproducts = async () => {
  try {
    const response = await api.post('/productprocessingconfig/getAll', { searchQuery: searchQuery.value }) // 获取所有合作方
    products.value = response.data // 更新响应式数组，确保页面会重新渲染
  } catch (error) {
    console.error('获取产品失败:', error)
  }
};


const productTypeList = ref<any[]>([]);  // 定义一个空的响应式列表
const getProductTypes = async () => {
  try {
    // 获取产品ID并确保其有效
    const productid = parseInt(formdd.value.productid, 10);


    // 检查产品ID是否有效
    if (isNaN(productid)) {
      console.error('Invalid product ID:', formdd.value.productid);
      return;  // 如果无效，提前退出函数
    }

    // 发起请求，传递 productid 参数
    console.log('Product ID:', productid);

    const response = await api.post('/productprocessingconfig/getDetails', null, {
      params: { productid } // 传递查询参数
    });
    console.log(response.data);

    // 更新空数组的值
    productTypeList.value = response.data;  // 假设返回的数据格式是数组

  } catch (error) {
    console.error('获取产品类型数据失败:', error);
  }
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr); // 解析 ISO 8601 格式的日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
  const day = String(date.getDate()).padStart(2, '0'); // 日期格式化为2位数
  return `${year}-${month}-${day}`;
}

</script>


<style scoped>
.product-processing-page {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f9f9f9;
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

.search-box {
  margin-top: 20px;
  margin-bottom: 20px;
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
</style>
