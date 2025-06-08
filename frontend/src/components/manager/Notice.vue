<template>
    <div class="notice-management">
        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-group">
                <el-autocomplete v-model="id" :fetch-suggestions="querySearchNotice" :trigger-on-focus="false" clearable
                    class="search-input" placeholder="请输入公告标题查询">
                    <template #prefix>
                        <i class="el-icon-search"></i>
                    </template>
                </el-autocomplete>
                <el-button type="primary" @click="querySearchAdmin(1)" class="search-btn">查询</el-button>
            </div>

            <el-button type="warning" plain @click="reset" class="reset-btn">
                <i class="el-icon-refresh"></i>
                重置
            </el-button>
        </div>

        <!-- 操作区域 -->
        <div class="operation-section">
            <el-button type="primary" plain @click="handleAdd" class="add-btn">
                <i class="el-icon-plus"></i>
                新增
            </el-button>
            <el-button type="danger" plain @click="delBatch" :disabled="!ids.length" class="batch-delete-btn">
                <i class="el-icon-delete"></i>
                批量删除 {{ ids.length ? `(${ids.length})` : '' }}
            </el-button>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange" class="data-table"
                v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="70" sortable align="center" />
                <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
                <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
                <el-table-column prop="time" label="创建时间" width="180" align="center" />
                <el-table-column prop="user" label="创建人" width="120" align="center" />

                <el-table-column label="操作" align="center" width="160" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" type="primary" link @click="handleEdit(row)">
                            <i class="el-icon-edit"></i>
                            编辑
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
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total" />
            </div>
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog title="公告信息" v-model="formVisible" width="600px" :close-on-click-modal="false" destroy-on-close
            class="notice-dialog">
            <el-form :model="form" label-width="100px" :rules="rules" ref="formRef" class="notice-form">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入公告标题" />
                </el-form-item>
                <el-form-item label="内容" prop="content">
                    <el-input type="textarea" :rows="6" v-model="form.content" placeholder="请输入公告内容" maxlength="1000"
                        show-word-limit />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button type="primary" @click="save" :loading="saveLoading">确定</el-button>
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

const id = ref("");

const formVisible = ref(false);
const isHandleAdd = ref(false);
const form = reactive({});
const rules = reactive({
    title: [{ required: true, message: "请输入公告标题", trigger: "blur" }],
    content: [{ required: true, message: "请输入公告内容", trigger: "blur" }],
});
const ids = ref([]);

const load = (page = 1) => {
    pageNum.value = page;
    loading.value = true;

    request.post("/notice/selectPage", {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        username: id.value
    }).then((res) => {
        tableData.value = res.data?.list || [];
        total.value = res.data?.total || 0;
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    }).finally(() => {
        loading.value = false;
    });
};

const querySearchNotice = (queryString, cb) => {
    let results = [];
    request.post("/notice/querySearch", { queryString: queryString })
        .then((res) => {
            if (res.code === "200") {
                results = res.data;
                results.forEach(item => {
                    item.value = item.title;
                });
                cb(results);
            } else {
                ElMessage.error(res.msg);
            }
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
};

const querySearchAdmin = (page) => {
    if (page) pageNum.value = page;
    loading.value = true;

    request.post("/notice/querySearchAdmin", {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        id: id.value
    }).then((res) => {
        tableData.value = res.data.list || [];
        total.value = res.data.total || 0;
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    }).finally(() => {
        loading.value = false;
    });
};

const handleCurrentChange = (page) => {
    if (id.value && id.value !== "") {
        querySearchAdmin(page);
    } else {
        load(page);
    }
};

const handleAdd = () => {
    Object.assign(form, {});
    Object.keys(form).forEach((key) => {
        form[key] = null;
    });
    formVisible.value = true;
    isHandleAdd.value = true;
};

const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
    isHandleAdd.value = false;
};

const save = () => {
    saveLoading.value = true;

    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let timeStr = date.toLocaleTimeString();
    form.time = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${timeStr}`;
    form.user = 'ADMIN';

    request.post(isHandleAdd.value ? "/notice/add" : "/notice/update", form)
        .then((res) => {
            if (res.code === "200") {
                ElMessage.success("保存成功");
                load(pageNum.value);
                formVisible.value = false;
            } else {
                ElMessage.error(res.msg);
            }
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        })
        .finally(() => {
            saveLoading.value = false;
            isHandleAdd.value = false;
        });
};

const closeDialog = () => {
    formVisible.value = false;
    isHandleAdd.value = false;
};

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
        request.post("/notice/delete", { id: id })
            .then((res) => {
                if (res.code === "200") {
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
            request.post("/notice/delete/batch", { ids: ids.value })
                .then((res) => {
                    if (res.code === "200") {
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

const reset = () => {
    id.value = "";
    load(1);
};

onMounted(() => {
    load(1);
});
</script>

<style scoped>
.notice-management {
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* 搜索区域 */
.search-section {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.search-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    width: 220px;
}

.search-btn {
    border-radius: 8px;
}

.reset-btn {
    border-radius: 8px;
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

.add-btn {
    border-radius: 8px;
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

/* 分页区域 */
.pagination-section {
    padding: 20px;
    display: flex;
    justify-content: center;
    background: #fafafa;
    border-top: 1px solid #ebeef5;
}

/* 对话框 */
.notice-dialog :deep(.el-dialog) {
    border-radius: 12px;
}

.notice-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.notice-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.notice-form {
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .notice-management {
        padding: 12px;
    }

    .search-section {
        flex-direction: column;
        align-items: stretch;
    }

    .search-group {
        justify-content: space-between;
    }

    .search-input {
        flex: 1;
        max-width: none;
    }

    .operation-section {
        flex-direction: column;
    }

    .add-btn,
    .batch-delete-btn {
        width: 100%;
    }
}
</style>