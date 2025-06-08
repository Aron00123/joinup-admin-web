<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goHome() {
  router.replace({ name: 'Home' }) // 根据你的路由名改成正确的
}
</script>

<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>抱歉，你访问的页面不存在。</p>
      <button @click="goHome">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
  padding: 16px;
  box-sizing: border-box;
}
.content {
  text-align: center;
}
.content h1 {
  font-size: 8rem;
  margin: 0;
  color: #3a3f51;
}
.content p {
  margin: 16px 0;
  font-size: 1.25rem;
  color: #6c6f82;
}
.content button {
  padding: 0.75em 2em;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}
.content button:hover {
  background-color: #66b1ff;
}
</style>
