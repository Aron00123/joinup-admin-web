<template>
    <div class="chat-management">
        <!-- 操作区域：仅保留“导出”按钮 -->

        <!-- 顶部工具栏 -->
        <div class="toolbar">
            <div class="conversation-title">
                会话 <strong>{{ conversationId }}</strong> 的聊天记录
            </div>

            <!-- <el-button type="success" plain @click="exportToExcel" class="export-btn">
                <i class="el-icon-download"></i>
                导出为XLSX
            </el-button> -->
            <div class="toolbar-actions">
                <el-button type="success" plain @click="exportToExcel" class="export-btn">
                    <i class="el-icon-download"></i>
                    导出为XLSX
                </el-button>

                <el-button type="info" plain @click="goBack" class="back-btn">
                    <i class="el-icon-arrow-left"></i>
                    返回
                </el-button>
            </div>
        </div>


        <!-- 表格区域（与原列表一致） -->
        <div class="table-section">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange" class="data-table"
                v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="140" sortable align="center" />

                <!-- 会话编号：这里只是展示，不再跳链 -->
                <!-- <el-table-column prop="conversationId" label="会话编号" width="360" align="center">
                    <template #default="scope">
                        <el-tag type="info" size="small">
                            {{ scope.row.conversationId }}
                        </el-tag>
                    </template>
</el-table-column> -->

                <!-- 聊天内容、发送者、时间，与原列表完全一致 ↓ -->
                <el-table-column label="聊天内容" show-overflow-tooltip>
                    <template #default="{ row }">
                        <div class="chat-content">
                            <div v-if="row.type === 'IMAGE'" class="image-message">
                                <div class="image-info">
                                    <span class="image-label">图片消息:</span>
                                    <span class="image-name">{{ row.content.name }}</span>
                                </div>
                                <div class="image-container">
                                    <el-image :src="row.content.url" :alt="row.content.name" fit="cover"
                                        class="message-image" @click="previewImage(row.content.url, row.content.name)"
                                        :preview-src-list="[row.content.url]" preview-teleported />
                                    <!-- 下载按钮：Tooltip + icon -->
                                    <el-tooltip content="下载原图" placement="top">
                                        <el-button circle size="small" type="primary" class="download-btn"
                                            :icon="Download"
                                            @click.stop="downloadImage(row.content.url, row.content.name)" />
                                    </el-tooltip>
                                </div>
                            </div>
                            <div v-else>
                                <div v-for="(val, key) in row.content" :key="key" class="message-item">
                                    <span class="message-label">{{ key }}:</span>
                                    <span class="message-text">{{ val }}</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="username" label="发送者" width="240" align="center">
                    <template #default="scope">
                        <div class="sender-info">
                            <i class="el-icon-user"></i>
                            {{ scope.row.username }}
                        </div>
                    </template>
                </el-table-column>

                <el-table-column prop="createTime" label="发送时间" width="120" align="center">
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
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20, 50]" :page-size="pageSize" layout="total, prev, pager, next"
                    :total="total" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '../../utils/request';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { Download } from '@element-plus/icons-vue';

defineExpose({ Download });

/* ---------------- 基本状态 ---------------- */
const router = useRouter();
const route = useRoute();
const conversationId = route.params.id;      // 路由 :id
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const ids = ref([]);

const goBack = () => {
    /* 若路由里给聊天管理页起了 name：'ChatManagement'，优先用 push，
       否则直接 router.back() 也能返回上一页 */
    router.push({ name: 'ChatLog' }).catch(() => { });
    // router.back();
};

/* ----------- 用户名缓存（沿用原实现） -------- */
const userCache = ref(new Map());

const getUsernameById = async (senderId) => {
    if (!senderId) return '未知用户';
    if (userCache.value.has(senderId)) return userCache.value.get(senderId);

    try {
        const res = await request.get('/admin/user/searchStudentId', {
            params: { studentId: senderId, page: 1, size: 1 },
        });
        const username = res.records?.[0]?.username || '未知用户';
        userCache.value.set(senderId, username);
        return username;
    } catch {
        return '获取失败';
    }
};

