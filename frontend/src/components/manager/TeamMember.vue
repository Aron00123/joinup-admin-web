<template>
    <div>

        <!-- 操作区域 -->
        <div class="operation" style="padding-bottom: 20px">
            <!-- <el-button type="primary" plain @click="handleAdd">新增</el-button> -->
            <el-button type="danger" plain @click="delBatch">批量删除</el-button>
        </div>

        <!-- 表格显示 -->
        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="70" align="center" sortable />
                <el-table-column prop="teamId" label="队伍编号" align="center" show-overflow-tooltip />
                <el-table-column prop="userId" label="用户编号" align="center" show-overflow-tooltip />
                <el-table-column prop="role" label="角色" align="center" show-overflow-tooltip />
                <el-table-column prop="createTime" align="center" label="创建时间" />

                <el-table-column label="操作" align="center" width="180">
                    <template #default="{ row }">
                        <!-- <el-button size="mini" type="primary" plain @click="handleEdit(row)">编辑</el-button> -->
                        <el-button size="mini" type="danger" plain @click="del(row.id)">删除</el-button>
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

// 对话框相关
const formVisible = ref(false);
const form = reactive({});
const ids = ref([]);

// 分页及加载数据
const load = (page = 1) => {
    pageNum.value = page;
    request
        .get("/admin/team-member/count", {
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/team-member/list", {
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
    if (themeName.value && themeName.value !== "") {
        search(page);
    } else {
        load(page);
    }
};



// 删除单条数据
const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/team-member/delete", { data: { id } })
            .then((res) => {
                if (res.code === 1) {
                    ElMessage.success("操作成功");
                    load(1);
                } else {
                    ElMessage.error(res.msg);
                }
            })
            .catch(() => {
                ElMessage.error("请求失败，请稍后重试");
            });
    });
};

// 批量删除
const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
};

const delBatch = () => {
    if (!ids.value.length) {
        ElMessage.warning("请选择数据");
        return;
    }
    ElMessageBox.confirm("您确定批量删除这些数据吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/team-member/delete/batch", { data: { ids: ids.value } })
            .then((res) => {
                console.log(res.code);
                if (res.code === 1) {
                    ElMessage.success("操作成功");
                    load(1);
                } else {
                    ElMessage.error(res.msg);
                }
            })
            .catch(() => {
                ElMessage.error("请求失败，请稍后重试");
            });
    });
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
