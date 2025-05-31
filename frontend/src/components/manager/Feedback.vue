<template>
    <div class="feedback-management">
        <!-- 操作区域 -->
        <div class="operation-section">
            <el-button type="danger" plain @click="delBatch" :disabled="!ids.length" class="batch-delete-btn">
                <i class="el-icon-delete"></i>
                批量删除 {{ ids.length ? `(${ids.length})` : '' }}
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
            <el-table 
                :data="tableData" 
                stripe 
                @selection-change="handleSelectionChange"
                class="data-table"
                v-loading="loading"
            >
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="70" sortable align="center" />
                <el-table-column prop="userId" label="用户ID" width="100" align="center" />
                <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
                <el-table-column prop="contact" label="联系方式" width="150" show-overflow-tooltip />
                <el-table-column prop="handled" label="处理情况" width="150" show-overflow-tooltip />

                <el-table-column label="操作" align="center" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" link @click="handleEdit(row)">
                            <i class="el-icon-view"></i>
                            查看
                        </el-button>
                        <el-button size="small" type="danger" link @click="del(row.id)">
                            <i class="el-icon-delete"></i>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-section">
                <el-pagination 
                    background 
                    @current-change="handleCurrentChange" 
                    :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" 
                    :page-size="pageSize" 
                    layout="total, prev, pager, next" 
                    :total="total"
                />
            </div>
        </div>

        <!-- 反馈详情对话框 -->
        <el-dialog 
            title="反馈详情" 
            v-model="formVisible" 
            width="600px" 
            :close-on-click-modal="false" 
            destroy-on-close
            class="feedback-dialog"
        >
            <el-form 
                :model="form" 
                label-width="100px" 
                :rules="rules" 
                ref="formRef"
                class="feedback-form"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="用户名" disabled />
                </el-form-item>
                <el-form-item label="反馈内容" prop="content">
                    <el-input 
                        type="textarea" 
                        :rows="4" 
                        v-model="form.content" 
                        placeholder="反馈内容" 
                        disabled
                    />
                </el-form-item>
                <el-form-item label="联系方式" prop="contact">
                    <el-input v-model="form.contact" placeholder="联系方式" disabled />
                </el-form-item>
                <el-form-item label="处理情况" prop="handled">
                    <el-input 
                        type="textarea" 
                        :rows="3" 
                        v-model="form.handled" 
                        placeholder="请输入处理情况"
                        maxlength="300"
                        show-word-limit
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="closeDialog">取消</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../utils/request";

const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const saveLoading = ref(false);

const formVisible = ref(false);
const form = reactive({});
const rules = reactive({
    handled: [{ required: true, message: "请输入处理情况", trigger: "blur" }],
});
const ids = ref([]);

const load = (page = 1) => {
    pageNum.value = page;
    loading.value = true;
    
    Promise.all([
        request.get("/admin/message/feedback/count"),
        request.get("/admin/message/feedback/list", {
            params: {
                page: pageNum.value,
                size: pageSize.value,
            }
        })
    ]).then(([countRes, listRes]) => {
        total.value = Number(countRes.data) || 0;
        tableData.value = listRes.records || [];
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    }).finally(() => {
        loading.value = false;
    });
};

const handleCurrentChange = (page) => {
    load(page);
};

const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
};

const closeDialog = () => {
    formVisible.value = false;
};

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
        request.delete("/admin/message/feedback/delete", { data: { id } })
            .then((res) => {
                if (res.code === 1) {
                    ElMessage.success("删除成功");
                    load(pageNum.value);
                } else {
                    ElMessage.error(res.msg);
                }
            })
            .catch(() => {
                ElMessage.error("请求失败，请稍后重试");
            });
    });
};

const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
};

const delBatch = () => {
    if (!ids.value.length) {
        ElMessage.warning("请选择数据");
        return;
    }
    ElMessageBox.confirm(`您确定批量删除这 ${ids.value.length} 条数据吗？`, "确认删除",
        { type: "warning", confirmButtonText: "确认", cancelButtonText: "取消" }).then(() => {
            request.delete("/admin/message/feedback/delete/batch", { data: { ids: ids.value } })
                .then((res) => {
                    if (res.code === 1) {
                        ElMessage.success("批量删除成功");
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
.feedback-management {
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* 操作区域 */
.operation-section {
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 12px;
}

.batch-delete-btn {
    border-radius: 8px;
}

/* 表格区域 */
.table-section {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.data-table {
    border-radius: 12px 12px 0 0;
}

.data-table :deep(.el-table__row) {
    height: 60px; /* 调整为你想要的高度 */
}

/* 分页区域 */
.pagination-section {
    padding: 20px;
    display: flex;
    justify-content: center;
    background: #fafafa;
    border-top: 1px solid #ebeef5;
}

/* 对话框 */
.feedback-dialog :deep(.el-dialog) {
    border-radius: 12px;
}

.feedback-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.feedback-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.feedback-form {
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .feedback-management {
        padding: 12px;
    }
    
    .operation-section {
        flex-direction: column;
    }
    
    .batch-delete-btn {
        width: 100%;
    }
}
</style>