/**
 * 用户认证接口封装
 * 与后端 WechatLoginRequest / LoginResponse 结构一致
 */
const { request, uploadFile } = require('../utils/request');

const authApi = {
  /**
   * 微信登录：后端以 code 换取 openid，写入或更新用户昵称、头像
   * 请求体字段：code（必填）, nickname, avatar
   */
  wechatLogin(data) {
    const body = {
      code: data.code,
      nickname: data.nickname || '微信用户',
      avatar: data.avatar || ''
    };
    return request('/auth/wechat/login', 'POST', body, false);
  },

  /**
   * 上传头像，返回图片 URL
   */
  uploadAvatar(filePath) {
    return uploadFile(filePath, 'avatar');
  },

  /**
   * 获取当前登录用户资料
   */
  getProfile() {
    return request('/auth/profile', 'GET');
  }
};

module.exports = authApi;
