<template>
    <div class="user-management">
        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-group">
                <el-input placeholder="请输入学号查询" v-model="studentId" class="search-input" clearable>
                    <template #prefix>
                        <i class="el-icon-search"></i>
                    </template>
                </el-input>
                <el-button type="primary" @click="searchStudentId(1)" class="search-btn">查询</el-button>
            </div>

            <div class="search-group">
                <el-autocomplete v-model="username" :fetch-suggestions="querySearchUsername" :trigger-on-focus="false"
                    clearable class="search-input" placeholder="请输入用户名查询">
                    <template #prefix>
                        <i class="el-icon-user"></i>
                    </template>
                </el-autocomplete>
                <el-button type="primary" @click="searchUsername(1)" class="search-btn">查询</el-button>
            </div>

            <el-button type="warning" plain @click="reset" class="reset-btn">
                <i class="el-icon-refresh"></i>
                重置
            </el-button>
        </div>

        <!-- 操作区域 -->
        <div class="operation-section">
            <el-button type="danger" plain @click="delBatch" :disabled="!ids.length">
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
                <el-table-column prop="username" label="用户名" width="150" align="center" />
                <el-table-column prop="cover" label="头像" width="80" align="center">
                    <template #default="scope">
                        <div class="avatar-wrapper">
                            <el-image
                                :src="scope.row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                                fit="cover" class="table-avatar"
                                :preview-src-list="[scope.row.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png']"
                                :preview-teleported="true" :hide-on-click-modal="true" />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="gender" label="性别" width="80" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.gender === '男' ? 'primary' : 'success'" size="small">
                            {{ scope.row.gender }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="180" />
                <el-table-column prop="verified" label="认证状态" width="100" align="center">
                    <template #default="scope">
                        <el-tag :type="scope.row.verified === '已认证' ? 'success' : 'warning'" size="small">
                            {{ scope.row.verified ? '已认证' : '未认证' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="studentId" label="学号" width="120" align="center" />

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

        <!-- 编辑对话框 -->
        <el-dialog title="用户信息" v-model="formVisible" width="500px" :close-on-click-modal="false" destroy-on-close
            class="user-dialog">
            <el-form :model="form" label-width="100px" :rules="rules" ref="formRef" class="user-form">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" disabled />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" disabled type="password" show-password />
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                    <el-input v-model="form.gender" disabled />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" disabled />
                </el-form-item>
                <el-form-item label="认证状态" prop="verified">
                    <el-select v-model="form.verified" placeholder="请选择认证状态">
                        <el-option label="已认证" value="已认证" />
                        <el-option label="未认证" value="未认证" />
                    </el-select>
                </el-form-item>
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="form.studentId" disabled />
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

const studentId = ref("");
const username = ref("");

const formVisible = ref(false);
const form = reactive({});
const rules = reactive({
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});
const ids = ref([]);

const load = (page = 1) => {
    pageNum.value = page;
    loading.value = true;

    Promise.all([
        request.get("/admin/user/count"),
        request.get("/admin/user/list", {
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
    if (username.value && username.value !== "") {
        searchUsername(page);
    } else {
        load(page);
    }
};

const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
};

const save = () => {
    saveLoading.value = true;
    request.put(`/admin/user/update/${form.id}`, {
        username: form.username,
        password: form.password,
        gender: form.gender,
        email: form.email,
        verified: form.verified,
        studentId: form.studentId
    }).then(res => {
        if (res.code === 1) {
            ElMessage.success('保存成功');
            load(pageNum.value);
            formVisible.value = false;
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => ElMessage.error('请求失败，请稍后重试'))
        .finally(() => {
            saveLoading.value = false;
        });
};

const closeDialog = () => {
    formVisible.value = false;
};

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
        request.delete("/admin/user/delete", { data: { id } })
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
            request.delete("/admin/user/delete/batch", { data: { ids: ids.value } })
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

const querySearchUsername = (queryString, cb) => {
    let results = [];
    request.get("/admin/user/querySearch", {
        params: { username: queryString }
    }).then((res) => {
        if (res.code === 1) {
            results = res.data;
            results.forEach(item => {
                item.value = item.username;
            });
            cb(results);
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    });
};

const searchUsername = (page) => {
    if (page) pageNum.value = page;
    loading.value = true;

    Promise.all([
        request.get("/admin/user/searchCountUsername", {
            params: { username: username.value }
        }),
        request.get("/admin/user/searchUsername", {
            params: {
                username: username.value,
                page: pageNum.value,
                size: pageSize.value,
            }
        })
    ]).then(([countRes, listRes]) => {
        total.value = countRes.data.total || 0;
        tableData.value = listRes.records || [];
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    }).finally(() => {
        loading.value = false;
    });
};

const searchStudentId = (page) => {
    if (page) pageNum.value = page;
    loading.value = true;

    Promise.all([
        request.get("/admin/user/searchCountStudentId", {
            params: { studentId: studentId.value }
        }),
        request.get("/admin/user/searchStudentId", {
            params: {
                studentId: studentId.value,
                page: pageNum.value,
                size: pageSize.value,
            }
        })
    ]).then(([countRes, listRes]) => {
        total.value = countRes.data.total || 0;
        tableData.value = listRes.records || [];
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    }).finally(() => {
        loading.value = false;
    });
};

const reset = () => {
    studentId.value = "";
    username.value = "";
    load(1);
};

onMounted(() => {
    load(1);
});
</script>

<style scoped>
.user-management {
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

/* 操作区域 */
.operation-section {
    background: white;
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

.avatar-wrapper {
    display: flex;
    justify-content: center;
}

.table-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #f0f0f0;
    transition: all 0.3s ease;
}

.table-avatar:hover {
    transform: scale(1.1);
    border-color: #409eff;
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
.user-dialog :deep(.el-dialog) {
    border-radius: 12px;
}

.user-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.user-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.user-form {
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .user-management {
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