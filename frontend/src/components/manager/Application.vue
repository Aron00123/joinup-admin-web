<template>
    <div class="tag-application-management">
        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-group">
                <el-autocomplete 
                    v-model="themeName" 
                    :fetch-suggestions="querySearchTheme" 
                    :trigger-on-focus="false"
                    clearable 
                    class="search-input" 
                    placeholder="请输入标签名称查询"
                >
                    <template #prefix>
                        <i class="el-icon-search"></i>
                    </template>
                </el-autocomplete>
                <el-button type="primary" @click="search(1)" class="search-btn">查询</el-button>
            </div>
            
            <el-button type="warning" plain @click="reset" class="reset-btn">
                <i class="el-icon-refresh"></i>
                重置
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
                <el-table-column prop="name" label="名称" min-width="150" show-overflow-tooltip />
                <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
                <el-table-column prop="status" label="状态" width="120" align="center" show-overflow-tooltip>
                    <template #default="{ row }">
                        <el-tag 
                            :type="getStatusType(row.status)" 
                            size="small"
                            effect="light"
                        >
                            {{ row.status }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="submitterUserName" label="提交者" width="120" show-overflow-tooltip />
                <el-table-column prop="submitterUserAvatar" label="提交者头像" width="100" align="center">
                    <template #default="{ row }">
                        <el-avatar
                            :src="row.submitterUserAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                            :size="40"
                            fit="cover"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
                <el-table-column prop="finishTime" label="通过时间" width="180" align="center" />

                <el-table-column label="操作" align="center" width="300" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" type="info" link @click="handleView(row)">
                            <i class="el-icon-view"></i>
                            查看
                        </el-button>
                        <el-button 
                            size="small" 
                            type="success" 
                            link
                            :disabled="row.finishTime != null || loadingReview"
                            :loading="loadingReview"
                            @click="reviewTagApplication(row.id, 0)"
                        >
                            <i class="el-icon-check"></i>
                            通过
                        </el-button>
                        <el-button 
                            size="small" 
                            type="warning" 
                            link
                            :disabled="row.finishTime != null || loadingReview"
                            :loading="loadingReview"
                            @click="reviewTagApplication(row.id, 1)"
                        >
                            <i class="el-icon-close"></i>
                            不通过
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

        <!-- 查看详情对话框 -->
        <el-dialog 
            title="标签申请详情" 
            v-model="formVisible" 
            width="500px" 
            :close-on-click-modal="false" 
            destroy-on-close
            class="application-dialog"
        >
            <el-form 
                :model="form" 
                label-width="100px" 
                class="application-form"
            >
                <el-form-item label="名称">
                    <el-input v-model="form.name" :disabled="isViewMode" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input 
                        type="textarea" 
                        :rows="4" 
                        v-model="form.description" 
                        :disabled="isViewMode"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-tag 
                        :type="getStatusType(form.status)" 
                        size="medium"
                        effect="light"
                    >
                        {{ form.status }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="提交者" v-if="form.submitterUserName">
                    <div class="submitter-info">
                        <el-avatar
                            :src="form.submitterUserAvatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                            :size="30"
                            fit="cover"
                            class="submitter-avatar"
                        />
                        <span class="submitter-name">{{ form.submitterUserName }}</span>
                    </div>
                </el-form-item>
                <el-form-item label="创建时间" v-if="form.createTime">
                    <span>{{ form.createTime }}</span>
                </el-form-item>
                <el-form-item label="通过时间" v-if="form.finishTime">
                    <span>{{ form.finishTime }}</span>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="closeDialog" type="primary">确定</el-button>
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

const themeName = ref("");

const formVisible = ref(false);
const isHandleAdd = ref(false);
const isViewMode = ref(false);
const loadingReview = ref(false);
const form = reactive({});
const rules = reactive({});
const ids = ref([]);

// 获取状态标签类型
const getStatusType = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('通过') || statusLower.includes('已通过')) return 'success';
    if (statusLower.includes('不通过') || statusLower.includes('拒绝')) return 'danger';
    if (statusLower.includes('待审核') || statusLower.includes('审核中')) return 'warning';
    return 'info';
};

const load = (page = 1) => {
    pageNum.value = page;
    loading.value = true;
    
    Promise.all([
        request.get("/admin/tag/applications/count"),
        request.get("/admin/tag/applications/list", {
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
    if (themeName.value && themeName.value !== "") {
        search(page);
    } else {
        load(page);
    }
};

const handleView = (row) => {
    Object.assign(form, { ...row });
    isHandleAdd.value = false;
    isViewMode.value = true;
    formVisible.value = true;
};

const reviewTagApplication = async (id, action) => {
    loadingReview.value = true;
    try {
        const payload = { action, comment: '' };
        const res = await request.post(`/admin/tag/applications/${id}/review`, payload);
        if (res.code === 1) {
            ElMessage.success('操作成功');
            load(pageNum.value);
        } else {
            ElMessage.error(res.msg || '操作失败');
        }
    } catch {
        ElMessage.error('网络或服务器异常');
    } finally {
        loadingReview.value = false;
    }
};

const closeDialog = () => {
    formVisible.value = false;
    isHandleAdd.value = false;
    isViewMode.value = false;
};

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request.post("/admin/theme/delete", { id })
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
        request.post("/admin/theme/delete/batch", { ids: ids.value })
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

const querySearchTheme = (queryString, cb) => {
    let results = [];
    request.get("/admin/tag/applications/querySearch", {
        params: { name: queryString }
    }).then((res) => {
        if (res.code === 1) {
            results = res.data;
            results.forEach(item => {
                item.value = item.name;
            });
            cb(results);
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    });
};

const search = (page) => {
    if (page) pageNum.value = page;
    loading.value = true;
    
    Promise.all([
        request.get("/admin/tag/applications/searchCount", {
            params: { name: themeName.value }
        }),
        request.get("/admin/tag/applications/search", {
            params: {
                name: themeName.value,
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

const reset = () => {
    themeName.value = "";
    load(1);
};

onMounted(() => {
    load(1);
});
</script>

<style scoped>
.tag-application-management {
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
    width: 200px;
}

.search-btn {
    border-radius: 8px;
}

.reset-btn {
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
.application-dialog :deep(.el-dialog) {
    border-radius: 12px;
}

.application-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.application-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.application-form {
    padding: 20px;
}

/* 提交者信息 */
.submitter-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.submitter-avatar {
    flex-shrink: 0;
}

.submitter-name {
    font-weight: 500;
    color: #303133;
}

/* 状态标签样式优化 */
.el-tag {
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .tag-application-management {
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
}
</style>