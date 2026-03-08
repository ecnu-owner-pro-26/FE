/**
 * 网络请求封装：多环境 BASE_URL、JWT 自动注入、HTTP 与业务状态码拦截
 */
const ENV = {
  DEV: 'http://106.14.10.73:8080/api',
  PROD: 'https://api.ecnunote.com/api'
};
const BASE_URL = ENV.DEV;

/**
 * 发起 HTTP 请求。needAuth 为 true 时在 Header 中附加 Authorization: Bearer <token>
 * 成功时 resolve body.data（若存在）或 body；失败时 Toast 并 reject
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
        const isLoginReq = (url.indexOf('auth') !== -1 && (url.indexOf('login') !== -1 || url.indexOf('wechat') !== -1));
        if (isLoginReq) {
          console.log('[登录] 完整网络响应体:', JSON.stringify(body));
        }

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

        if (body && body.code !== undefined && body.code !== 200) {
          const msg = body.message || ('错误码: ' + body.code);
          wx.showToast({ title: msg, icon: 'none' });
          reject(body);
          return;
        }

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
 * 上传文件至 /upload，解析响应中的图片 URL 并返回
 * @param {string} filePath 本地临时路径
 * @param {string} name 表单字段名，默认 avatar
 * @returns {Promise<string>} 解析得到的 URL 或空字符串
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