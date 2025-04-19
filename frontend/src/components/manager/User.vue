<template>
    <div>
        <div class="search" style="padding-bottom: 20px">
            <el-input placeholder="请输入学号查询" style="width: 200px" v-model="studentId" />
            <el-button type="info" plain style="margin: 10px" @click="searchStudentId(1)">查询</el-button>
            <el-autocomplete v-model="username" :fetch-suggestions="querySearchUsername" :trigger-on-focus="false" clearable
                class="inline-input w-50" style="width: 200px" placeholder="请输入用户名查询" />
            <el-button type="info" plain style="margin-left: 10px" @click="searchUsername(1)">查询</el-button>
            <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
        </div>

        <div class="operation" style="padding-bottom: 20px">
            <el-button type="danger" plain @click="delBatch">批量删除</el-button>
        </div>

        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="50" sortable />
                <el-table-column prop="username" label="用户名" width="180" align="center" />
                <el-table-column label="头像" width="80" align="center">
                    <template #default="{ row }">
                        <el-image
                            :src="row.photo ? row.photo : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                            :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" style="width: 50px; height: 50px;"
                            fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column prop="gender" label="性别" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column prop="verified" label="认证" />
                <el-table-column prop="studentId" label="学号" />

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

        <el-dialog title="用户信息" v-model="formVisible" width="40%" :close-on-click-modal="false" destroy-on-close>

            <el-form :model="form" label-width="120px" style="padding-right: 30px" :rules="rules" ref="formRef">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="form.password" placeholder="密码"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="gender">
                    <el-input v-model="form.gender" placeholder="性别"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="邮箱"></el-input>
                </el-form-item>
                <el-form-item label="认证" prop="verified">
                    <el-input v-model="form.verified" placeholder="认证"></el-input>
                </el-form-item>
                <el-form-item label="学号" prop="studentId">
                    <el-input v-model="form.studentId" placeholder="学号"></el-input>
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

const tableData = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const studentId = ref("");
const username = ref("");

const formVisible = ref(false);
const form = reactive({});
const rules = reactive({
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});
const ids = ref([]);

const load = (page = 1) => {
    pageNum.value = page;
    request
        .get("/admin/user/count", {
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/user/list", {
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

const handleCurrentChange = (page) => {
    if (username.value && username.value !== "") {
        search(page);
    } else {
        load(page);
    }
};

const handleEdit = (row) => {
    Object.assign(form, { ...row });
    formVisible.value = true;
};

const save = () => {
    // console.log(form)
    
    request.put(`/admin/theme/update/${form.id}`, {
        username: form.username,
        password: form.password,
        gender: form.gender,
        email: form.email,
        verified: form.verified,
        studentId: form.studentId
    }).then(res => {
        if (res.code === 1) {
            ElMessage.success('保存成功');
            load(1);
            formVisible.value = false;
        } else {
            ElMessage.error(res.msg);
        }
    }).catch(() => ElMessage.error('请求失败，请稍后重试'));
    
};

const closeDialog = () => {
    formVisible.value = false;
}

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/user/delete", { data: { id } })
            .then((res) => {
                if (res.code === 1) {
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
        { type: "warning", confirmButtonText: "确认", cancelButtonText: "取消" }).then(() => {
            request
                .delete("/admin/user/delete/batch", { data: { ids: ids.value } })
                .then((res) => {
                    if (res.code === 1) {
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

const querySearchUsername = (queryString, cb) => {
    let results = [];
    request
        .get("/admin/user/querySearch", {
            params: { username: queryString }    // 注意是 params，不是 body
        })
        .then((res) => {
            if (res.code === 1) {
                results = res.data;
                results.forEach(item => {
                    item.value = item.username;
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

const searchUsername = (page) => {
    if (page) pageNum.value = page;
    request
        .get("/admin/user/searchCountUsername", {
            params: {
                username: username.value
            }
        })
        .then((res) => {
            tableData.value = res.data.list || [];
            total.value = res.data.total || 0;
        })
        .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/user/searchUsername", {
            params: {
                username: username.value,
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
}

const searchStudentId = (page) => {
    if (page) pageNum.value = page;
    request
        .get("/admin/user/searchCountStudentId", {
            params: {
                studentId: studentId.value
            }
        })
        .then((res) => {
            tableData.value = res.data.list || [];
            total.value = res.data.total || 0;
        })
        .catch((err) => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/user/searchStudentId", {
            params: {
                studentId: studentId.value,
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
}



const reset = () => {
    studentId.value = "";
    username.value = "";
    load(1);
};



onMounted(() => {
    load(1);
});
</script>

<style scoped></style>