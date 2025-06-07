import { createRouter, createWebHashHistory } from "vue-router";

import Login from "../components/Login.vue";
import Manager from "../components/Manager.vue";
import NotFound from "../components/404.vue";
import User from "../components/manager/User.vue";
import Welcome from "../components/manager/Welcome.vue";
import Theme from "../components/manager/Theme.vue";
import Tag from "../components/manager/Tag.vue";
import Team from "../components/manager/Team.vue";
import Application from "../components/manager/Application.vue";
import Announcement from "../components/manager/Announcement.vue";
import TeamMember from "../components/manager/TeamMember.vue";
import Feedback from "../components/manager/Feedback.vue";
import ChatLog from "../components/manager/ChatLog.vue";
import OnlinePerson from "../components/manager/OnlinePerson.vue";
import Home from "../components/Home.vue";
import ConversationDetail from "../components/manager/ConversationDetail.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Manager",
      component: Manager,
      redirect: "/home",
      children: [
        {
          path: "welcome",
          name: "Welcome",
          meta: { name: "欢迎页" },
          component: Welcome,
        },
        {
          path: "user",
          name: "User",
          meta: { name: "用户信息" },
          component: User,
        },
        {
          path: "theme",
          name: "Theme",
          meta: { name: "主题管理" },
          component: Theme,
        },
        {
          path: "tag",
          name: "Tag",
          meta: { name: "标签管理" },
          component: Tag,
        },
        {
          path: "team",
          name: "Team",
          meta: { name: "队伍管理" },
          component: Team,
        },
        {
          path: "application",
          name: "Application",
          meta: { name: "申请管理" },
          component: Application,
        },
        {
          path: "announcement",
          name: "Announcement",
          meta: { name: "公告管理" },
          component: Announcement,
        },
        {
          path: "teamMember",
          name: "TeamMember",
          meta: { name: "成员管理" },
          component: TeamMember,
        },
        {
          path: "feedback",
          name: "Feedback",
          meta: { name: "反馈管理" },
          component: Feedback,
        },
        {
          path: "chatLog",
          name: "ChatLog",
          meta: { name: "聊天记录" },
          component: ChatLog,
        },
        {
          path: "onlinePerson",
          name: "OnlinePerson",
          meta: { name: "在线用户" },
          component: OnlinePerson,
        },
        {
          path: "chatLog/conversation/:id",
          name: "ConversationDetail",
          meta: { name: "会话详情" },
          component: ConversationDetail,
        },
      ],
    },
    {
      path: "/login",
      name: "Login",
      meta: { name: "登录" },
      component: Login,
    },
    {
      path: "/home",
      name: "Home",
      meta: { name: "主页" },
      component: Home,
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      meta: { name: "无法访问" },
      component: NotFound,
    },
  ],
});

export default router;
