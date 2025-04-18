<template>
  <div>
    <el-card style="width: 50%; height: 300px; margin: 0 auto;">
      <el-form ref="formRef" :model="user" :rules="rules" label-width="100px" style="padding: 50px">
        <el-form-item label="原始密码" prop="inputPassword">
          <el-input show-password v-model="user.inputPassword" placeholder="原始密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input show-password v-model="user.newPassword" placeholder="新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input show-password v-model="user.confirmPassword" placeholder="确认新密码"></el-input>
        </el-form-item>
        <div style="text-align: center; margin-bottom: 20px">
          <el-button type="primary" @click="update">确认修改</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from "../../utils/request.js";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";
const router = useRouter();

// 使用 ref 来存储用户信息
const user = ref(JSON.parse(localStorage.getItem('xm-user') || '{}'))
const formRef = ref(null)  // 表单引用

// 验证原始密码是否正确
const isCorrectPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入原始密码'))
  } else if (value !== user.value.password) {
    callback(new Error('密码错误'))
  } else {
    callback()
  }
}

// 验证确认密码的自定义规则
const validatePassword = (rule, value, callback) => {
  if (value === null) {
    callback(new Error('请确认密码'))
  } else if (value !== user.value.newPassword) {
    callback(new Error('确认密码错误'))
  } else {
    callback()
  }
}


// 表单验证规则
const rules = {
  inputPassword: [
    { validator: isCorrectPassword, required: true, trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: validatePassword, required: true,trigger: 'blur' },
  ],
}

// 更新密码的方法
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log(user.value)
      request
          .post("/updatePassword", user.value)
          .then((res) => {
            if (res.code === "200") {
              localStorage.removeItem('xm-user')  // 清除缓存的用户信息
              ElMessage.success("修改成功");
              router.push("/login"); // 跳转登录页面
            } else {
              ElMessage.error(res.msg);
            }
          })
          .catch((error) => {
            ElMessage.error("请求失败，请稍后重试");
          });
    }
  })
}
</script>

<style scoped>
::v-deep(.el-form-item__label) {
  font-weight: bold;
}
</style>
