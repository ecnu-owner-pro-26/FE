/**
 * 网络请求封装层
 * 核心功能：BaseURL管理、JWT自动注入、全局错误拦截
 */

// 对标王思茹 API 文档的 Base URL
const BASE_URL = 'http://localhost:8080/api'; 

/**
 * 核心请求函数
 * @param {string} url - 接口路径（如 /memories）
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} data - 请求参数
 * @param {boolean} needAuth - 是否需要携带 Token (默认为 true)
 */
const request = (url, method = 'GET', data = {}, needAuth = true) => {
  return new Promise((resolve, reject) => {
    // 1. 从本地缓存获取 JWT Token
    const token = wx.getStorageSync('token');
    
    // 2. 初始化请求头
    const header = {
      'Content-Type': 'application/json'
    };

    // 3. 自动注入 JWT (对标文档: Authorization: Bearer {token})
    if (needAuth && token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    // 可选：显示加载中动画
    wx.showLoading({ title: '加载中...', mask: true });

    wx.request({
      url: `${BASE_URL}${url}`,
      method: method.toUpperCase(),
      data: data,
      header: header,
      success: (res) => {
        // 4. 处理状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 请求成功，返回数据体
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 失效或未登录：清空缓存并引导（或静默处理）
          wx.removeStorageSync('token');
          console.error('身份验证失效，请重新登录');
          // 这里可以跳转到登录页，或者调用静默登录函数
          // wx.navigateTo({ url: '/pages/login/login' });
          reject(res);
        } else {
          // 其他后端错误 (如 400 参数错误, 500 服务器崩了)
          wx.showToast({
            title: res.data.message || '服务器响应异常',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 网络不通或 URL 错误
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        wx.hideLoading(); // 关闭加载动画
      }
    });
  });
};

module.exports = {
  request
};