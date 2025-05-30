<template>
  <div class="manager-container">
    <!-- 头部 -->
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="../assets/imgs/join-up-logo.png">
        <div class="title">Join Up!后台管理系统</div>
      </div>

      <div class="manager-header-center">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>

            <el-breadcrumb-item :to="{ path: route.path }" v-if="route.meta.name !== '欢迎页'">
                {{route.meta.name}}
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: route.path }" v-else></el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="manager-header-right">
        <el-dropdown placement="bottom">
          <div class="avatar">
            <span>
              <el-avatar :size="40" :src="user.photo" v-if="user.photo"/>
              <el-avatar :size="40" :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                         v-else/>
            </span>
            <span style="padding: 7px">
              <el-button> {{ user.name || '管理员' }}</el-button>
            </span>

          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <!-- <el-dropdown-item @click="goToPerson">个人信息</el-dropdown-item>
              <el-dropdown-item @click="router.push('/password')">修改密码</el-dropdown-item> -->
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

      </div>
    </div>

    <!-- 主体 -->
    <div class="manager-main">
      <!-- 侧边栏 -->
      <div class="manager-main-left">
        <el-menu :default-openeds="['info', 'reserve', 'user']" router style="border: none" :default-active="route.path"
                 @open="handleOpen" @close="handleClose">
          <el-menu-item index="/welcome">
            <el-icon>
              <HomeFilled/>
            </el-icon>
            <span slot="title"><strong>系统首页</strong></span>
          </el-menu-item>

          <!-- 管理员   -->
          <el-sub-menu index="user" v-if="user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <UserFilled/>
              </el-icon>
              <i class="el-icon-menu"></i><span><strong>用户信息管理</strong></span>
            </template>
            <el-menu-item index="/user">用户管理</el-menu-item>
            <el-menu-item index="/onlinePerson">在线用户</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="chatLog" v-if="user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <UserFilled/>
              </el-icon>
              <i class="el-icon-menu"></i><span><strong>聊天记录管理</strong></span>
            </template>
            <el-menu-item index="/chatLog">聊天记录管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="content" v-if="user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <Histogram/>
              </el-icon>
              <i class="el-icon-menu"></i><span><strong>内容管理</strong></span>
            </template>
            <el-menu-item index="/theme">主题管理</el-menu-item>
            <el-menu-item index="/tag">标签管理</el-menu-item>
            <el-menu-item index="/application">申请管理</el-menu-item>
            <el-menu-item index="/announcement">公告管理</el-menu-item>
            <el-menu-item index="/feedback">反馈管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="reserve" v-if="user.role === 'ADMIN'">
            <template #title>
              <el-icon>
                <Histogram/>
              </el-icon>
              <i class="el-icon-menu"></i><span><strong>组队管理</strong></span>
            </template>
            <el-menu-item index="/team">队伍管理</el-menu-item>
            <el-menu-item index="/teamMember">成员管理</el-menu-item>
            
          </el-sub-menu>





        </el-menu>
      </div>

      <!-- 数据表格 -->
      <div class="manager-main-right">
        <router-view @update:user="updateUser"/>
      </div>

      <!-- 返回顶部 -->
      <el-backtop :bottom="100" :right="150">
        <div
            style="
        height: 100%;
        width: 100%;
        background-color: var(--el-bg-color-overlay);
        box-shadow: var(--el-box-shadow-lighter);
        text-align: center;
        line-height: 40px;
        color: #1989fa;
      "
        >
          UP
        </div>
      </el-backtop>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';

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
</script>

<style scoped>
@import "../assets/css/manager.css";
</style>
