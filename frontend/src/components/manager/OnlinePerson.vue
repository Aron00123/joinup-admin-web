<template>
    <div class="online-users-container">
        <!-- 页面标题 -->
        <div class="page-header">
            <h2 class="page-title">在线用户管理</h2>
            <div class="user-count">当前在线: {{ tableData.length }} 人</div>
        </div>

        <!-- 用户卡片网格 -->
        <el-row :gutter="20" class="card-grid">
            <el-col v-for="user in tableData" :key="user.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4" class="card-col">
                <div class="user-card">
                    <!-- 在线状态指示器 -->
                    <div class="status-indicator">
                        <div class="status-dot"></div>
                        <span class="status-text">在线</span>
                    </div>

                    <!-- 用户头像区域 -->
                    <div class="avatar-section">
                        <div class="avatar-wrapper">
                            <el-image class="avatar-img" :src="user.avatar || defaultAvatar" fit="cover">
                                <template #error>
                                    <div class="avatar-error">
                                        <i class="el-icon-user"></i>
                                    </div>
                                </template>
                            </el-image>
                            <div class="avatar-glow"></div>
                        </div>
                    </div>

                    <!-- 用户信息 -->
                    <div class="user-info">
                        <div class="username" :title="user.username">{{ user.username }}</div>
                        <div class="user-id">ID: {{ user.id }}</div>
                        <div class="user-meta">
                            <span class="meta-item">
                                <i class="el-icon-time"></i>
                                在线中
                            </span>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="card-actions">
                        <el-button type="danger" size="small" class="offline-btn" @click="offline(user.id)"
                            :loading="loadingStates[user.id]">
                            <i class="el-icon-switch-button"></i>
                            强制下线
                        </el-button>
                    </div>

                    <!-- 装饰性元素 -->
                    <div class="card-decoration">
                        <div class="decoration-dot dot-1"></div>
                        <div class="decoration-dot dot-2"></div>
                        <div class="decoration-dot dot-3"></div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <!-- 空状态 -->
        <div v-if="tableData.length === 0" class="empty-state">
            <div class="empty-icon">
                <i class="el-icon-user"></i>
            </div>
            <p class="empty-text">暂无在线用户</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../../utils/request'

const tableData = ref([])
const loadingStates = reactive({}) // 按钮加载状态
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

/** 加载在线用户列表 */
const load = (page = 1) => {
    request.get('/admin/user/online/list', { params: { page, size: 10 } })
        .then(res => {
            tableData.value = res.records || []
            // 初始化加载状态
            tableData.value.forEach(user => {
                loadingStates[user.id] = false
            })
        })
        .catch(() => ElMessage.error('加载失败'))
}

/** 下线操作 */
const offline = async (id) => {
    try {
        await ElMessageBox.confirm(
            '确认将该用户强制下线？此操作将立即断开用户连接。',
            '强制下线确认',
            {
                type: 'warning',
                confirmButtonText: '确认下线',
                cancelButtonText: '取消'
            }
        )

        loadingStates[id] = true

        await request.delete(`/ws/user/${id}`)

        // 本地同步移除（添加动画效果）
        const cardElement = document.querySelector(`[data-user-id="${id}"]`)
        if (cardElement) {
            cardElement.style.transform = 'scale(0)'
            cardElement.style.opacity = '0'
            setTimeout(() => {
                tableData.value = tableData.value.filter(u => u.id !== id)
            }, 300)
        } else {
            tableData.value = tableData.value.filter(u => u.id !== id)
        }

        ElMessage.success('用户已成功下线')
    } catch (err) {
        if (err !== 'cancel') {
            ElMessage.error('操作失败，请重试')
        }
    } finally {
        loadingStates[id] = false
    }
}

onMounted(() => load())
</script>

<style scoped>
.online-users-container {
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
}

/* 页面头部 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 0 8px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
}

.user-count {
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

/* 卡片网格 */
.card-grid {
    margin-bottom: 24px;
}

.card-col {
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

/* 用户卡片主体 */
.user-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 24px 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.user-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
}

.user-card:hover .avatar-glow {
    opacity: 1;
    transform: scale(1.2);
}

.user-card:hover .decoration-dot {
    opacity: 1;
    animation: float 2s ease-in-out infinite;
}

/* 在线状态指示器 */
.status-indicator {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    color: white;
    font-weight: 500;
}

.status-dot {
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

/* 头像区域 */
.avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
}

.avatar-img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
}

.avatar-glow {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: linear-gradient(135deg, #667eea, #24bc78);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.4s ease;
    z-index: 1;
    filter: blur(8px);
}

.avatar-error {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 50%;
    color: white;
    font-size: 32px;
}

/* 用户信息 */
.user-info {
    text-align: center;
    margin-bottom: 20px;
}

.username {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
}

.user-card:hover .username {
    color: #667eea;
}

.user-id {
    font-size: 13px;
    color: #7f8c8d;
    margin-bottom: 8px;
    font-family: 'Monaco', 'Menlo', monospace;
    background: rgba(0, 0, 0, 0.05);
    display: inline-block;
    padding: 2px 8px;
    border-radius: 8px;
}

.user-meta {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #95a5a6;
}

.meta-item i {
    font-size: 14px;
    color: #4facfe;
}

/* 操作按钮 */
.card-actions {
    display: flex;
    justify-content: center;
}

.offline-btn {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    border: none;
    border-radius: 12px;
    padding: 8px 20px;
    font-weight: 500;
    font-size: 13px;
    color: white;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.offline-btn:hover {
    background: linear-gradient(135deg, #ff5252, #e53935);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.offline-btn:active {
    transform: translateY(0);
}

.offline-btn i {
    margin-right: 6px;
}

/* 装饰性元素 */
.card-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
}

.decoration-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background: linear-gradient(135deg, #667eea, #24bc78);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.3s ease;
}

.dot-1 {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.dot-2 {
    top: 60%;
    right: 15%;
    animation-delay: 0.5s;
}

.dot-3 {
    bottom: 30%;
    left: 20%;
    animation-delay: 1s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    margin-top: 40px;
}

.empty-icon {
    font-size: 64px;
    color: #bdc3c7;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 18px;
    color: #7f8c8d;
    margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .online-users-container {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }

    .page-title {
        font-size: 24px;
    }

    .user-card {
        padding: 20px 16px;
    }

    .avatar-img {
        width: 70px;
        height: 70px;
    }

    .username {
        font-size: 16px;
    }
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
    .online-users-container {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }

    .user-card {
        background: rgba(52, 73, 94, 0.95);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .username {
        color: #ecf0f1;
    }

    .user-card:hover .username {
        color: #74b9ff;
    }

    .user-id {
        background: rgba(255, 255, 255, 0.1);
        color: #bdc3c7;
    }
}
</style>