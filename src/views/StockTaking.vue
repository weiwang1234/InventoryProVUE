<template>
    <div class="inventory-check-page">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>库存盘点</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 搜索区域 -->
        <el-row class="search-box" style="margin-bottom: 20px;" gutter="10">
            <el-col :span="8" style="text-align: right;">
                <el-date-picker v-model="searchDateRange" type="monthrange" format="YYYY-MM" start-placeholder="选择开始月份"
                    end-placeholder="选择结束月份" clearable style="width: 85%;" /> </el-col>
            <el-col :span="8">
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetSearchFilters">重置</el-button>
            </el-col>
        </el-row>
        <el-button type="primary" @click="openInventoryCheckDialog" style="width: 100%;">盘点</el-button>

        <!-- 盘点结果表格 -->
        <el-table :data="currentPageData" style="width: 100%;">
            <el-table-column label="序号" width="80">
                <template v-slot="scope">
                    {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column prop="stockmonth" label="盘点月份" width="80" />
            <el-table-column label="操作" width="300">
                <template v-slot="scope">
                    <el-button plain @click="viewDetail(scope.row)">查看详情</el-button>
                    <el-button type="primary" @click="downloadData(scope.row)">下载</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!-- 查看详情对话框 -->
        <el-dialog v-model="dialogVisible" title="产品详细信息" width="80%" :modal="true" :lock-scroll="false"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <el-table :data="paginatedDetailData" style="width: 100%">
                <el-table-column label="序号" type="index" width="80" />
                <el-table-column v-if="showPartnerId" label="产品ID" prop="productid" />
                <el-table-column label="产品名称" prop="productname" />
                <el-table-column label="上月库存" prop="lastmonthinventory">
                    <template #default="{ row }">
                        {{ row.lastmonthinventory ? row.lastmonthinventory.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="进货数量" prop="monthpurchases">
                    <template #default="{ row }">
                        {{ row.monthpurchases ? row.monthpurchases.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="进货金额" prop="monthpurchasesamount">
                    <template #default="{ row }">
                        {{ row.monthpurchasesamount ? row.monthpurchasesamount.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="被加工数量" prop="monthprocessing">
                    <template #default="{ row }">
                        {{ row.monthprocessing ? row.monthprocessing.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="加工产出数量" prop="monthprocessedoutput">
                    <template #default="{ row }">
                        {{ row.monthprocessedoutput ? row.monthprocessedoutput.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="卖出数量" prop="monthsoldquantity">
                    <template #default="{ row }">
                        {{ row.monthsoldquantity ? row.monthsoldquantity.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="卖出金额" prop="monthsoldamount">
                    <template #default="{ row }">
                        {{ row.monthsoldamount ? row.monthsoldamount.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>

                <el-table-column label="本月库存" prop="monthinventory">
                    <template #default="{ row }">
                        {{ row.monthinventory ? row.monthinventory.toFixed(2) : '0.00' }}
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination :current-page="detailCurrentPage" :page-size="detailPageSize" :total="detailData.length"
                @current-change="handleDetailPageChange" layout="prev, pager, next" background
                class="pagination-dialog" />

        </el-dialog>

        <!-- 分页 -->
        <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredData.length"
            @current-change="handlePageChange" layout="total, prev, pager, next, jumper" background
            class="pagination" />


        <el-dialog v-model="inventoryCheckDialogVisible" title="选择盘点月份" width="20%" :modal="true" :lock-scroll="false"
            :close-on-click-modal="false" :close-on-press-escape="false">
            <div>
                <!-- 月份选择器 -->
                <el-date-picker v-model="selectedMonth" type="month" placeholder="请选择盘点月份"
                    style="width: 100%;"></el-date-picker>
            </div>
            <!-- 对话框底部操作按钮 -->
            <template #footer>
                <el-button @click="cancelInventoryCheck">取消</el-button>
                <el-button type="primary" @click="confirmInventoryCheck">确定</el-button>
            </template>
        </el-dialog>



    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { ElMessageBox, ElLoading, ElMessage } from 'element-plus';

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');  // 搜索框：产品名称
const searchDateRange = ref([null, null]);  // 搜索框：日期范围
const inventoryCheckDialogVisible = ref(false);
const selectedMonth = ref<string | null>(null);
const dialogVisible = ref(false);
const detailPageSize = ref(10); // 每页显示的条数
const detailCurrentPage = ref(1); // 当前页码
const detailData = ref<any[]>([]); // 详情数据
const showPartnerId = ref(false) // 控制是否显示合作方ID列
const loadingInstance = ref<any>(null);


const openInventoryCheckDialog = () => {
    inventoryCheckDialogVisible.value = true;
};
const cancelInventoryCheck = () => {
    inventoryCheckDialogVisible.value = false;
};
const confirmInventoryCheck = async () => {
    if (!selectedMonth.value) {
        ElMessage.warning("请选择盘点月份！");
        return;
    }


    try {
        const formattedDate = formatDate(selectedMonth.value).trim();  // 去除多余空格或特殊字符

        const monthendstock = {
            stockmonth: formattedDate // 假设 MonthendStock 对象包含 stockMonth 字段
        };

        const response = await api.post('/monthendstock/getByStockmonth', monthendstock, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data.success)
        if (response.data.success === false) {

            loadingInstance.value = ElLoading.service({
                text: '盘点中，请稍等...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)',
            });

            const response = await api.post('/monthstockdetailstock/create', monthendstock, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);
            ElMessage.success(formattedDate + "盘点完成！");
            loadingInstance.value.close();
            inventoryCheckDialogVisible.value = false;
            getInventories();





        } else {
            console.log('应该要弹出但是没有弹出');

            // 如果记录已存在，弹出确认框
            await ElMessageBox.confirm(
                '记录已存在，是否继续操作？',
                '确认',
                {
                    confirmButtonText: '继续',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).then(async () => {

                loadingInstance.value = ElLoading.service({
                    text: '盘点中，请稍等...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)',
                });

                const response = await api.post('/monthstockdetailstock/create', monthendstock, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                // 用户点击了继续，执行后续操作
                console.log(response.data);
                // 执行盘点操作逻辑
                ElMessage.success(formattedDate + "盘点完成！");
                loadingInstance.value.close();

                inventoryCheckDialogVisible.value = false;
            }).catch(() => {
                // 用户点击了取消，不做任何操作
                console.log('用户取消了操作');
            });
        }
    } catch (error) {
        // 捕获异常
        ElMessage.error('检查失败，请重试！');
    }
};


interface Inventory {
    stockmonth: string;
}

const inventories = ref<Inventory[]>([]);  // 存储所有库存数据
const filteredData = ref<Inventory[]>([]);  // 存储经过查询筛选后的数据

// 获取库存数据
const getInventories = async () => {
    try {
        const response = await api.post('/monthendstock/getAll', { searchQuery: searchQuery.value });
        inventories.value = response.data || [];
        filteredData.value = inventories.value;  // 初始时显示所有库存数据
    } catch (error) {
        console.error('获取库存数据失败:', error);
    }
};


// 查询
const handleSearch = async () => {
    const searchpama = {
        startDate: searchDateRange.value && searchDateRange.value[0] ? formatDate(searchDateRange.value[0]) : null,
        endDate: searchDateRange.value && searchDateRange.value[1] ? formatDate(searchDateRange.value[1]) : null,
    };

    try {
        // 确保URL路径正确
        const response = await api.post('/monthendstock/querySearch', searchpama);
        inventories.value = response.data || [];
        filteredData.value = inventories.value;  // 初始时显示所有盈利数据
    } catch (error) {
        console.error('获取盈利数据失败:', error);
    }
    currentPage.value = 1;
    // 根据查询条件过滤数据
};

// 重置搜索条件
const resetSearchFilters = () => {
    searchQuery.value = '';
    searchDateRange.value = [null, null];
    currentPage.value = 1;
    filteredData.value = inventories.value;  // 重置时显示所有数据
};

// 分页切换
const handlePageChange = (page: number) => {
    currentPage.value = page;
};

// 计算当前页显示的数据
const currentPageData = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = currentPage.value * pageSize.value;
    return filteredData.value.slice(startIndex, endIndex);  // 返回当前页数据
});

function formatDate(dateStr: string): string {
    const date = new Date(dateStr); // 解析日期字符串
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，需要加1并格式化为2位数
    return `${year}-${month}`; // 返回 YYYY-MM 格式
}


const viewDetail = async (row: any) => {
    const stockmonth = row.stockmonth;  // 获取盘点月份

    try {
        // 使用 GET 请求请求后台数据，并将 stockMonth 作为 URL 参数
        const response = await api.get(`/monthstockdetailstock/get/${stockmonth}`); // 调用后端接口

        // 假设返回的数据是数组，可以直接赋值给 detailData
        detailData.value = response.data;

        // 打开弹框显示产品详情
        dialogVisible.value = true;

    } catch (error) {
        // 捕获错误并显示提示
        ElMessage.error('获取产品详情失败，请重试！');
    }
};

const handleDetailPageChange = (page: number) => {
    detailCurrentPage.value = page; // 更新当前页码
};

const paginatedDetailData = computed(() => {
    const start = (detailCurrentPage.value - 1) * detailPageSize.value;
    const end = start + detailPageSize.value;
    return detailData.value.slice(start, end);
});


const downloadData = async (row: any) => {
    try {

        const params = {
            stockmonth: row.stockmonth,
        };
        // 请求后端下载 Excel 文件
        const exportType = "StockTaking"; // 替换为需要的导出类型，例如 "orders" 或 "users"

        loadingInstance.value = ElLoading.service({
            text: '下载中，请稍等...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
        });
        const response = await api.post(`/exports/${exportType}`, params, { responseType: 'blob' });

        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${row.stockmonth}月进库存盘点明细.xlsx`;  // 文件名中添加 stockmonth

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        loadingInstance.value.close();

    } catch (error) {
        console.error('下载失败:', error);
    }
}

// 页面加载时初始化数据
onMounted(() => {
    getInventories();
});
</script>

<style scoped>
.inventory-check-page {
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
</style>