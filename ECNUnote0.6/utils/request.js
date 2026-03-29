/**
 * 网络请求封装层
 * 核心功能：多环境管理、JWT自动注入、业务状态码拦截
 */

// 环境配置
const ENV = {
  DEV: 'http://localhost:8080/api',
  PROD: 'https://api.ecnunote.com/api' // 预留生产环境
};

const BASE_URL = ENV.DEV; 

/**
 * 发起请求：needAuth 为 true 时自动带 Authorization: Bearer <token>
 * 成功返回 body.data，失败统一 Toast 并 reject
 */
const request = (url, method = 'GET', data = {}, needAuth = true) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const header = { 'Content-Type': 'application/json' };

    if (needAuth && token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.showLoading({ title: '请求中...', mask: true });

    wx.request({
      url: `${BASE_URL}${url}`,
      method: method.toUpperCase(),
      data: data,
      header: header,
      success: (res) => {
        const { statusCode, data: body } = res;

        // 1. 拦截 HTTP 物理状态码
        if (statusCode < 200 || statusCode >= 300) {
          if (statusCode === 401) {
            wx.removeStorageSync('token');
            wx.showToast({ title: '登录过期', icon: 'none' });
          } else {
            wx.showToast({ title: `系统异常: ${statusCode}`, icon: 'none' });
          }
          reject(res);
          return;
        }

        // 2. 拦截业务逻辑状态码
        if (body.code !== 200) {
          wx.showToast({
            title: body.message || '业务逻辑错误',
            icon: 'none'
          });
          reject(body);
          return;
        }

        // 3. 成功则返回数据体
        resolve(body.data);
      },
      fail: (err) => {
        wx.showToast({ title: '网络连接失败', icon: 'none' });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

module.exports = { request };