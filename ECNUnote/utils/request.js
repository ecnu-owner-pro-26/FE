/**
 * 网络请求封装层
 * 核心功能：多环境管理、JWT自动注入、业务状态码拦截
 * 开发时：微信开发者工具 → 详情 → 本地设置 → 勾选「不校验合法域名」以便请求 http 测试地址
 */

// 环境配置（与 ECNUnote文档/API_COMPLETE.md 一致）
const ENV = {
  DEV: 'http://106.14.10.73:8080/api',
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
    const methodUpper = method.toUpperCase();
    const header = {};
    if (methodUpper !== 'GET') {
      header['Content-Type'] = 'application/json';
    }
    if (needAuth && token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.showLoading({ title: '请求中...', mask: true });

    wx.request({
      url: `${BASE_URL}${url}`,
      method: methodUpper,
      data: methodUpper === 'GET' ? {} : data,
      header: header,
      timeout: 10000,
      success: (res) => {
        const { statusCode, data: body } = res;

        // 1. 拦截 HTTP 物理状态码（统一 reject 成 { code, message } 便于登录页区分）
        if (statusCode < 200 || statusCode >= 300) {
          if (statusCode === 401) {
            wx.removeStorageSync('token');
            wx.showToast({ title: '登录过期', icon: 'none' });
          } else {
            wx.showToast({ title: `系统异常: ${statusCode}`, icon: 'none' });
          }
          const bodyMsg = body && (body.message || body.msg);
          reject({ code: statusCode, message: bodyMsg || ('HTTP ' + statusCode) });
          return;
        }

        // 2. 拦截业务逻辑状态码（body 可能为空）
        if (body && body.code !== undefined && body.code !== 200) {
          // 15002 常见于后端改路由后接口不存在或路径变更，提示用户/开发者
          const msg = body.code === 15002
            ? (body.message || '接口已变更(15002)，请与后端确认新路由')
            : (body.message || '业务逻辑错误');
          wx.showToast({
            title: msg,
            icon: 'none'
          });
          reject(body);
          return;
        }

        // 3. 成功则返回数据体
        resolve(body && body.data !== undefined ? body.data : body);
      },
      fail: (err) => {
        const msg = err.errMsg || '网络异常';
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        console.error('[request fail]', url, msg);
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};

/**
 * 上传文件（用于微信快捷登录头像）
 * @param {string} filePath 本地临时路径
 * @param {string} name 后端接收的字段名，默认 avatar
 * @returns {Promise<string>} 返回后端返回的图片 URL
 */
const uploadFile = (filePath, name = 'avatar') => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...', mask: true });
    wx.uploadFile({
      url: `${BASE_URL}/upload`,
      filePath: filePath,
      name: name,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const body = JSON.parse(res.data || '{}');
            const url = (body.data && body.data.url) || body.url || body.data;
            resolve(url || '');
          } catch (e) {
            resolve('');
          }
        } else {
          wx.showToast({ title: '上传失败', icon: 'none' });
          reject(new Error('upload fail'));
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = { request, uploadFile, BASE_URL };