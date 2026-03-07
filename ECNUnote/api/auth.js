/**
 * 用户认证模块
 * 微信快捷登录：传 code + 头像 + 昵称，简介默认「这个人什么也不想说。」
 */
const { request, uploadFile } = require('../utils/request');

const DEFAULT_BIO = '这个人什么也不想说。';

const authApi = {
  /**
   * 微信快捷登录：后端用 code 换 openid，存头像、昵称、简介
   * 请求体: { code, nickname, avatar, description }
   * 文档为 POST /api/auth/login，先请求该路径；若 404 再试 /auth/wechat/login
   */
  wechatLogin(data) {
    const body = {
      code: data.code,
      nickname: data.nickname || '微信用户',
      avatar: data.avatar || '',
      description: data.description || DEFAULT_BIO
    };
    return request('/auth/login', 'POST', body, false).catch((err) => {
      if (err && err.code === 404) {
        return request('/auth/wechat/login', 'POST', body, false).catch((e) => {
          if (e && e.code === 404) {
            return request('/wechat/login', 'POST', body, false);
          }
          return Promise.reject(e);
        });
      }
      return Promise.reject(err);
    });
  },

  /** 上传头像，返回 URL */
  uploadAvatar(filePath) {
    return uploadFile(filePath, 'avatar');
  },

  /** 获取当前用户信息 */
  getProfile() {
    return request('/auth/profile', 'GET');
  }
};

module.exports = authApi;
