<template>
    <div class="stats-management">
        <!-- 搜索和开关区域 -->
        <div class="search-section">
            <div class="search-group">
                <div class="switch-container">
                    <el-switch v-model="autoFetch" active-text="自动加载接口数据" inactive-text="手动加载接口数据"
                        @change="onAutoFetchChange" size="default" class="auto-switch" />
                </div>
                <div class="search-controls">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" size="default"
                        class="date-picker" />
                    <el-button type="primary" @click="onSearch" class="search-btn">
                        <i class="el-icon-search"></i>
                        查询
                    </el-button>
                    <el-button type="warning" plain @click="reset" class="reset-btn">
                        <i class="el-icon-refresh"></i>
                        重置
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 欢迎卡片 -->
        <div class="welcome-card">
            <div class="welcome-content">
                <div class="welcome-icon">
                    <i class="el-icon-user"></i>
                </div>
                <div class="welcome-text">
                    <h3>您好，<span class="username">{{ user.name ? user.name : 'ADMIN' }}</span>！</h3>
                    <p>欢迎使用 Join Up! 后台管理系统</p>
                </div>
            </div>
        </div>

        <!-- 数据统计区域 -->
        <div class="stats-section">
            <div class="stats-header">
                <div class="stats-title">
                    <i class="el-icon-data-line"></i>
                    <span>接口数据统计</span>
                </div>
                <div class="dimension-selector">
                    <el-radio-group v-model="statType" size="default" class="radio-group">
                        <el-radio-button label="path">
                            <i class="el-icon-link"></i>
                            按接口
                        </el-radio-button>
                        <el-radio-button label="user">
                            <i class="el-icon-user"></i>
                            按用户
                        </el-radio-button>
                    </el-radio-group>
                </div>
            </div>

            <div class="stats-content">
                <el-scrollbar height="450px" class="stats-scrollbar">
                    <div v-if="currentStats.length === 0" class="empty-state">
                        <div class="empty-icon">
                            <i class="el-icon-data-board"></i>
                        </div>
                        <p class="empty-text">{{ autoFetch ? '暂无数据' : '请开启自动加载或点击查询按钮获取数据' }}</p>
                    </div>
                    <el-timeline v-else class="stats-timeline">
                        <el-timeline-item v-for="item in currentStats" :key="statType + '-' + itemKey(item)"
                            placement="top" class="timeline-item">
                            <el-card shadow="hover" class="stat-card">
                                <div class="stat-card-content">
                                    <div class="stat-header">
                                        <div class="stat-icon">
                                            <i :class="statType === 'path' ? 'el-icon-link' : 'el-icon-user'"></i>
                                        </div>
                                        <h4 class="stat-title">{{ titleText(item) }}</h4>
                                    </div>
                                    <div class="stat-value">
                                        <span class="value-label">调用总数</span>
                                        <span class="value-number">{{ item.total }}</span>
                                    </div>
                                </div>
                            </el-card>
                        </el-timeline-item>
                    </el-timeline>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref, watch, computed } from "vue";
import request from "../../utils/request"; // 引入封装的 axios 实例

const autoFetch = ref(
    localStorage.getItem('autoFetch') === 'true'
);

watch(autoFetch, val => {
    localStorage.setItem('autoFetch', val.toString());
});

/* 日期区间；默认 null 表示未选 */
const dateRange = ref<[string, string] | null>(null)

/* 查询按钮：带日期调用 */
const onSearch = () => {
    const [start, end] = dateRange.value || []
    loadPathStats(start, end)
    loadUserStats(start, end)          // 先全拉，切维度时无需再请求
}

/* 重置按钮 */
const reset = () => {
    dateRange.value = null
    loadPathStats()
    loadUserStats()
    if (autoFetch.value) {
        loadPathStats()
        loadUserStats()
    } else {
        pathStats.value = []
        userStats.value = []
    }
}

// 初始化用户信息和公告列表
const user = ref(JSON.parse(localStorage.getItem("xm-user") || "{}"));
const token = computed(() => user.value?.token ?? '');
const notices = ref([]);
const pathStats = ref([])   // [{path:'...', total:...}]
const userStats = ref([])   // [{userId:123, total:...}]

const statType = ref<'path' | 'user'>('path')

/* 统一的列表 (computed) */
const currentStats = computed(() =>
    statType.value === 'path' ? pathStats.value : userStats.value)

/* 时间线 item 的 key */
const itemKey = (item) =>
    statType.value === 'path' ? item.path : item.userId

