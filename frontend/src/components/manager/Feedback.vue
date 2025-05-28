<template>
    <div>

        <div class="operation" style="padding-bottom: 20px">
            <el-button type="danger" plain @click="delBatch">批量删除</el-button>
        </div>

        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column prop="id" label="序号" width="50" sortable />
                <el-table-column prop="userId" label="用户id" align="center" />
                <el-table-column prop="content" label="反馈内容" />
                <el-table-column prop="contact" label="联系方式" />
                <el-table-column prop="handled" label="处理情况" />

                <el-table-column label="操作" align="center" width="180">
                    <template #default="{ row }">
                        <!-- <el-button size="mini" type="primary" plain @click="handleEdit(row)">编辑</el-button> -->
                        <el-button size="mini" type="danger" plain @click="del(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination" style="padding-top: 20px">
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total" />
            </div>
        </div>

        <el-dialog title="反馈信息" v-model="formVisible" width="40%" :close-on-click-modal="false" destroy-on-close>

            <el-form :model="form" label-width="120px" style="padding-right: 30px" :rules="rules" ref="formRef">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="form.username" placeholder="用户名" disabled></el-input>
                </el-form-item>
                <el-form-item label="内容" prop="content" disabled >
                    <el-input v-model="form.content" placeholder="内容" disabled></el-input>
                </el-form-item>
                <el-form-item label="联系方式" prop="contact" disabled>
                    <el-input v-model="form.contact" placeholder="联系方式" disabled></el-input>
                </el-form-item>
                <el-form-item label="处理情况" prop="handled">
                    <el-input v-model="form.handled" placeholder="处理情况"></el-input>
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
        .get("/admin/message/feedback/count", {
        })
        .then((res) => {
            console.log(res);
            total.value = Number(res.data) || 0;
        })
        .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
        });
    request
        .get("/admin/message/feedback/list", {
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


const closeDialog = () => {
    formVisible.value = false;
}

const del = (id) => {
    ElMessageBox.confirm("您确定删除吗？", "确认删除", {
        type: "warning", confirmButtonText: "确认", cancelButtonText: "取消"
    }).then(() => {
        request
            .delete("/admin/message/feedback/delete", { data: { id } })
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

const search = (page) => {
    if (page) pageNum.value = page;
    request
        .get("/admin/message/feedback/searchCount", {
            params: {
                name: teamName.value
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
        .get("/admin/message/feedback/search", {
            params: {
                name: teamName.value,
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
                .delete("/admin/message/feedback/delete/batch", { data: { ids: ids.value } })
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