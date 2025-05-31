<template>
    <div class="chat-management">
        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-group">
                <el-autocomplete 
                    v-model="chatMessageName" 
                    :fetch-suggestions="querySearch" 
                    :trigger-on-focus="false"
                    clearable 
                    class="search-input" 
                    placeholder="请输入会话编号查询"
                    @keyup.enter="search(1)"
                >
                    <template #prefix>
                        <i class="el-icon-chat-dot-square"></i>
                    </template>
                </el-autocomplete>
                <el-button type="primary" @click="search(1)" class="search-btn">查询</el-button>
            </div>
            
            <div class="action-group">
                <el-button type="warning" plain @click="reset" class="reset-btn">
                    <i class="el-icon-refresh"></i>
                    重置
                </el-button>
                <el-button type="success" plain @click="exportToExcel" class="export-btn">
                    <i class="el-icon-download"></i>
                    导出为XLSX
                </el-button>
            </div>
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
                <el-table-column prop="conversationId" label="会话编号" width="300" align="center" show-overflow-tooltip>
                    <template #default="scope">
                        <div class="conversation-id">
                            <el-tag type="info" size="small">
                                {{ scope.row.conversationId }}
                            </el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="聊天内容" show-overflow-tooltip>
                    <template #default="{ row }">
                        <div class="chat-content">
                            <div v-for="(val, key) in row.content" :key="key" class="message-item">
                                <span class="message-label">{{ key }}:</span>
                                <span class="message-text">{{ val }}</span>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="消息类型" width="120" align="center">
                    <template #default="scope">
                        <el-tag 
                            :type="getMessageTypeColor(scope.row.type)" 
                            size="small"
                        >
                            {{ scope.row.type || '未知' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="senderId" label="发送者ID" width="120" align="center" />
                <el-table-column prop="createTime" label="创建时间" width="180" align="center">
                    <template #default="scope">
                        <div class="time-info">
                            <i class="el-icon-time"></i>
                            {{ formatTime(scope.row.createTime) }}
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-section">
                <el-pagination 
                    background 
                    @current-change="handleCurrentChange" 
                    :current-page="pageNum"
                    :page-sizes="[5, 10, 20, 50]" 
                    :page-size="pageSize" 
                    layout="total, prev, pager, next" 
                    :total="total"
                />
            </div>
        </div>

        <!-- 编辑对话框 -->
        <el-dialog 
            title="聊天记录信息" 
            v-model="formVisible" 
            width="500px" 
            :close-on-click-modal="false" 
            destroy-on-close
            class="chat-dialog"
        >
            <el-form 
                :model="form" 
                label-width="150px" 
                :rules="rules" 
                ref="formRef"
                class="chat-form"
            >
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入名称" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input 
                        type="textarea" 
                        :rows="3" 
                        v-model="form.description" 
                        placeholder="请输入描述"
                    />
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 数据定义
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const saveLoading = ref(false);

// 查询条件
const chatMessageName = ref("");

// 对话框相关
const formVisible = ref(false);
const isHandleAdd = ref(false);
const form = reactive({});
const rules = reactive({
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    description: [{ required: true, message: "请输入描述", trigger: "blur" }]
});
const ids = ref([]);

// 工具函数
const getMessageTypeColor = (type) => {
    const colors = {
        'text': 'primary',
        'image': 'success',
        'file': 'warning',
        'system': 'info'
    };
    return colors[type] || 'info';
};

const formatTime = (time) => {
    if (!time) return '';
    return new Date(time).toLocaleString('zh-CN');
};

// 分页及加载数据
const load = (page = 1) => {
    pageNum.value = page;
    loading.value = true;
    
    Promise.all([
        request.get("/admin/message/chat/count"),
        request.get("/admin/message/chat/list", {
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

// 分页切换
const handleCurrentChange = (page) => {
    if (chatMessageName.value && chatMessageName.value !== "") {
        search(page);
    } else {
        load(page);
    }
};

// 新增处理
const handleAdd = () => {
    Object.assign(form, {});
    Object.keys(form).forEach((key) => {
        form[key] = null;
    });
    formVisible.value = true;
    isHandleAdd.value = true;
};

// 编辑处理
const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
};

// 保存（新增或编辑）
const save = () => {
    saveLoading.value = true;
    const apiCall = isHandleAdd.value 
        ? request.post("/admin/message/chat/add", {
            name: form.name,
            description: form.description
        })
        : request.put(`/admin/message/chat/update/${form.id}`, {
            name: form.name,
            description: form.description
        });
    
    apiCall.then(res => {
        if (res.code === 1) {
            ElMessage.success('保存成功');
            load(pageNum.value);
            formVisible.value = false;
            isHandleAdd.value = false;
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => ElMessage.error('请求失败，请稍后重试'))
    .finally(() => {
        saveLoading.value = false;
    });
};

// 关闭对话框
const closeDialog = () => {
    formVisible.value = false;
    isHandleAdd.value = false;
};

// 删除单条数据
const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request.delete("/admin/message/chat/delete", { data: { id } })
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

// 批量删除
const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
};

const delBatch = () => {
    if (!ids.value.length) {
        ElMessage.warning("请选择数据");
        return;
    }
    ElMessageBox.confirm(`您确定批量删除这 ${ids.value.length} 条数据吗？`, "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request.delete("/admin/message/chat/delete/batch", { data: { ids: ids.value } })
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

// 自动补全查询
const querySearch = (queryString, cb) => {
    let results = [];
    request.get("/admin/message/chat/querySearch", {
        params: { name: queryString }
    }).then((res) => {
        if (res.code === 1) {
            results = res.data;
            results.forEach(item => {
                item.value = item.conversationId;
            });
            cb(results);
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
    });
};

// 查询
const search = (page) => {
    if (page) pageNum.value = page;
    loading.value = true;
    
    Promise.all([
        request.get("/admin/message/chat/searchCount", {
            params: { name: chatMessageName.value }
        }),
        request.get("/admin/message/chat/search", {
            params: {
                name: chatMessageName.value,
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

// 重置查询条件
const reset = () => {
    chatMessageName.value = "";
    load(1);
};

// 导出Excel
async function exportToExcel() {
    try {
        ElMessage.info('正在导出数据，请稍候...');
        
        const countRes = await request.get('/admin/message/chat/searchCount', {
            params: { name: chatMessageName.value }
        });
        const totalCount = Number(countRes.data) || 0;
        
        if (totalCount === 0) {
            ElMessage.warning('当前无可导出数据');
            return;
        }

        const listRes = await request.get('/admin/message/chat/search', {
            params: {
                name: chatMessageName.value,
                page: 1,
                size: totalCount
            }
        });
        const rows = listRes.records || [];

        const header = ['序号', '会话编号', '聊天内容', '消息类型', '发送者编号', '创建时间'];
        const data = rows.map((row, idx) => {
            const contentStr = Object.entries(row.content)
                .map(([k, v]) => `${v}`)
                .join('\n');
            return [
                idx + 1,
                row.conversationId,
                contentStr,
                row.type,
                row.senderId,
                formatTime(row.createTime)
            ];
        });

        const singleId = rows[0]?.conversationId || '';

        const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '聊天记录');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(
            new Blob([wbout], { type: 'application/octet-stream' }),
            `聊天记录_${singleId}_${new Date().toISOString().slice(0,10)}.xlsx`
        );
        
        ElMessage.success('导出成功');
    } catch (err) {
        console.error(err);
        ElMessage.error('导出失败，请稍后重试');
    }
}

onMounted(() => {
    load(1);
});
</script>

<style scoped>
.chat-management {
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
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
}

.search-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.action-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    width: 280px;
}

.search-btn, .reset-btn, .export-btn {
    border-radius: 8px;
    min-width: 80px;
}

.export-btn {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    border-color: #52c41a;
    color: white;
}

.export-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
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

/* 会话编号样式 */
.conversation-id {
    display: flex;
    justify-content: center;
}

/* 聊天内容样式 */
.chat-content {
    max-height: 120px;
    overflow-y: auto;
    padding: 8px 0;
}

.message-item {
    margin-bottom: 6px;
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #409eff;
    font-size: 13px;
    line-height: 1.4;
}

.message-item:last-child {
    margin-bottom: 0;
}

.message-label {
    font-weight: 600;
    color: #606266;
    margin-right: 8px;
}

.message-text {
    color: #303133;
    word-break: break-word;
}

/* 时间信息样式 */
.time-info {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 12px;
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
.chat-dialog :deep(.el-dialog) {
    border-radius: 12px;
}

.chat-dialog :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);;
    color: white;
    border-radius: 12px 12px 0 0;
    padding: 20px;
}

.chat-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.chat-form {
    padding: 20px;
}

/* 表格内容美化 */
.data-table :deep(.el-table__body-wrapper) {
    border-radius: 0 0 12px 12px;
}

.data-table :deep(.el-table__row) {
    transition: all 0.3s ease;
}

.data-table :deep(.el-table__row:hover) {
    background-color: #f8f9ff !important;
}

/* 标签样式增强 */
.data-table :deep(.el-tag) {
    border-radius: 12px;
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .chat-management {
        padding: 12px;
    }
    
    .search-section {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-group, .action-group {
        justify-content: space-between;
    }
    
    .search-input {
        flex: 1;
        max-width: none;
    }
    
    .message-item {
        font-size: 12px;
    }
}

/* 滚动条样式 */
.chat-content::-webkit-scrollbar {
    width: 4px;
}

.chat-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>