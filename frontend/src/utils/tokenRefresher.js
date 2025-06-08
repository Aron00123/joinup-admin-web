// src/utils/tokenRefresher.js
import request from "./request";

let refreshTimer = null;
let retryCount = 0;
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 30000; // 30秒后重试

/**
 * 启动或重启 token 刷新定时器
 * @param {number} intervalMinutes 刷新间隔，建议设置在 token 过期前（如 10 分钟）
 */
export function scheduleTokenRefresh(intervalMinutes = 10) {
    // 清掉旧的定时器
    if (refreshTimer) {
        clearTimeout(refreshTimer);
    }

    // 安排下一次刷新
    refreshTimer = setTimeout(async () => {
        await refreshToken(intervalMinutes);
    }, intervalMinutes * 60 * 1000);
}

/**
 * 执行 token 刷新逻辑
 */
async function refreshToken(intervalMinutes) {
    try {
        // 检查用户是否仍然登录
        const user = JSON.parse(localStorage.getItem("xm-user") || "{}");
        if (!user.username || !user.password || !user.token) {
            console.log("[tokenRefresher] 用户未登录，停止刷新");
            return;
        }

        console.log("[tokenRefresher] 开始刷新 token...");

        const res = await request.get("user/refreshToken");

        if (res.code === 1 && res.data?.token) {
            // 刷新成功
            user.token = res.data.token;
            localStorage.setItem("xm-user", JSON.stringify(user));
            console.log("[tokenRefresher] token 刷新成功");

            // 重置重试计数
            retryCount = 0;

            // 安排下次刷新
            scheduleTokenRefresh(intervalMinutes);
        } else {
            // 业务逻辑失败（如密码错误）
            console.warn("[tokenRefresher] 刷新失败：", res.msg);
            handleRefreshFailure(intervalMinutes, false);
        }
    } catch (err) {
        // 网络错误或其他异常
        console.error("[tokenRefresher] 刷新出错：", err);
        handleRefreshFailure(intervalMinutes, true);
    }
}

/**
 * 处理刷新失败的情况
 * @param {number} intervalMinutes
 * @param {boolean} isNetworkError 是否为网络错误
 */
function handleRefreshFailure(intervalMinutes, isNetworkError) {
    if (isNetworkError && retryCount < MAX_RETRY_COUNT) {
        // 网络错误且未超过最大重试次数，安排重试
        retryCount++;
        console.log(
            `[tokenRefresher] ${RETRY_DELAY / 1000}秒后进行第${retryCount}次重试`
        );

        refreshTimer = setTimeout(async () => {
            await refreshToken(intervalMinutes);
        }, RETRY_DELAY);
    } else if (retryCount >= MAX_RETRY_COUNT) {
        // 重试次数用完，停止刷新
        console.error("[tokenRefresher] 重试次数已达上限，停止自动刷新");
        retryCount = 0;
    } else {
        // 非网络错误（如认证失败），直接停止
        console.error("[tokenRefresher] 认证失败，停止自动刷新");
    }
}

/**
 * 停止自动刷新
 */
export function clearTokenRefresh() {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
    retryCount = 0;
    console.log("[tokenRefresher] 已停止自动刷新");
}

/**
 * 立即执行一次刷新（可选功能）
 */
export async function refreshTokenNow() {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
    }
    await refreshToken(5); // 使用默认间隔
}
