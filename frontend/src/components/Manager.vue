<template>
  <div class="manager-container">
    <!-- 头部 -->
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="../assets/imgs/join-up-logo.png" class="logo">
        <div class="title">Join Up!后台管理系统</div>
      </div>

      <div class="manager-header-center">
        <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: route.path }" v-if="route.meta.name !== '欢迎页'">
                {{route.meta.name}}
            </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="manager-header-right">
        <el-dropdown placement="bottom" class="user-dropdown">
          <div class="avatar-section">
            <el-avatar 
              :size="40" 
              :src="user.photo || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
              class="user-avatar"
            />
            <span class="user-name">{{ user.name || '管理员' }}</span>
            <i class="el-icon-arrow-down dropdown-arrow"></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="user-menu">
              <!-- <el-dropdown-item @click="goToPerson" class="menu-item">
                <i class="el-icon-user"></i>
                个人信息
              </el-dropdown-item>
              <el-dropdown-item @click="router.push('/password')" class="menu-item">
                <i class="el-icon-lock"></i>
                修改密码
              </el-dropdown-item> -->
              <el-dropdown-item @click="logout" class="menu-item logout-item">
                <i class="el-icon-switch-button"></i>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主体 -->
    <div class="manager-main">
      <!-- 侧边栏 -->
      <div class="manager-main-left">
        <el-menu 
          router 
          :default-active="route.path"
          @open="handleOpen" 
          @close="handleClose"
          class="sidebar-menu"
        >
          <el-menu-item index="/welcome" class="menu-item-custom">
            <el-icon class="menu-icon">
              <HomeFilled/>
            </el-icon>
            <span class="menu-title">系统首页</span>
          </el-menu-item>

          <!-- 管理员用户管理 -->
          <el-sub-menu index="user" v-if="user.role === 'ADMIN'" class="sub-menu-custom">
            <template #title>
              <el-icon class="menu-icon">
                <UserFilled/>
              </el-icon>
              <span class="menu-title">用户信息管理</span>
            </template>
            <el-menu-item index="/user" class="sub-menu-item">用户管理</el-menu-item>
            <el-menu-item index="/onlinePerson" class="sub-menu-item">在线用户</el-menu-item>
          </el-sub-menu>

          <!-- 聊天记录管理 -->
          <el-sub-menu index="chatLog" v-if="user.role === 'ADMIN'" class="sub-menu-custom">
            <template #title>
              <el-icon class="menu-icon">
                <ChatDotRound/>
              </el-icon>
              <span class="menu-title">聊天记录管理</span>
            </template>
            <el-menu-item index="/chatLog" class="sub-menu-item">聊天记录管理</el-menu-item>
          </el-sub-menu>

          <!-- 内容管理 -->
          <el-sub-menu index="content" v-if="user.role === 'ADMIN'" class="sub-menu-custom">
            <template #title>
              <el-icon class="menu-icon">
                <Histogram/>
              </el-icon>
              <span class="menu-title">内容管理</span>
            </template>
            <el-menu-item index="/theme" class="sub-menu-item">主题管理</el-menu-item>
            <el-menu-item index="/tag" class="sub-menu-item">标签管理</el-menu-item>
            <el-menu-item index="/application" class="sub-menu-item">申请管理</el-menu-item>
            <el-menu-item index="/announcement" class="sub-menu-item">公告管理</el-menu-item>
            <el-menu-item index="/feedback" class="sub-menu-item">反馈管理</el-menu-item>
          </el-sub-menu>

          <!-- 组队管理 -->
          <el-sub-menu index="reserve" v-if="user.role === 'ADMIN'" class="sub-menu-custom">
            <template #title>
              <el-icon class="menu-icon">
                <UserFilled/>
              </el-icon>
              <span class="menu-title">组队管理</span>
            </template>
            <el-menu-item index="/team" class="sub-menu-item">队伍管理</el-menu-item>
            <el-menu-item index="/teamMember" class="sub-menu-item">成员管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>

      <!-- 数据表格 -->
      <div class="manager-main-right">
        <div class="content-wrapper">
          <router-view @update:user="updateUser"/>
        </div>
      </div>

      <!-- 返回顶部 -->
      <el-backtop :bottom="100" :right="150" class="back-to-top">
        <div class="back-to-top-content">
          <i class="el-icon-top"></i>
          <span>TOP</span>
        </div>
      </el-backtop>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import { HomeFilled, UserFilled, Histogram, ChatDotRound } from '@element-plus/icons-vue';

