<template>
  <div>
    <!-- 站点头部 -->
    <header class="fixed-header">
      <h1>JOINUP</h1>
      <!-- 顶部右侧登录按钮 -->
      <router-link to="/login" class="login-btn header-login">进入后台系统</router-link>
    </header>

    <!-- 主导航 -->
    <nav>
      <a href="#" @click.prevent="currentSection='home'" :class="{ active: currentSection==='home' }">产品介绍</a>
      <a href="#" @click.prevent="currentSection='about'" :class="{ active: currentSection==='about' }">关于我们</a>
      <a href="#" @click.prevent="currentSection='contact'" :class="{ active: currentSection==='contact' }">联系我们</a>
    </nav>

    <!-- 动态内容区域 -->
    <main id="main-content">
      <!-- 产品介绍 -->
      <section v-if="currentSection==='home'" class="banner_con">
        <div class="left">
          <h2>让找搭子更简单</h2>
          <p>
            <span>Find your partner！学习伙伴、旅游搭子、游戏好友，在这个人与人之间联系愈发紧密的时代，越来越多的场景呼吁我们去寻找自己的伙伴。</span>
            <span>正是在这样的背景之下，我们设计了"JoinUp!"这款小程序，以组队为核心功能，旨在帮助各个领域、各种身份、各种需求的人找到适合自己的伙伴。</span>
          </p>
        </div>
        <div class="right">
          <img src="https://joinup.oss-cn-beijing.aliyuncs.com/images/official_website/ef6815fc285d15c71456b038a86e357.jpg" alt="JoinUp 小程序二维码" />
        </div>
      </section>

      <!-- 关于我们 -->
      <section v-else-if="currentSection==='about'" class="banner_con">
        <div class="left">
          <h2>关于我们</h2>
          <p>北京航空航天大学软件工程课程大作业：</p>
          <p>
            <a href="https://edu.cnblogs.com/campus/buaa/BUAA_SE_2025_LR" target="_blank">
              2025年春季软件工程（罗杰、任健）
            </a>
          </p>
          <p>后端 GitHub 仓库：
            <a href="https://github.com/XuanxuanRao/joinup-server" target="_blank">https://github.com/XuanxuanRao/joinup-server</a>
          </p>
          <p>管理页面前端 GitHub 仓库：
            <a href="https://github.com/Aron00123/joinup-admin-web" target="_blank">https://github.com/Aron00123/joinup-admin-web</a>
          </p>
        </div>
        <div class="right">
          <img src="https://joinup.oss-cn-beijing.aliyuncs.com/images/official_website/about-us-2150927_1920.png" alt="关于我们" />
        </div>
      </section>

      <!-- 联系我们 -->
      <section v-else class="banner_con">
        <div class="left">
          <h2>联系我们</h2>
          <p>邮箱：joinup_service@163.com</p>
        </div>
        <div class="right">
          <img src="https://joinup.oss-cn-beijing.aliyuncs.com/images/official_website/email-3249062_1920.png" alt="联系我们" />
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="fixed-footer">
      &copy; 2025 我的前端页面. 保留所有权利。
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 当前展示的区块
const currentSection = ref('home')
</script>

<style>
/***************  全局基础样式  ***************/
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #f9faff;
  color: #333;
}

/***************  头部  ***************/
header {
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);;
  color: #333;
  padding: 1rem 2rem; /* 右边留点内边距 */
  text-align: center;
  position: relative; /* 用于绝对定位按钮 */
}
header h1 {
  font-family: 'Pacifico', cursive;
  font-size: 3.5rem;
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f64f59);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  margin: 0;
}

header.fixed-header {
  background: #3dc2e7;
  color: #333;
  padding: 1rem 2rem; /* 右边留点内边距 */
  text-align: center;
  position: relative; /* 用于绝对定位按钮 */
}
header.fixed-header h1 {
  font-family: 'Pacifico', cursive;
  font-size: 3.5rem;
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f64f59);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
  margin: 0;
}

/***************  导航  ***************/
nav {
  background-color: #f0f0f0;
  padding: 0.5rem;
  text-align: center;
}
nav a {
  display: inline-block;
  margin: 0 15px;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  position: relative;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
}
nav a::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  background: #007bff;
  left: 0;
  bottom: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
nav a:hover {
  color: #007bff;
}
nav a:hover::after,
nav a.active::after {
  transform: scaleX(1);
}
nav a.active {
  color: #007bff;
}

/***************  主内容区  ***************/
main {
  max-width: 900px;
  margin: 2rem auto 5rem; /* 底部给 footer 留空间 */
  padding: 0 1rem;
  box-sizing: border-box;
}

/***************  Banner 块  ***************/
.banner_con {
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  padding: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.banner_con .left {
  flex: 1 1 350px;
  min-width: 280px;
}
.banner_con .left h2 {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 1rem;
}
.banner_con .left p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
}
.banner_con .left p span {
  display: block;
  margin-bottom: 0.5rem;
}
.banner_con .left a {
  color: #007bff;
  text-decoration: none;
}
.banner_con .left a:hover {
  text-decoration: underline;
}
.banner_con .right {
  flex: 1 1 300px;
  text-align: center;
  min-width: 280px;
}
.banner_con .right img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
  transition: transform 0.3s ease;
}
.banner_con .right img:hover {
  transform: scale(1.05);
}

/***************  登录按钮  ***************/
.login-btn {
  display: inline-block;
  background: linear-gradient(135deg, #70deac 0%, #8ea1f4 100%);;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.4);
  transition: background 0.3s ease, transform 0.3s ease;
  white-space: nowrap;
}
.login-btn:hover {
  background: linear-gradient(135deg, #8ea1f4 100%, #70deac 0%,);;
  transform: translateY(-15px);
}
/* 头部右侧按钮位置 */
.header-login {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

/***************  页脚  ***************/



footer.fixed-footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  font-size: 0.9rem;
}

footer {

  color: white;
  text-align: center;

  padding: 1rem;
  bottom: 0;
  width: 100%;
  font-size: 0.9rem;
}
</style>