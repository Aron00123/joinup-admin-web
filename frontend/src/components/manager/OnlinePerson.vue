<template>
  <div>
    <el-row :gutter="20" class="card-list">
      <el-col
        v-for="user in tableData"
        :key="user.id"
        :xs="12" :sm="8" :md="6" :lg="4" :xl="8"
      >
        <el-card class="user-card" shadow="hover">
          <!-- 核心：一行 flex 容器 -->
          <div class="card-content">
            <!-- 左侧头像 -->
            <el-image
              class="avatar-img"
              :src="user.avatar || defaultAvatar"
              fit="cover"
            />
            <!-- 右侧两行信息 -->
            <div class="info">
              <div class="username">{{ user.username }}</div>
              <div class="user-id">ID: {{ user.id }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'

const tableData = ref([])
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const load = (page = 1) => {
  request.get('/admin/user/online/list', { params: { page, size: 10 } })
    .then(res => tableData.value = res.records || [])
    .catch(() => ElMessage.error('加载失败'))
}

onMounted(() => load())
</script>

<style scoped>
.card-list {
  margin-bottom: 20px;
}

/* 卡片宽度限制 */
.user-card {
  max-width: 180px;
  margin: 0 auto;
  padding: 12px;
}

/* 一行 flex 布局 */
.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 头像固定大小 */
.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  flex-shrink: 0; /* 不被压缩 */
}

/* 信息区：竖直两行，等高填满头像高度 */
.info {
  display: flex;
  flex-direction: column;
  height: 60px;
  justify-content: center;
  row-gap: 4px;
}

/* 样式微调 */
.username {
  font-size: 14px;
  font-weight: 500;
}
.user-id {
  font-size: 12px;
  color: #666;
}
</style>
