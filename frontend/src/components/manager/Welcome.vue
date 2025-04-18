<template>
    <div>
      <div class="card"
           style="padding: 15px; font-family: Arial, sans-serif; color: #333; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); background-color: #f9f9f9; border-radius: 5px;">
        您好，<strong>{{ user.name ? user.name : 'ADMIN' }}</strong>！欢迎使用Join Up!后台管理系统
      </div>
  
      <div style="display: flex; margin: 10px 0">
        <div style="width: 100%;" class="card">
          <div style="margin-bottom: 30px; font-size: 20px; font-weight: bold">
            仪表盘
          </div>
          <div>
            <el-timeline style="max-width: 600px">
              <el-timeline-item v-for="item in notices"
                                :key="item.id"
                                :timestamp="item.time"
                                placement="top">
                <el-card>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.content }}</p>
                </el-card>
              </el-timeline-item>
  
            </el-timeline>
  
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import {ElMessage} from "element-plus";
  import {onMounted, ref, computed} from "vue";
  import request from "../../utils/request"; // 引入封装的 axios 实例
  
  // 初始化用户信息和公告列表
  const user = ref(JSON.parse(localStorage.getItem("xm-user") || "{}"));
  const token = computed(() => user.value?.token ?? '');
  const notices = ref([]);
  
  // 获取公告数据
  const fetchData = async () => {
    request
        .post("/notice/selectAll")
        .then((res) => {
          if (res.code === "200") {
            notices.value = res.data ? res.data : [];
            console.log(notices)
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("请求失败，请稍后重试");
        });
  };
  
  // 在组件挂载时调用公告数据获取方法
  onMounted(() => {
    fetchData();
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
  
  
  