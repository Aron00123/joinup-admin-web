<template>
  <div>
    <el-card style="width: 50%; height: 300px; margin: 0 auto;">
      <el-form :model="user" label-width="130px" style="padding-right: 50px">
        <div style="margin: 15px; text-align: center">
            <img :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="avatar"/>
        </div>
        <el-form-item label="管理员编号" prop="id" style="padding: 20px">
          <el-input v-model="user.id" placeholder="用户名" disabled></el-input>
        </el-form-item>

      </el-form>
    </el-card>

  </div>
</template>

<script setup>
import {ref, reactive, onMounted} from 'vue';
import request from "../../utils/request.js";
import {ElMessage} from "element-plus";

// Reactive states
const user = reactive(JSON.parse(localStorage.getItem('xm-user') || '{}'));

// On mounted lifecycle hook
onMounted(() => {
});
</script>


<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
  border-radius: 50%;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>