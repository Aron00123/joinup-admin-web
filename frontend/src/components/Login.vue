<template>
  <div class="container">

    <div class="login">
      <div class="signin-panel">
        <h1>Join Up!后台</h1>
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item prop="id">
            <el-input
                prefix-icon="User"
                placeholder="用户名"
                v-model="form.id"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
                prefix-icon="Lock"
                placeholder="密码"
                show-password
                v-model="form.password"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                class="signin-btn"
                @click="onLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import request from "../utils/request";
import {scheduleTokenRefresh} from "../utils/tokenRefresher";

const form = reactive({
  id: "",
  password: "",
});

const rules = {
  id: [{required: true, message: "请输入账号", trigger: "blur"}],
  password: [{required: true, message: "请输入密码", trigger: "blur"}],
};

const formRef = ref(null);
const router = useRouter();

// 登录认证信息
const loginCredentials = {
  // 登录用户名，这里从环境变量获取，也可以写死（但是不建议）
  username: "kg",
  // 登录密码，这里从环境变量获取，也可以写死（但是不建议）
  password: "rcx123456",
};

// 登录方法
const onLogin = () => {

  formRef.value.validate((valid) => {
    if (valid) {

      // 发起登录请求
        request({
            url: "http://localhost:8088/user/login",
            // url: "https://joinup.org.cn/api/user/login",
            // url: "http://123.56.43.103/api/user/login",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                username: form.id,
                password: form.password
            }
        })
        .then(response => {
            if (response.code === 1) {
                // 存储用户数据到本地
                let user = response.data;
                // user.id = loginCredentials.username
                user.username = loginCredentials.username;
                user.name = loginCredentials.username;
                user.password = loginCredentials.password;
                user.token = response.data.token;
                user.role = "ADMIN";
                localStorage.setItem("xm-user", JSON.stringify(user));
                const user1 = JSON.parse(localStorage.getItem("xm-user") || "{}");

                scheduleTokenRefresh(19);

                // 跳转主页
                router.push("/");
                ElMessage.success("登录成功");
            } else {
              ElMessage.error(response.msg || "登录失败");
            }
          })
          .catch((err) => {
            ElMessage.error("账号或密码错误，请稍后重试");
            console.error(err);
          });

    } else {
      ElMessage.warning("请填写完整的登录信息");
    }
  });
};

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

.login {
  display: flex;
  width: 425px;
  height: 500px;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
}

.signin-panel {
  width: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.signin-panel {
  background: #fff;
}

.signin-btn {
  background-color: #4284db;
  color: white;
  width: 100%;
}

</style>
