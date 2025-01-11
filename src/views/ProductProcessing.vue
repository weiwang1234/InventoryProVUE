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
            <el-table-column v-if="showProductId" prop="processingconfigid" label="产品ID" />
            <el-table-column v-if="showProductId" prop="productid" label="产品ID" />
            <el-table-column prop="productname" label="产品名称" width="180" />
            <el-table-column label="操作" width="200">
                <template v-slot="scope">
                    <el-button @click="viewProductDetails(scope.row)">查看详情</el-button>
                    <el-button type="danger" @click="confirmDeleteProduct(scope.row.processingconfigid)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 产品列表分页 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background
            class="pagination" />

        <!-- 查看产品详情对话框 -->
        <el-dialog v-model="productDetailsDialogVisible" title="产品详情" width="60%" @close="refreshProductProcessing"
            :modal="true" :lock-scroll="false" :close-on-click-modal="false" :close-on-press-escape="false">
            <el-button type="primary" @click="openAddViewProductDialog">新增产品设置</el-button>

            <el-table :data="currentPageDetailsData" style="width: 100%">
                <el-table-column label="序号" width="80">
                    <template v-slot="scope">
                        {{ (detailsCurrentPage - 1) * detailsPageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column v-if="showProductId" label="产品id" prop="productid" />
                <el-table-column v-if="showProductId" label="产品名称" prop="productname" />

                <el-table-column v-if="showProductId" label="明细id" prop="configdetailid" />
                <el-table-column label="产出产品名称" prop="outputproductname" />
                <el-table-column label="产出类型">
                    <template v-slot="scope">
                        <span>{{ scope.row.outputtype === '1' ? '比例' : (scope.row.outputtype === '2' ? '数量' : '未知')
                            }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="产出数量" prop="outputcount" />

                <!-- 新增操作列，包含删除按钮 -->
                <el-table-column label="操作" width="200">
                    <template v-slot="scope">
                        <el-button @click="editProductDetails(scope.row)">编辑</el-button>
                        <el-button type="danger" @click="confirmDeleteviews(scope.row.configdetailid)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination :current-page="detailsCurrentPage" :page-size="detailsPageSize"
                :total="currentProductDetails.length" @current-change="handleDetailsPageChange"
                layout="total, prev, pager, next, jumper" background class="pagination-dialog" />

        </el-dialog>

        <el-dialog v-model="editProductDialogVisible" title="编辑产品详情" width="60%" :modal="true" :lock-scroll="false"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form :model="editedProduct" ref="form" label-width="100px">

                <!-- 新增的明细ID -->
                <el-form-item label="明细ID" style="width: 260px;">
                    <el-input v-model="editedProduct.configdetailid" readonly placeholder="明细ID" />
                </el-form-item>
                <el-form-item label="产出产品名称" style="width: 260px;">
                    <el-input v-model="editedProduct.outputproductname" readonly placeholder="请输入产出产品名称" />
                </el-form-item>
                <el-form-item label="产出类型" style="width: 260px;">
                    <el-select v-model="editedProduct.outputtype" placeholder="请选择产出类型">
                        <el-option label="按比例" value="1" />
                        <el-option label="按数量" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="产出数量" style="width: 260px;">
                    <el-input v-model="editedProduct.outputcount" placeholder="请输入产出数量" />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editProductDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveEditedProduct">保存</el-button>
            </span>
        </el-dialog>

        <!-- 新增产品加工设置对话框 -->
        <el-dialog v-model="addProductDialogVisible" title="新增产品加工设置" width="60%" :modal="true" :lock-scroll="false"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form :model="newProduct" ref="form" label-width="100px">
                <!-- 产品名称（选择框） -->
                <el-form-item label="产品ID" v-if="showProductId">
                    <el-input v-model="newProduct.productid" :readonly="productReadonly" style="width: 220px;" />
                </el-form-item>
                <el-form-item label="产品名称" :rules="[{ required: true, message: '请选择产品名称', trigger: 'blur' }]">
                    <el-select v-model="newProduct.productid" :disabled="productReadonly" placeholder="请选择产品"
                        @change="handleProductChange" style="width: 220px;" filterable>
                        <el-option v-for="product in products" :key="product.productid" :label="product.productname"
                            :value="product.productid" />
                    </el-select>
                </el-form-item>

                <!-- 选择产品后，新增一个产品列表 -->
                <el-button type="success" @click="addProductToList">增加产产品</el-button>

                <el-table :data="selectedProducts" style="width: 100%" v-if="selectedProducts.length > 0">
                    <!-- 序号列 -->
                    <el-table-column label="序号" width="60">
                        <template v-slot="scope">
                            {{ scope.$index + 1 }}
                        </template>
                    </el-table-column>

                    <!-- 产品ID列 -->
                    <el-table-column v-if="showProductId" label="产品ID">
                        <template v-slot="scope">
                            <el-input v-model="scope.row.outputproductid" placeholder="产品ID" readonly
                                style="width: 150px;" />
                        </template>
                    </el-table-column>

                    <!-- 产出产品名称列 -->
                    <el-table-column label="产出产品名称">
                        <template v-slot="scope">
                            <el-select v-model="scope.row.outputproductname" placeholder="请选择产出产品"
                                @change="(value: string) => handleOutputProductChange(scope.row, value)"
                                style="width: 150px;" filterable>
                                <el-option v-for="outputProduct in outputProducts" :key="outputProduct.productid"
                                    :label="outputProduct.productname" :value="outputProduct.productname" />
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
import { ref, computed, onMounted, watch } from 'vue'

import api from '../api'
import { ElMessage } from 'element-plus';
import { ElMessageBox } from 'element-plus';



const showProductId = ref(false) // 控制是否显示产品ID列

interface Product {
    productid: string
    productname: string
    productstatus: number // 添加状态字段
}

interface ProductProcessing {
    processingconfigid: string
    productid: string
    productname: string
}
interface productprocessingconfigdetail {
    configdetailid: string
    productid: string
    productname: string
    outputproductid: string
    outputproductname: string
    outputtype: string
    outputcount: string
}


const selectedProducts = ref<productprocessingconfigdetail[]>([
    {
        configdetailid: '',
        productid: '', // 默认空的产品ID
        productname: '', // 默认空的产品名称
        outputproductid: '', // 默认空的产出产品ID
        outputproductname: '', // 默认空的产出产品名称
        outputtype: '', // 默认空的产出类型
        outputcount: '', // 默认空的产出数量
    }
])

const ProductProcessings = ref<ProductProcessing[]>([])  // 这里改为一个空数组，动态获取数据


const products = ref<Product[]>([])  // 这里改为一个空数组，动态获取数据
const outputProducts = ref<Product[]>([])  // 新增：用于存储产出产品列表
const currentProductDetails = ref<productprocessingconfigdetail[]>([]) // 当前产品的详情数据

const detailsCurrentPage = ref(1)
const detailsPageSize = ref(10)

const editProductDialogVisible = ref(false); // 控制编辑对话框的显示
const editedProduct = ref<productprocessingconfigdetail>({
    configdetailid: '',
    productid: '',
    productname: '',
    outputproductid: '',
    outputproductname: '',
    outputtype: '',
    outputcount: ''
});

const currentPage = ref(1) // 当前页码
const pageSize = ref(10) // 每页显示条数
const searchQuery = ref('') // 搜索查询内容
const addProductDialogVisible = ref(false) // 控制新增产品对话框显示
const productDetailsDialogVisible = ref(false) // 控制产品详情对话框显示

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

const handleOutputProductChange = (row: productprocessingconfigdetail, value: string) => {
    const selectedProduct = outputProducts.value.find(
        (product) => product.productname === value
    );
    if (selectedProduct) {
        row.outputproductid = selectedProduct.productid; // 自动赋值产品ID
        console.log(`产出产品名称: ${value}, 对应的产品ID: ${selectedProduct.productid}`);
    }
};

// 获取产出产品列表的方法
const getOutputProducts = async (productId: number) => {
    try {
        console.log(productId)
        const response = await api.post(`/products/getproduct/${productId}`); // 动态传入 productId
        console.log(response.data)
        outputProducts.value = response.data; // 将返回的数据赋值给响应式变量
    } catch (error) {
        console.error('获取产出产品列表失败:', error);
    }
};
// 获取产品加工配置数据
const getProductProcessing = async () => {
    try {
        const response = await api.post('/productprocessingconfig/getAll', { searchQuery: searchQuery.value })
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

// 定义计算属性来获取当前产品的详情数据分页
const currentPageDetailsData = computed(() => {
    const start = (detailsCurrentPage.value - 1) * detailsPageSize.value
    const end = start + detailsPageSize.value
    return currentProductDetails.value.slice(start, end) // 假设 currentProductDetails 是存储产品详情数据的变量
})


// 处理产品选择变化
const handleProductChange = (value: string) => {
    console.log('选中的产品ID：', value);

    // 查找选中产品的详细信息
    const selectedProduct = products.value.find(product => product.productid === value);
    if (selectedProduct) {
        console.log('选中的产品名称：', selectedProduct.productname); // 打印产品名称
        newProduct.value.productname = selectedProduct.productname; // 更新产品名称到 newProduct
    } else {
        console.error('未找到匹配的产品名称');
    }

    const productId = Number(value); // 将选中的产品ID转为数字
    if (!isNaN(productId)) {
        getOutputProducts(productId); // 调用时传递 productId 参数
    } else {
        console.error('无效的产品ID：', value);
    }

    // 可以在这里执行其他逻辑，比如更新其他字段或请求更多信息
};

// 打开查看详情对话框
const viewProductDetails = (row: ProductProcessing) => {
    getProductDetails(row.productid)
    productDetailsDialogVisible.value = true
}
const getProductDetails = async (productId: string) => {
    try {

        console.log(productId)
        const response = await api.post('/productprocessingconfig/getDetails', null, {
            params: { productid: parseInt(productId, 10) }  // 传递 'id' 参数
        })

        //const response = await api.post(`/productprocessingconfig/getDetails`, { productId })
        console.log(response.data)

        currentProductDetails.value = response.data
    } catch (error) {
        console.error('获取产品详情数据失败:', error)
    }
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

const productReadonly = ref(false); // 设置只读状态

// 新增产品
const openAddViewProductDialog = () => {
    const firstProduct = currentPageDetailsData.value[0];  // 获取第一个产品
    // 获取第一个产品
    // 直接将产品的 id 和 name 赋值给新增产品设置对话框中的字段
    newProduct.value.productid = firstProduct.productid;
    handleProductChange(newProduct.value.productid);
    newProduct.value.productname = firstProduct.productname;
    productReadonly.value = true; // 控制产品 ID 和产品名称为只读

    // 打开新增产品设置对话框
    addProductDialogVisible.value = true;


}
const openAddProductDialog = () => {


    // 打开新增产品设置对话框
    addProductDialogVisible.value = true;
    productReadonly.value = false; // 控制产品 ID 和产品名称为只读



}

// 监听 addProductDialogVisible 的变化
watch(() => addProductDialogVisible.value, (newVal) => {
    if (newVal) {
        // 每次对话框打开时，确保 selectedProducts 中有一行空的默认数据
        if (selectedProducts.value.length === 0) {
            selectedProducts.value = [
                {
                    configdetailid: '',  // 必须包含 configdetailid
                    productid: '',
                    productname: '',
                    outputproductid: '',
                    outputproductname: '',
                    outputtype: '',
                    outputcount: '',
                }
            ];
        }
    }
});

const handleAddProduct = async () => {
    if (!newProduct.value.productid) {
        ElMessageBox.alert('产品名称不能为空', '警告', {
            confirmButtonText: '确定',
            type: 'warning',
            lockScroll: false, // 防止页面滚动条消失
        });
        return;
    }

    // 确保至少有一行数据
    if (selectedProducts.value.length === 0 || !selectedProducts.value[0].outputproductid) {
        ElMessageBox.alert('请至少添加一行有效的产出产品', '警告', {
            confirmButtonText: '确定',
            type: 'warning',
            lockScroll: false,
        });
        return;
    }

    // 校验每一行的产出产品
    for (let i = 0; i < selectedProducts.value.length; i++) {
        const product = selectedProducts.value[i];

        console.log(`第 ${i + 1} 行的产出产品名称：`, product.outputproductname);

        if (newProduct.value.productid == product.outputproductid) {
            ElMessageBox.alert(`第 ${i + 1} 行的产出产品不能与被加工的产品名称一致`, '警告', {
                confirmButtonText: '确定',
                type: 'warning',
                lockScroll: false,
            });
            return;
        }
        if (!product.outputproductid) {
            ElMessageBox.alert(`第 ${i + 1} 行的产出产品名称不能为空！`, '警告', {
                confirmButtonText: '确定',
                type: 'warning',
                lockScroll: false,
            });
            return; // 终止操作
        }
        if (!product.outputtype) {
            ElMessageBox.alert(`第 ${i + 1} 行的产出类型不能为空！`, '警告', {
                confirmButtonText: '确定',
                type: 'warning',
                lockScroll: false,
            });
            return; // 终止操作
        }
        if (!product.outputcount) {
            ElMessageBox.alert(`第 ${i + 1} 行的产出数量不能为空！`, '警告', {
                confirmButtonText: '确定',
                type: 'warning',
                lockScroll: false,
            });
            return; // 终止操作
        }
    }

    // 拼装报文
    const payload = {
        productprocessingconfig: {
            productid: newProduct.value.productid,
            productname: newProduct.value.productname,
        },
        productprocessingconfigdetail: selectedProducts.value.map(product => ({
            productid: product.productid,
            productname: product.productname,
            outputproductid: product.outputproductid,
            outputproductname: product.outputproductname,
            outputtype: product.outputtype,
            outputcount: product.outputcount,
        })),
    };

    console.log('拼装后的请求报文：', payload);

    try {
        const response = await api.post('/productprocessingconfig/create', payload);
        console.log('新增加工配置成功：', response.data);
        ElMessage({
            message: '新增加工配置成功！',
            type: 'success',
            duration: 2000,
        });

        // 重置表单和选中产品
        addProductDialogVisible.value = false;
        getProductDetails(newProduct.value.productid);
        newProduct.value = { productid: '', productname: '', productstatus: 1 };
        selectedProducts.value = []; // 清空选中的产品

        getProductProcessing(); // 刷新产品列表
    } catch (error) {
        console.error('新增加工配置失败：', error);
        ElMessage({
            message: '新增加工配置失败，请稍后再试！',
            type: 'error',
            duration: 2000,
        });
    }
};


const handleDetailsPageChange = (page: number) => {
    detailsCurrentPage.value = page
}

// 删除产品时确认
const confirmDeleteProduct = async (processingconfigid: string) => {
    if (window.confirm('确定要删除这个产品吗？')) {
        try {
            await api.post('/productprocessingconfig/delete', null, {
                params: { processingconfigid: parseInt(processingconfigid, 10) }  // 传递 'id' 参数
            })
            getProductProcessing() // 删除后重新获取产品加工配置数据
        } catch (error) {
            console.error('删除失败:', error)
        }
    }
}

//删除明细数据
const confirmDeleteviews = async (configdetailid: string) => {
    if (window.confirm('确定要删除这个产品吗？')) {
        try {
            console.log(configdetailid)
            // 调用删除 API
            await api.post('/productprocessingconfig/deleteDetail', null, {
                params: { configdetailid: parseInt(configdetailid, 10) }  // 传递 'id' 参数
            })
            // 删除成功后，移除对应的明细数据
            currentProductDetails.value = currentProductDetails.value.filter(item => item.configdetailid !== configdetailid)
            ElMessage.success('删除成功！')
        } catch (error) {
            console.error('删除失败:', error)
            ElMessage.error('删除失败，请重试！')
        }
    }
}





// 添加产品到产品列表
const addProductToList = () => {

    if (!newProduct.value.productid) {
        ElMessage({
            message: '请先选择产品！',
            type: 'warning',
            duration: 2000,
        });
        return;
    }
    // 直接添加一行空的产品配置
    const newProcessing: productprocessingconfigdetail = {
        configdetailid: '',
        productid: '',  // 产品ID（可以为空）
        productname: '',  // 产品名称（可以为空）
        outputproductid: '',  // 可选产出产品ID
        outputproductname: '',  // 可选产出产品名称
        outputtype: '',  // 可选产出类型
        outputcount: '',  // 可选产出数量
    }

    // 将新空行添加到列表
    selectedProducts.value.push(newProcessing)
    // 重置输入框或选择（如果有输入框需要重置）
    //newProduct.value = { productid: '', productname: '', productstatus: 1 }
}

// 删除产品从加工配置表格
const deleteProductFromList = (index: number) => {
    selectedProducts.value.splice(index, 1)
}

const refreshProductProcessing = () => {
    getProductProcessing();
};
// 打开编辑对话框，并加载选中的数据
const editProductDetails = (product: productprocessingconfigdetail) => {
    editedProduct.value = { ...product }; // 将当前行的数据复制到编辑对象中
    editProductDialogVisible.value = true; // 打开编辑对话框
};

// 保存编辑后的数据
const saveEditedProduct = async () => {
    try {
        // 假设这里是通过 API 保存数据
        const response = await api.post('/productprocessingconfig/editdetail', editedProduct.value);

        // 输出 response 对象，查看数据内容
        console.log(response);

        // 判断请求是否成功，检查 status 和返回的数据
        if (response.status === 200 && response.data.configdetailid === editedProduct.value.configdetailid) {
            ElMessage.success('产品详情更新成功');

            // 更新成功后，手动更新列表中的数据
            // 假设你有一个列表 `productDetails` 存储了产品配置详情
            // const updatedProduct = response.data; // 获取更新后的产品数据
            getProductDetails(editedProduct.value.productid);  // 假设 editedProduct 中包含 productid


            // 更新完数据后刷新页面或更新视图
            // refreshProductProcessing(); // 如果有需要刷新列表的函数，可以调用这个
            editProductDialogVisible.value = false; // 关闭编辑对话框
        } else {
            ElMessage.error('更新失败');
        }
    } catch (error) {
        console.error('保存编辑失败:', error);
        ElMessage.error('保存编辑失败');
    }
};

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