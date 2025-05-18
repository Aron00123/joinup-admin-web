<template>
    <div>
        <div class="search">
            <el-date-picker
                v-model="dateRange"            
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"     
                :size="'default'"
            />

            <el-button type="info" plain style="margin-left: 10px" @click="onSearch">查询</el-button>
            <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
        </div>

        <div class="card"
            style="padding: 15px; font-family: Arial, sans-serif; color: #333; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); background-color: #f9f9f9; border-radius: 5px;">
            您好，<strong>{{ user.name ? user.name : 'ADMIN' }}</strong>！欢迎使用Join Up!后台管理系统
        </div>

        <div style="display: flex; margin: 10px 0">
            <div style="width: 100%;" class="card">
                <div style="margin-bottom: 30px; font-size: 20px; font-weight: bold">
                    接口数据
                </div>
                <div>
                    <el-scrollbar height="480px">
                        <el-timeline style="max-width:600px">
                            <el-timeline-item v-for="item in currentStats" :key="statType + '-' + itemKey(item)"
                                placement="top">
                                <el-card shadow="hover">
                                    <h4>{{ titleText(item) }}</h4>
                                    <p>调用总数：{{ item.total }}</p>
                                </el-card>
                            </el-timeline-item>
                        </el-timeline>
                    </el-scrollbar>

                    <!-- ★ 维度切换按钮组，放在之前分页条的位置 ★ -->
                    <div style="text-align:right; padding-top:20px">
                        <el-radio-group v-model="statType" size="small">
                            <el-radio-button label="path">按接口</el-radio-button>
                            <el-radio-button label="user">按用户</el-radio-button>
                        </el-radio-group>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { onMounted, ref, computed } from "vue";
import request from "../../utils/request"; // 引入封装的 axios 实例

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

// 在组件挂载时调用公告数据获取方法
onMounted(() => {
    loadPathStats();
    loadUserStats();
});
</script>

<style scoped>
.container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: url("https://s2.loli.net/2024/07/05/aR7VSyNw5vjhUkC.jpg") no-repeat center;
    background-size: cover;
}

.card {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 15px;
    margin: 10px;
}
</style>