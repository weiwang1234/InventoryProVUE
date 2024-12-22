<template>
    <div class="product-management-page">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>
                <a href="/home/product-management">产品管理</a>
            </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 搜索框 -->
        <el-row class="search-box" style="margin-bottom: 20px;">
            <el-col :span="24">
                <el-input v-model="searchQuery" placeholder="请输入产品名称或编号" clearable suffix-icon="el-icon-search"
                    @input="handleSearch" />
            </el-col>
        </el-row>

        <!-- 新增产品按钮 -->
        <el-button type="primary" @click="openAddProductDialog">新增产品设置</el-button>

        <!-- 产品表格 -->
        <el-table :data="currentPageData" style="width: 100%">
            <el-table-column label="序号" width="80">
                <template v-slot="scope">
                    {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column v-if="showProductId" prop="productid" label="产品ID" />
            <el-table-column prop="productname" label="产品名称" width="180" />
            <el-table-column label="操作" width="200">
                <template v-slot="scope">
                    <el-button type="danger" @click="confirmDeleteProduct(scope.row.productid)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 产品列表分页 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background
            class="pagination" />

        <!-- 新增产品加工设置对话框 -->
        <el-dialog v-model="addProductDialogVisible" title="新增产品加工设置" width="60%">
            <el-form :model="newProduct" ref="form" label-width="100px">
                <!-- 产品名称（选择框） -->
                <el-form-item label="产品名称" :rules="[{ required: true, message: '请选择产品名称', trigger: 'blur' }]">
                    <el-select v-model="newProduct.productid" placeholder="请选择产品" @change="handleProductChange"
                        style="width: 220px;" filterable>
                        <el-option v-for="product in products" :key="product.productid" :label="product.productname"
                            :value="product.productid" />
                    </el-select>
                </el-form-item>

                <!-- 选择产品后，新增一个产品列表 -->
                <el-button type="primary" @click="addProductToList">二次加工配置</el-button>

                <el-table :data="selectedProducts" style="width: 100%" v-if="selectedProducts.length > 0">
                    <!-- 序号列 -->
                    <el-table-column label="序号" width="80">
                        <template v-slot="scope">
                            {{ scope.$index + 1 }}
                        </template>
                    </el-table-column>

                    <!-- 产出产品名称列 -->
                    <!-- 产出产品名称列 -->
                    <el-table-column label="产出产品名称">
                        <template v-slot="scope">
                            <el-select v-model="scope.row.opuputproudctid" placeholder="请选择产出产品"
                                @change="handleOutputProductChange(scope.row)" style="width: 220px;" filterable>
                                <el-option v-for="outputProduct in outputProducts" :key="outputProduct.productid"
                                    :label="outputProduct.productname" :value="outputProduct.productid" />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- 产出类型列 -->
                    <el-table-column label="产出类型">
                        <template v-slot="scope">
                            <el-select v-model="scope.row.outputtype" placeholder="请选择产出类型">
                                <el-option label="按比例" value="1" />
                                <el-option label="按数量" value="2" />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- 产出数量列 -->
                    <el-table-column label="产出数量">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.outputcount" placeholder="请输入产出数量" />
                        </template>
                    </el-table-column>

                    <!-- 操作列 -->
                    <el-table-column label="操作" width="120">
                        <template v-slot="scope">
                            <el-button type="danger" @click="deleteProductFromList(scope.$index)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addProductDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddProduct">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const showProductId = ref(false) // 控制是否显示产品ID列

interface Product {
    productid: string
    productname: string
    productstatus: number // 添加状态字段
}

interface ProductProcessing {
    productid: string
    productname: string
}
interface productprocessingconfigdetail {
    productid: string
    productname: string
    opuputproudctid: string
    opuputproudctname: string
    outputtype: string
    outputcount: string
}


const selectedProducts = ref<productprocessingconfigdetail[]>([
    {
        productid: '', // 默认空的产品ID
        productname: '', // 默认空的产品名称
        opuputproudctid: '', // 默认空的产出产品ID
        opuputproudctname: '', // 默认空的产出产品名称
        outputtype: '', // 默认空的产出类型
        outputcount: '', // 默认空的产出数量
    }
])

const ProductProcessings = ref<ProductProcessing[]>([])  // 这里改为一个空数组，动态获取数据


const products = ref<Product[]>([])  // 这里改为一个空数组，动态获取数据
const outputProducts = ref<Product[]>([])  // 新增：用于存储产出产品列表

const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示条数
const searchQuery = ref('') // 搜索查询内容
const addProductDialogVisible = ref(false) // 控制新增产品对话框显示
const newProduct = ref<Product>({
    productid: '',
    productname: '',
    productstatus: 1 // 默认为1，表示启用
})

const form = ref()

defineExpose({ form })

// 获取产品数据
const getProducts = async () => {
    try {
        const response = await api.post('/products/getAll'); // 调用后端接口
        console.log(response.data)
        products.value = response.data; // 将返回的数据赋值给响应式变量
    } catch (error) {
        console.error('获取产品列表失败:', error);
    }
};

const handleOutputProductChange = (row: productprocessingconfigdetail) => {
    console.log('选中的产出产品ID：', row.opuputproudctid);
    // 可以根据需要做其他的业务逻辑处理，比如更新其他字段
}
// 获取产出产品列表的方法
const getOutputProducts = async () => {
    try {
        const response = await api.post('/output-products/getAll'); // 替换为实际的后端接口
        outputProducts.value = response.data; // 将返回的数据赋值给响应式变量
    } catch (error) {
        console.error('获取产出产品列表失败:', error);
    }
}
// 获取产品加工配置数据
const getProductProcessing = async () => {
    try {
        const response = await api.post('/product-processing-config/getAll', { searchQuery: searchQuery.value })
        ProductProcessings.value = response.data // 更新响应式数组，确保页面会重新渲染
    } catch (error) {
        console.error('获取产品加工配置数据失败:', error)
    }
}

// 计算过滤后的数据
const filteredData = computed(() => {
    if (!searchQuery.value) {
        return ProductProcessings.value
    }
    return ProductProcessings.value.filter(item =>
        item.productname.includes(searchQuery.value) // 根据名称进行搜索
    )
})

// 计算当前页数据
const currentPageData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredData.value.slice(start, end)
})

