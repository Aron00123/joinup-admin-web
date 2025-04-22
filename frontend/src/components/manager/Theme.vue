<template>
    <div>
        <!-- 查询区域 -->
        <div class="search" style="padding-bottom: 20px">
            <el-autocomplete v-model="themeName" :fetch-suggestions="querySearch" :trigger-on-focus="false"
                clearable class="inline-input w-50" style="width: 200px" placeholder="请输入主题名称查询" />
            <el-button type="info" plain style="margin-left: 10px" @click="search(1)">查询</el-button>
            <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
        </div>

        <!-- 操作区域 -->
        <div class="operation" style="padding-bottom: 20px">
            <el-button type="primary" plain @click="handleAdd">新增</el-button>
            <el-button type="danger" plain @click="delBatch">批量删除</el-button>
        </div>

        <!-- 表格显示 -->
        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="70" align="center" sortable />
                <el-table-column prop="name" label="名称" show-overflow-tooltip />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
                <el-table-column prop="createTime" label="创建时间" />

                <el-table-column label="操作" align="center" width="180">
                    <template #default="{ row }">
                        <el-button size="mini" type="primary" plain @click="handleEdit(row)">编辑</el-button>
                        <el-button size="mini" type="danger" plain @click="del(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination" style="padding-top: 20px">
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total" />
            </div>
        </div>

        <!-- 新增/编辑对话框 -->
        <el-dialog title="主题信息" v-model="formVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
            <el-form :model="form" label-width="150px" style="padding-right: 50px" :rules="rules" ref="formRef">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input type="textarea" rows="3" v-model="form.description" placeholder="描述"></el-input>
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
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import request from "../../utils/request"; // 替换为实际的请求工具

// 数据定义
const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 查询条件
const themeName = ref("");

// 对话框相关
const formVisible = ref(false);
const isHandleAdd = ref(false);
const form = reactive({});
const rules = reactive({});
const ids = ref([]);

// 分页及加载数据
const load = (page = 1) => {
    pageNum.value = page;
    request
        .get("/admin/theme/count", {
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/theme/list", {
            params: {
                page: pageNum.value,               // 第 1 页
                size: pageSize.value,              // 每页 10 条
                // sort: 'create_time,desc',
                // keyword: searchText    // 你的业务查询条件
            }
        })
        .then((res) => {
            tableData.value = res.records || [];
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });

};

// 分页切换
const handleCurrentChange = (page) => {
    if (themeName.value && themeName.value !== "") {
        search(page);
    } else {
        load(page);
    }
};

// 新增处理
const handleAdd = () => {
    Object.assign(form, {}); // 清空 form 对象
    Object.keys(form).forEach((key) => {
        form[key] = null;
    });
    formVisible.value = true;
    isHandleAdd.value = true;
};

// 编辑处理
const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
};


// 保存（新增或编辑）
const save = () => {
    if (isHandleAdd.value) {
        request.post("/admin/theme/add", {
            name: form.name,
            description: form.description
        }).then(res => {
            if (res.code === 1) {
                ElMessage.success('保存成功');
                load(1);
                formVisible.value = false;
            } else {
                ElMessage.error(res.msg);
            }
        }).catch(() => ElMessage.error('请求失败，请稍后重试'));
        isHandleAdd.value = false;
    }
    else {
        request.put(`/admin/theme/update/${form.id}`, {
            name: form.name,
            description: form.description
        }).then(res => {
            if (res.code === 1) {
                ElMessage.success('保存成功');
                load(1);
                formVisible.value = false;
            } else {
                ElMessage.error(res.msg);
            }
        }).catch(() => ElMessage.error('请求失败，请稍后重试'));
    }
};

// 关闭对话框
const closeDialog = () => {
    formVisible.value = false;
    isHandleAdd.value = false;
};

// 删除单条数据
const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/theme/delete", { data: { id } })
            .then((res) => {
                if (res.code === 1) {
                    ElMessage.success("操作成功");
                    load(1);
                } else {
                    ElMessage.error(res.msg);
                }
            })
            .catch(() => {
                ElMessage.error("请求失败，请稍后重试");
            });
    });
};

// 批量删除
const handleSelectionChange = (rows) => {
    ids.value = rows.map((row) => row.id);
};

const delBatch = () => {
    if (!ids.value.length) {
        ElMessage.warning("请选择数据");
        return;
    }
    ElMessageBox.confirm("您确定批量删除这些数据吗？", "确认删除", {
        type: "warning",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/theme/delete/batch", { data: { ids: ids.value } })
            .then((res) => {
                console.log(res.code);
                if (res.code === 1) {
                    ElMessage.success("操作成功");
                    load(1);
                } else {
                    ElMessage.error(res.msg);
                }
            })
            .catch(() => {
                ElMessage.error("请求失败，请稍后重试");
            });
    });
};

// 自动补全查询
const querySearch = (queryString, cb) => {
    let results = [];
    request
        .get("/admin/theme/querySearch", {
            params: { name: queryString }    // 注意是 params，不是 body
        })
        .then((res) => {
            if (res.code === 1) {
                results = res.data;
                results.forEach(item => {
                    item.value = item.name;
                });
                cb(results);
            } else {
                ElMessage.error(res.msg);
            }
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
};

// 查询
const search = (page) => {
    if (page) pageNum.value = page;
    request
        .get("/admin/theme/searchCount", {
            params: {
                name: themeName.value
            }
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/theme/search", {
            params: {
                name: themeName.value,
                page: pageNum.value,               // 第 1 页
                size: pageSize.value,              // 每页 10 条
                // sort: 'create_time,desc',
                // keyword: searchText    // 你的业务查询条件
            }
        })
        .then((res) => {
            tableData.value = res.records || [];
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });

};

// 重置查询条件
const reset = () => {
    themeName.value = "";
    load(1);
};

onMounted(() => {
    load(1);
});
</script>

<style scoped>
/* 根据需要添加组件特有的样式 */
.search,
.operation,
.table {
    margin-bottom: 20px;
}
</style>
