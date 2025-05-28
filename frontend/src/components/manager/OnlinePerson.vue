<template>
    <div>

        <!-- 表格显示 -->
        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="50" sortable />
                <el-table-column prop="username" label="用户名" width="180" align="center" />
                <el-table-column prop="cover" label="头像" width="80" align="center">
                    <template #default="scope">
                        <!-- 把 URL 先显示出来，看控制台或表格里长什么样 -->
                        <!-- <div style="font-size:12px; color:#999; margin-bottom:4px;">
                            URL: {{ scope.row.photo }}
                        </div> -->
                        <el-image
                        :src="scope.row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                        fit="cover"
                        :zoom-rate="1.2"
                        :max-scale="7"
                        :min-scale="0.2"
                        style="width: 50px; height: 50px; border-radius: 0;"
                        />
                    </template>
                </el-table-column>

            </el-table>

            <div class="pagination" style="padding-top: 20px">
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total" />
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../utils/request"; // 替换为实际的请求工具

// 数据定义
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 查询条件
const tagName = ref("");

// 对话框相关
const formVisible = ref(false);
const isHandleAdd = ref(false);
const form = reactive({});
const rules = reactive({});
const ids = ref([]);

// 分页及加载数据
const load = (page = 1) => {
    pageNum.value = page;
    request
        .get("/admin/user/online/count", {
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/user/online/list", {
            params: {
                page: pageNum.value,               // 第 1 页
                size: pageSize.value,              // 每页 10 条
                // sort: 'create_time,desc',
                // keyword: searchText    // 你的业务查询条件
            }
        })
        .then((res) => {
            tableData.value = res.records || [];
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });

};

// 分页切换
const handleCurrentChange = (page) => {
    load(page);
    
};

// 批量删除
const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
};


onMounted(() => {
    load(1);
});
</script>

<style scoped>
/* 根据需要添加组件特有的样式 */
.search,
.operation,
.table {
    margin-bottom: 20px;
}
</style>