// 处理产品选择变化
const handleProductChange = (value: string) => {
    console.log('选中的产品ID：', value)
    // 在这里可以执行其他逻辑，比如更新其他字段或请求接口获取更多信息
}

// 页面初始化时加载数据
onMounted(() => {
    getProducts();
    getProductProcessing();
})

// 处理分页切换
const handlePageChange = (page: number) => {
    currentPage.value = page
}

// 处理搜索
const handleSearch = () => {
    currentPage.value = 1
    getProductProcessing() // 调用 API 重新加载数据
}

// 新增产品
const openAddProductDialog = () => {
    addProductDialogVisible.value = true
    getOutputProducts();

}

// 处理新增产品的提交
const handleAddProduct = async () => {
    const isValid = await form.value?.validate()
    if (!isValid) return

    try {
        const response = await api.post('/products/add', newProduct.value) // 调用新增产品接口
        products.value.push(response.data) // 将新数据添加到列表
        addProductDialogVisible.value = false
        newProduct.value = { productid: '', productname: '', productstatus: 1 } // 清空产品数据，状态默认1
    } catch (error) {
        console.error('新增产品失败:', error)
    }
}

// 删除产品时确认
const confirmDeleteProduct = async (productid: string) => {
    if (window.confirm('确定要删除这个产品吗？')) {
        const Product = {
            productid: parseInt(productid, 10),
            productname: '',  // 如果不需要可以留空或提供默认值
            productstatus: '', // 默认状态，或者留空
        }

        try {
            await api.post('/product-processing-config/delete', Product) // 删除产品接口
            getProductProcessing() // 删除后重新获取产品加工配置数据
        } catch (error) {
            console.error('删除失败:', error)
        }
    }
}

// 添加产品到产品列表
const addProductToList = () => {
    // 直接添加一行空的产品配置
    const newProcessing: productprocessingconfigdetail = {
        productid: '',  // 产品ID（可以为空）
        productname: '',  // 产品名称（可以为空）
        opuputproudctid: '',  // 可选产出产品ID
        opuputproudctname: '',  // 可选产出产品名称
        outputtype: '',  // 可选产出类型
        outputcount: '',  // 可选产出数量
    }

    // 将新空行添加到列表
    selectedProducts.value.push(newProcessing)
    // 重置输入框或选择（如果有输入框需要重置）
    newProduct.value = { productid: '', productname: '', productstatus: 1 }
}

// 删除产品从加工配置表格
const deleteProductFromList = (index: number) => {
    selectedProducts.value.splice(index, 1)
}



</script>


<style scoped>
.product-management-page {
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

.el-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
}

.dialog-footer {
    text-align: right;
}
</style>