const processUsernames = async (data) => {
    if (data.every(i => i.username && i.username !== '未知用户')) return data;
    const senderIds = [...new Set(data.map(i => i.senderId).filter(Boolean))];
    await Promise.all(senderIds.map(id => getUsernameById(id)));
    return data.map(item => ({
        ...item,
        username: userCache.value.get(item.senderId) || '未知用户',
    }));
};

/* ----------------- 工具函数 ----------------- */
const formatTime = (t) => (t ? new Date(t).toLocaleString('zh-CN') : '');

const previewImage = (url) => console.log('预览图片', url);

function adaptMessage(item) {
    return {
        id: item.id,
        // ➜ 会话 ID
        conversationId: item.conversation?.id ?? '',
        // ➜ 发送者
        senderId: item.sender?.id ?? '',
        username: item.sender?.username ?? '未知用户',
        avatar: item.sender?.avatar ?? '',
        // ➜ 核心消息字段（后端名称若不同请对照修改）
        type: item.type,
        content: item.content,
        createTime: item.createTime,
    };
}

/* ----------------- 数据加载 ----------------- */

const load = async (page = 1) => {
    pageNum.value = page;
    loading.value = true;

    try {
        const res = await request.post(
            `/admin/message/chat/${conversationId}/filter`,
            { pageNumber: pageNum.value, pageSize: pageSize.value }            // 你的 DTO 字段名若不同，请同步调整
        );

        /* === 新接口格式 ============================= */
        const rawData = res?.data?.list ?? [];
        const tot = res?.data?.total ?? 0;
        /* ============================================ */

        total.value = Number(tot);
        // 统一字段后再做用户名缓存处理（若你仍想请求后端补全，可保留）
        tableData.value = await processUsernames(rawData.map(adaptMessage));

    } catch (e) {
        ElMessage.error('数据加载失败');
    } finally {
        loading.value = false;
    }
};


const handleCurrentChange = (p) => load(p);
const handleSelectionChange = (rows) => {
    ids.value = rows.map(r => r.id);
};

/* ------------------ 导出 ------------------- */

const getMessageTypeText = (type) => {
    const texts = {
        'TEXT': '文本',
        'IMAGE': '图片',
        'FILE': '文件',
        'SYSTEM': '系统'
    };
    return texts[type] || type || '未知';
};

