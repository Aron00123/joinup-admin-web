<template>
    <div>
      <div class="search" style="padding-bottom: 20px">
        <el-autocomplete
            v-model="id"
            :fetch-suggestions="querySearchpost"
            :trigger-on-focus="false"
            clearable
            class="inline-input w-50"
            style="width: 200px"
            placeholder="请输入帖子名称查询"
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
          <el-table-column prop="id" label="序号" width="70" align="center" sortable/>
          <el-table-column prop="name" label="标题" show-overflow-tooltip/>
          <el-table-column prop="symptoms" label="作者" show-overflow-tooltip/>
          <el-table-column prop="description" label="发帖时间"/>
          <el-table-column prop="cause" label="最后修改时间"/>
          <el-table-column prop="epidemic" label="标签" show-overflow-tooltip/>
  
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
          title="疾病信息"
          v-model="formVisible"
          width="40%"
          :close-on-click-modal="false"
          destroy-on-close
      >
  
        <el-form :model="form" label-width="150px" style="padding-right: 50px" :rules="rules" ref="formRef">
          <el-form-item label="疾病名称" prop="postName">
            <el-input v-model="form.name" placeholder="疾病名称"></el-input>
          </el-form-item>
          <el-form-item label="症状" prop="symptoms">
            <el-input type="textarea" rows="3" v-model="form.symptoms" placeholder="症状"></el-input>
          </el-form-item>
          <el-form-item label="疾病介绍" prop="description">
            <el-input type="textarea" rows="3" v-model="form.description" placeholder="疾病介绍"></el-input>
          </el-form-item>
          <el-form-item label="病因" prop="cause">
            <el-input type="textarea" rows="3" v-model="form.cause" placeholder="病因"></el-input>
          </el-form-item>
          <el-form-item label="传染性" prop="epidemic">
            <el-input v-model="form.epidemic" placeholder="传染性"></el-input>
          </el-form-item>
          <el-form-item label="诊断方式" prop="checkWay">
            <el-input v-model="form.checkWay" placeholder="诊断方式"></el-input>
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
  
  const tableData = ref([{
    id: 1
  }]);
  const pageNum = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  
  const id = ref("");
  
  const formVisible = ref(false);
  const isHandleAdd = ref(false);
  const form = reactive({});
  const rules = reactive({});
  const ids = ref([]);
  
  const load = (page = 1) => {
    pageNum.value = page;
    request
        .post("/post/selectPage", {
          pageNum: pageNum.value, pageSize: pageSize.value, id: id.value
        })
        .then((res) => {
          tableData.value = res.data.list || [];
          total.value = res.data.total || 0;
        })
        .catch((err) => {
          ElMessage.error("请求失败，请稍后重试");
        });
  };
  
  const querySearchpost = (queryString, cb) => {
    let results = [];
    request
        .post("/post/querySearch", {queryString: queryString})
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
        .post("/post/querySearchAdmin", {
          pageNum: pageNum.value, pageSize: pageSize.value, id: id.value
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
    request
        .post(isHandleAdd.value ? "/post/add" : "/post/update", form)
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
          .post("/post/delete", {id: id})
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
          .post("/post/delete/batch", {ids: ids.value})
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
    load(1);
  };
  
  const handleCurrentChange = (page) => {
    if (id.value && id.value !== "") {
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
  