/* 标题显示文本 */
const titleText = (item) =>
    statType.value === 'path' ? item.path : `用户 ID：${item.userId}`

const loadPathStats = (start?: string, end?: string) => {
    request.get('/admin/log/stats/path', {
        params: { start, end }
    })
        .then(res => {
            if (res.code === 1) {
                pathStats.value = res.data || []   // [{path:'xxx', total:10}, …]
            } else {
                ElMessage.error(res.msg)
            }
        })
}

const loadUserStats = (start?: string, end?: string) => {
    request.get('/admin/log/stats/user', {
        params: { start, end }
    })
        .then(res => {
            if (res.code === 1) userStats.value = res.data || []
            else ElMessage.error(res.msg)
        }).catch(() => ElMessage.error('获取 User 统计失败'))
}

// 新增：开关切换时触发
function onAutoFetchChange(val: boolean) {
    if (val) {
        // 打开自动加载，立即拉一次
        loadPathStats()
        loadUserStats()
    } else {
        // 关闭自动加载，清空当前数据
        pathStats.value = []
        userStats.value = []
    }
}

// 如果你还想在 onMounted 里根据 autoFetch 决定是否拉：
onMounted(() => {
    if (autoFetch.value) {
        loadPathStats();
        loadUserStats();
    }
})
</script>

<style scoped>
.stats-management {
    padding: 20px;
    background: #f8f9fa;
    min-height: 100vh;
}

/* 搜索和开关区域 */
.search-section {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
}

.switch-container {
    display: flex;
    align-items: center;
}

.search-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.auto-switch :deep(.el-switch__label) {
    font-weight: 500;
    color: #606266;
}

.auto-switch :deep(.el-switch__label.is-active) {
    color: #409eff;
}

.date-picker {
    min-width: 300px;
}

.search-btn {
    border-radius: 8px;
    padding: 10px 20px;
}

.reset-btn {
    border-radius: 8px;
    padding: 10px 20px;
}

/* 欢迎卡片 */
.welcome-card {
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    overflow: hidden;
}

.welcome-content {
    display: flex;
    align-items: center;
    padding: 24px;
    color: white;
}

.welcome-icon {
    font-size: 48px;
    margin-right: 20px;
    opacity: 0.9;
}

.welcome-text h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
}

.welcome-text p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
}

.username {
    color: #ffd700;
    font-weight: 700;
}

/* 数据统计区域 */
.stats-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #ebeef5;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
}

.stats-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
}

.stats-title i {
    font-size: 24px;
    color: #667eea;
}

.dimension-selector {
    display: flex;
    align-items: center;
}

.radio-group :deep(.el-radio-button__inner) {
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}

.radio-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-radius: 8px 0 0 8px;
}

.radio-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 0 8px 8px 0;
}

/* 统计内容 */
.stats-content {
    padding: 20px;
}

.stats-scrollbar :deep(.el-scrollbar__wrap) {
    padding-right: 10px;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #909399;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-text {
    font-size: 16px;
    margin: 0;
}

/* 时间线 */
.stats-timeline {
    max-width: 100%;
}

.timeline-item :deep(.el-timeline-item__wrapper) {
    padding-left: 20px;
}

.timeline-item :deep(.el-timeline-item__node) {
    width: 16px;
    height: 16px;
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 统计卡片 */
.stat-card {
    margin-bottom: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
    border: none;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card-content {
    padding: 4px;
}

.stat-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
    ;
    color: white;
    font-size: 18px;
    margin-right: 12px;
}

.stat-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    word-break: break-all;
    line-height: 1.4;
}

.stat-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9ff;
    border-radius: 8px;
}

.value-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
}

.value-number {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .stats-management {
        padding: 12px;
    }

    .search-group {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .search-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .date-picker {
        min-width: auto;
        width: 100%;
    }

    .search-btn,
    .reset-btn {
        width: 100%;
    }

    .stats-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .dimension-selector {
        justify-content: center;
    }

    .welcome-content {
        flex-direction: column;
        text-align: center;
    }

    .welcome-icon {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .stat-value {
        flex-direction: column;
        gap: 8px;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .stats-content {
        padding: 12px;
    }

    .timeline-item :deep(.el-timeline-item__wrapper) {
        padding-left: 12px;
    }

    .stat-card-content {
        padding: 2px;
    }

    .stats-scrollbar {
        height: 350px !important;
    }
}
</style>