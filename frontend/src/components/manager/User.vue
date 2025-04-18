<template>
    <div>
      <div class="search" style="padding-bottom: 20px">
        <el-input placeholder="请输入账号查询" style="width: 200px" v-model="id"/>
        <el-button type="info" plain style="margin: 10px" @click="load(1)">查询</el-button>
        <el-autocomplete
            v-model="name"
            :fetch-suggestions="querySearchUser"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            style="width: 200px"
            placeholder="请输入用户昵称查询"
        />
        <el-button type="info" plain style="margin-left: 10px" @click="querySearchAdmin(1)">查询</el-button>
        <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
      </div>
  
      <div class="operation" style="padding-bottom: 20px">
        <el-button type="primary" plain @click="handleAdd">新增</el-button>
        <el-button type="danger" plain @click="delBatch">批量删除</el-button>
      </div>
  
      <div class="table">
        <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column prop="id" label="账号" width="180" align="center" sortable/>
          <el-table-column label="头像">
            <template #default="{ row }">
              <el-image
                  :src="row.photo ? row.photo : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                  :zoom-rate="1.2"
                  :max-scale="7"
                  :min-scale="0.2"
                  style="width: 50px; height: 50px;"
                  fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="昵称"/>
          <el-table-column prop="age" label="年龄"/>
          <el-table-column prop="gender" label="性别"/>
          <el-table-column prop="phone" label="电话"/>
          <el-table-column prop="emergencyPhone" label="紧急联系人电话"/>
          <el-table-column prop="address" label="家庭住址"/>
  
          <el-table-column label="操作" align="center" width="180">
            <template #default="{ row }">
              <el-button size="mini" type="primary" plain @click="handleEdit(row)">编辑</el-button>
              <el-button size="mini" type="danger" plain @click="del(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <div class="pagination" style="padding-top: 20px">
          <el-pagination
              background
              @current-change="handleCurrentChange"
              :current-page="pageNum"
              :page-sizes="[5, 10, 20]"
              :page-size="pageSize"
              layout="total, prev, pager, next"
              :total="total"
          />
        </div>
      </div>
  
      <el-dialog
          title="用户信息"
          v-model="formVisible"
          width="40%"
          :close-on-click-modal="false"
          destroy-on-close
      >
  
        <el-form :model="form" label-width="120px" style="padding-right: 30px" :rules="rules" ref="formRef">
          <el-form-item label="身份证号" prop="id">
            <el-input v-model="form.id" placeholder="身份证号"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" placeholder="密码"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="姓名"></el-input>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input v-model="form.age" placeholder="年龄"></el-input>
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-input v-model="form.gender" placeholder="性别"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="form.phone" placeholder="电话"></el-input>
          </el-form-item>
          <el-form-item label="紧急联系人电话" prop="emergencyPhone">
            <el-input v-model="form.emergencyPhone" placeholder="紧急联系人电话"></el-input>
          </el-form-item>
          <el-form-item label="家庭住址" prop="address">
            <el-input v-model="form.address" placeholder="家庭住址"></el-input>
          </el-form-item>
  
        </el-form>
  
        <template #footer>
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import {ref, reactive, onMounted} from "vue";
  import {ElMessage, ElMessageBox} from "element-plus";
  import request from "../../utils/request"; // 替换为实际的请求工具
  
  const tableData = ref([]);
  const pageNum = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const user = JSON.parse(localStorage.getItem('xm-user') || '{}');
  
  const id = ref("");
  const name = ref("");
  
  const formVisible = ref(false);
  const isHandleAdd = ref(false);
  const form = reactive({});
  const rules = reactive({
    id: [{required: true, message: "请输入账号", trigger: "blur"}],
  });
  const ids = ref([]);
  
  const load = (page = 1) => {
    pageNum.value = page;
    request
        .post("/user/selectPage", {
          pageNum: pageNum.value, pageSize: pageSize.value, userId: id.value
        })
        .then((res) => {
          tableData.value = res.data?.list || [];
          total.value = res.data?.total || 0;
        })
        .catch((err) => {
          ElMessage.error("请求失败，请稍后重试");
        });
  };
  
  const querySearchUser = (queryString, cb) => {
    let results = [];
    request
        .post("/user/querySearch", {queryString: queryString})
        .then((res) => {
          if (res.code === "200") {
            results = res.data;
            results.forEach(item => {
              item.value = item.name;
            });
            cb(results)
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("请求失败，请稍后重试");
        });
  }
  
  const querySearchAdmin = (page) => {
    if (page) pageNum.value = page;
    request
        .post("/user/querySearchAdmin", {
          pageNum: pageNum.value, pageSize: pageSize.value, id: name.value
        })
        .then((res) => {
          tableData.value = res.data.list || [];
          total.value = res.data.total || 0;
        })
        .catch((err) => {
          ElMessage.error("请求失败，请稍后重试");
        });
  }
  
  const handleAdd = () => {
    Object.assign(form, {});
    Object.keys(form).forEach((key) => {
      form[key] = null;
    })
    formVisible.value = true;
    isHandleAdd.value = true;
  };
  
  const handleEdit = (row) => {
    Object.assign(form, {...row});
    formVisible.value = true;
  };
  
  const save = () => {
    form.role = 'PATIENT';
    console.log(form)
    if (form.password === "") {
      form.password = null;
    }
    if (isHandleAdd.value) {
      request
          .post("/register", form)
          .then((res) => {
                  if (res.code === "200") {
                    ElMessage.success("保存成功");
                    load(1);
                    formVisible.value = false;
                  } else {
                    ElMessage.error(res.msg);
                  }
                })
          .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
          });
      isHandleAdd.value = false;
    } else {
      request
          .post("/updatePassword", {
            id: form.id,
            role: form.role,
            password: form.password,
            newPassword: form.password
          })
          .then((res) => {
            request
                .post("/user/update", form)
                .then((res) => {
                  if (res.code === "200") {
                    ElMessage.success("保存成功");
                    load(1);
                    formVisible.value = false;
                  } else {
                    ElMessage.error(res.msg);
                  }
                })
                .catch((err) => {
                  ElMessage.error("请求失败，请稍后重试");
                });
          })
          .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
          });
    }
  };
  
  const closeDialog = () => {
    formVisible.value = false;
    isHandleAdd.value = false;
  }
  
  const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
      type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
      request
          .post("/user/delete", {id: id})
          .then((res) => {
            if (res.code === "200") {
              ElMessage.success("操作成功");
              load(1);
            } else {
              ElMessage.error(res.msg);
            }
          })
          .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
          });
  
    });
  };
  
  const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
  };
  
  const delBatch = () => {
    if (!ids.value.length) {
      ElMessage.warning("请选择数据");
      return;
    }
    ElMessageBox.confirm("您确定批量删除这些数据吗？", "确认删除",
        {type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"}).then(() => {
      request
          .post("/user/delete/batch", {ids: ids.value})
          .then((res) => {
            if (res.code === "200") {
              ElMessage.success("操作成功");
              load(1);
            } else {
              ElMessage.error(res.msg);
            }
          })
          .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
          });
    });
  };
  
  const reset = () => {
    id.value = "";
    name.value = "";
    load(1);
  };
  
  const handleCurrentChange = (page) => {
      if (name.value && name.value !== "") {
        querySearchAdmin(page)
      } else {
        load(page)
      }
    };
  
  onMounted(() => {
    load(1);
  });
  </script>
  
  <style scoped>
  </style>
  