// 导出 Excel（ExcelJS 版，支持内嵌图片）
async function exportToExcel() {
    try {
        ElMessage.info('正在导出数据，请稍候...');

        /* ——————————————————— 1. 拉取数据 ——————————————————— */
        const { data: count } = await request.get('/admin/message/chat/searchCount', {
            params: { name: conversationId }
        });
        const total = Number(count) || 0;
        if (total === 0) {
            ElMessage.warning('当前无可导出数据');
            return;
        }

        const { records: rows = [] } = await request.get('/admin/message/chat/search', {
            params: { name: conversationId, page: 1, size: total }
        });

        /* ——————————————————— 2. 创建工作簿 / 工作表 ——————————————————— */
        const wb = new ExcelJS.Workbook();
        wb.creator = 'JoinUp! 管理后台';
        wb.created = new Date();

        const ws = wb.addWorksheet('聊天记录', {
            properties: { defaultRowHeight: 20 },
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });

        /* ——————————————————— 3. 表头行 ——————————————————— */
        const header = ['序号', '会话编号', '聊天内容', '消息类型', '发送者编号', '发送时间'];
        ws.addRow(header);
        ws.getRow(1).font = { bold: true };

        // 列宽（可按需调整）
        ws.columns = [
            { key: 'idx', width: 8 },
            { key: 'cid', width: 45 },
            { key: 'content', width: 60 },
            { key: 'type', width: 12 },
            { key: 'sid', width: 14 },
            { key: 'time', width: 22 }
        ];

        /* ——————————————————— 4. 填充数据 & 记录需要插图的行 ——————————————————— */
        const imgTasks = [];   // { rowNumber, url, ext }

        rows.forEach((row, i) => {
            const rowNumber = i + 2;                     // ExcelJS 行号从 1 开始，+1 是表头
            if (row.type === 'IMAGE' && row.content?.url) {
                ws.addRow([
                    i + 1,
                    row.conversationId,
                    '',                                      // “聊天内容”列留空，待会儿放图片
                    getMessageTypeText(row.type),
                    row.senderId,
                    formatTime(row.createTime)
                ]);
                ws.getRow(rowNumber).height = 90;          // 调高行高给图片
                imgTasks.push({
                    rowNumber,
                    url: row.content.url,
                    ext: row.content.url.toLowerCase().endsWith('.png') ? 'png' : 'jpeg'
                });
            } else {
                ws.addRow([
                    i + 1,
                    row.conversationId,
                    Object.values(row.content).join('\n'),
                    getMessageTypeText(row.type),
                    row.senderId,
                    formatTime(row.createTime)
                ]);
            }
        });

        /* ——————————————————— 5. 下载并插入图片 ——————————————————— */
        await Promise.all(
            imgTasks.map(async ({ rowNumber, url, ext }) => {
                try {
                    const buffer = await fetch(url, { mode: 'cors' }).then(r => r.arrayBuffer());
                    const imageId = wb.addImage({ buffer, extension: ext });
                    // 第 3 列（下标 2）位置插图；tl.row / col 都是 0-based
                    ws.addImage(imageId, {
                        tl: { col: 2, row: rowNumber - 1 },
                        ext: { width: 120, height: 120 }
                    });
                } catch (e) {
                    console.warn(`图片 ${url} 下载失败:`, e);
                }
            })
        );

        /* ——————————————————— 6. 写文件并下载 ——————————————————— */
        const buf = await wb.xlsx.writeBuffer();       // Node 环境请用 writeFile
        const fileTag = rows[0]?.conversationId || '';
        saveAs(
            new Blob([buf], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            `聊天记录_${fileTag}_${new Date().toISOString().slice(0, 10)}.xlsx`
        );

        ElMessage.success('导出成功');
    } catch (err) {
        console.error(err);
        ElMessage.error('导出失败，请稍后重试');
    }
}

async function downloadImage(url, filename = 'image') {
    try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        // 若没有后缀，用 blob.type 给个默认值
        const ext = filename.includes('.') ? '' : `.${blob.type.split('/')[1] || 'jpg'}`;
        saveAs(blob, `${filename}${ext}`);
    } catch (e) {
        ElMessage.error('图片下载失败，请稍后重试');
    }
}

/* ----------------- 初始化 ------------------ */
onMounted(() => load(1));
</script>

<!-- 直接复用列表页样式，无需额外 CSS -->


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

.back-btn,
.search-btn,
.reset-btn,
.export-btn {
    border-radius: 8px;
    min-width: 80px;
}

.back-btn {
    background: linear-gradient(135deg, #1a9ac4 0%, #2f9ce0 100%);
    border-color: #1a9ac4;
    color: white;
}

.export-btn {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
    border-color: #52c41a;
    color: white;
}

.back-btn,
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
    max-height: 200px;
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

/* 图片消息样式 */
.image-message {
    padding: 8px;
    background: #f0f9ff;
    border-radius: 8px;
    border: 1px solid #e1f5fe;
}

.image-info {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.image-label {
    font-weight: 600;
    color: #1976d2;
    margin-right: 8px;
    font-size: 12px;
}

.image-name {
    color: #424242;
    font-size: 12px;
    word-break: break-all;
}

.image-container {
    position: relative;
    display: flex;
    justify-content: center;
}

.download-btn {
    position: absolute;
    /* 右下角 */
    bottom: 4px;
    right: 4px;
    z-index: 2;
    /* 确保按钮在图片之上 */
    opacity: 0.85;
    transition: opacity .2s, transform .2s;
}

.download-btn:hover {
    opacity: 1;
    transform: scale(1.05);
}

.message-image {
    max-width: 120px;
    max-height: 120px;
    border-radius: 6px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.message-image:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
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

/* 图片预览增强 */
.data-table :deep(.el-image-viewer__wrapper) {
    z-index: 3000;
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

    .search-group,
    .action-group {
        justify-content: space-between;
    }

    .search-input {
        flex: 1;
        max-width: none;
    }

    .message-item {
        font-size: 12px;
    }

    .message-image {
        max-width: 80px;
        max-height: 80px;
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

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    /* 按钮间距 */
}

.conversation-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
}
</style>