// 路由实例
const router = useRouter();
const route = useRoute();

// 用户信息
const user = ref(JSON.parse(localStorage.getItem('xm-user') || '{}'));

// 页面初始化检查用户登录状态
onMounted(() => {
  if (!user.value.username) {
    router.push('/login');
  }
});

// 更新用户信息
function updateUser() {
  user.value = JSON.parse(localStorage.getItem('xm-user') || '{}');
}

// 跳转到个人信息页面
function goToPerson() {
    // 跳转到个人信息页面 
    router.push('/adminPerson');
}

// 用户退出登录
function logout() {
  localStorage.removeItem('xm-user');
  router.push('/login');
}

// 菜单展开收起事件
function handleOpen(key) {
  console.log('menu opened:', key);
}

function handleClose(key) {
  console.log('menu closed:', key);
}
</script>

<style scoped>
.manager-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* 头部样式 */
.manager-header {
  height: 60px;
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.manager-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 40px;
  width: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.manager-header-center {
  flex: 1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 40px;
}

.breadcrumb {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: white !important;
  font-weight: 500;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  margin: 0 8px;
}

.manager-header-right {
  display: flex;
  align-items: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-section:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.dropdown-arrow {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 用户菜单样式 */
.user-menu {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: #f0f2f5;
}

.logout-item:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* 主体区域 */
.manager-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.manager-main-left {
  width: 220px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  transition: all 0.3s ease;
}

.sidebar-menu {
  border: none;
  background: white;
}

/* 菜单项样式 */
.menu-item-custom {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-item-custom:hover {
  background: linear-gradient(135deg, #667eea20, #24bc7820);
  transform: translateX(4px);
}

.menu-item-custom.is-active {
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
  color: white;
}

.sub-menu-custom :deep(.el-sub-menu__title) {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.sub-menu-custom :deep(.el-sub-menu__title):hover {
  background: linear-gradient(135deg, #667eea15, #24bc7815);
  transform: translateX(4px);
}

.sub-menu-item {
  margin: 2px 16px;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.3s ease;
}

.sub-menu-item:hover {
  background: #f8f9fa;
  transform: translateX(8px);
}

.sub-menu-item.is-active {
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
  color: white;
}

.menu-icon {
  font-size: 16px;
  margin-right: 8px;
}

.menu-title {
  font-weight: 500;
}

/* 内容区域 */
.manager-main-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

/* 返回顶部 */
.back-to-top :deep(.el-backtop) {
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.back-to-top :deep(.el-backtop):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.back-to-top-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.back-to-top-content i {
  font-size: 16px;
  margin-bottom: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .manager-header {
    padding: 0 16px;
  }
  
  .manager-header-center {
    display: none;
  }
  
  .title {
    font-size: 16px;
  }
  
  .manager-main-left {
    width: 200px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

@media (max-width: 576px) {
  .manager-main-left {
    position: fixed;
    left: -220px;
    height: calc(100vh - 60px);
    z-index: 999;
    transition: left 0.3s ease;
  }
  
  .manager-main-left.show {
    left: 0;
  }
  
  .manager-main-right {
    width: 100%;
  }
}

/* 滚动条美化 */
.manager-main-left::-webkit-scrollbar {
  width: 4px;
}

.manager-main-left::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.manager-main-left::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.manager-main-left::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  opacity: 0.8;
}
</style>