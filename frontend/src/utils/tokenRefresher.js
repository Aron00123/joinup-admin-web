// src/utils/tokenRefresher.js
import request from './request';

let refreshTimer = null;

/**
 * 启动或重启 token 刷新定时器
 * @param {number} intervalMinutes 刷新间隔，建议设置在 token 过期前（如 19 分钟）
 */
export function scheduleTokenRefresh(intervalMinutes = 19) {
  // 清掉旧的定时
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // 安排下一次刷新
  refreshTimer = setTimeout(async () => {
    try {
      // 从 localStorage 取出用户名/密码
      const user = JSON.parse(localStorage.getItem('xm-user') || '{}');
      if (user.username && user.password) {
        // 重用你的 request 实例发登录
        const res = await request.post('/user/login', {
          username: user.username,
          password: user.password
        });
        // 假设后端 code===1，并且 data.token 是新的 token
        if (res.code === 1 && res.data?.token) {
          user.token = res.data.token;
          localStorage.setItem('xm-user', JSON.stringify(user));
          console.log('[tokenRefresher] token 已刷新');

          // 递归安排下次
          scheduleTokenRefresh(intervalMinutes);
        } else {
          console.warn('[tokenRefresher] 刷新 token 失败：', res.msg);
        }
      }
    } catch (err) {
      console.error('[tokenRefresher] 刷新 token 出错：', err);
    }
  }, intervalMinutes * 60 * 1000);
}

/** 停止自动刷新 */
export function clearTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
