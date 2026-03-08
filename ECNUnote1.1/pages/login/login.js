// pages/login/login.js 微信登录：wx.login 获取 code，与后端 WechatLoginRequest 对齐
const authApi = require('../../api/auth');
const { BASE_URL } = require('../../utils/request');

const DEFAULT_BIO = '这个人什么也不想说。';

Page({
  data: {
    nickname: '',
    avatarUrl: '',
    avatarTempPath: ''
  },

  onChooseAvatar(e) {
    const path = e.detail.avatarUrl;
    if (!path) return;
    this.setData({ avatarUrl: path, avatarTempPath: path });
  },

  onNicknameInput(e) {
    this.setData({ nickname: (e.detail.value || '').trim() });
  },

  onWechatLogin() {
    const nickname = this.data.nickname.trim() || '微信用户';
    const avatarTempPath = this.data.avatarTempPath;

    const sendLogin = (avatarUrl) => {
      wx.login({
        success: (res) => {
          if (!res.code) {
            wx.showToast({ title: '获取登录态失败', icon: 'none' });
            return;
          }
          const code = res.code;
          const body = { code, nickname, avatar: avatarUrl || '' };

          console.log('[登录] 准备发送的 code:', code);
          console.log('[登录] 请求体:', JSON.stringify(body));

          authApi.wechatLogin(body)
            .then((data) => {
              const token = data.token;
              if (token) {
                wx.setStorageSync('token', token);
                const userInfo = {
                  nickname,
                  avatar: avatarUrl || this.data.avatarUrl || '',
                  bio: DEFAULT_BIO
                };
                if (data.user) {
                  userInfo.id = data.user.id;
                  userInfo.nickname = data.user.nickname || userInfo.nickname;
                  userInfo.avatar = data.user.avatar || userInfo.avatar;
                  if (data.user.defaultCampusId != null) userInfo.defaultCampusId = data.user.defaultCampusId;
                }
                wx.setStorageSync('userInfo', userInfo);
                wx.showToast({ title: '登录成功' });
                setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 500);
              } else {
                wx.showToast({ title: '登录返回格式异常', icon: 'none' });
              }
            })
            .catch((err) => {
              console.log('[登录] 失败响应/错误:', err);
              const codeStr = err && (err.code !== undefined && err.code !== null) ? String(err.code) : '';
              const msg = (err && typeof err.message === 'string') ? err.message : (err && err.errMsg) || '网络异常';
              const content = codeStr ? '错误码: ' + codeStr + (msg ? '\n' + msg : '') : msg;
              wx.showModal({ title: '登录失败', content: content || '请稍后重试', showCancel: false });
            });
        },
        fail: () => wx.showToast({ title: '微信登录失败', icon: 'none' })
      });
    };

    if (avatarTempPath) {
      authApi.uploadAvatar(avatarTempPath).then((url) => sendLogin(url)).catch(() => sendLogin(''));
    } else {
      sendLogin('');
    }
  },

  onCheckServer() {
    wx.showLoading({ title: '检测中...' });
    wx.request({
      url: BASE_URL + '/campuses',
      method: 'GET',
      timeout: 8000,
      success: (res) => {
        wx.hideLoading();
        const { statusCode, data: body } = res;
        if (statusCode >= 200 && statusCode < 300) {
          wx.showModal({ title: '连接正常', content: String(statusCode), showCancel: false });
        } else {
          const content = (body && (body.message || body.msg)) ? (body.message || body.msg) : String(statusCode);
          wx.showModal({ title: '连接异常', content: content, showCancel: false });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showModal({ title: '连接失败', content: err.errMsg || '网络错误', showCancel: false });
      }
    });
  }
});
