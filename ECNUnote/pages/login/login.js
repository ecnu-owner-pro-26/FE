// pages/login/login.js 微信快捷登录：wx.login + 头像、昵称、默认简介
const authApi = require('../../api/auth');
const { BASE_URL } = require('../../utils/request');

const DEFAULT_BIO = '这个人什么也不想说。';

Page({
  data: {
    nickname: '',
    avatarUrl: '',
    avatarTempPath: ''  // chooseAvatar 的临时路径，登录时上传
  },

  onChooseAvatar(e) {
    const path = e.detail.avatarUrl;
    if (!path) return;
    this.setData({
      avatarUrl: path,
      avatarTempPath: path
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: (e.detail.value || '').trim() });
  },

  onWechatLogin() {
    const nickname = this.data.nickname.trim() || '微信用户';

    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.showToast({ title: '获取登录态失败', icon: 'none' });
          return;
        }
        const code = res.code;
        const avatarTempPath = this.data.avatarTempPath;

        const doLogin = (avatarUrl) => {
          authApi.wechatLogin({
            code,
            nickname,
            avatar: avatarUrl || '',
            description: DEFAULT_BIO
          }).then((data) => {
            const token = data.token || data.access_token || data.accessToken;
            if (token) {
              wx.setStorageSync('token', token);
              const userInfo = {
                nickname,
                avatar: avatarUrl || this.data.avatarUrl || '',
                bio: DEFAULT_BIO
              };
              if (data.user) {
                Object.assign(userInfo, data.user);
              }
              if (data.id) userInfo.id = data.id;
              wx.setStorageSync('userInfo', userInfo);
              wx.showToast({ title: '登录成功' });
              setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 500);
            } else {
              wx.showToast({ title: '登录返回格式异常', icon: 'none' });
            }
          }).catch((err) => {
            // 网络层失败有 errMsg；后端/HTTP 错误有 code 或 message
            const hasCode = err && (err.code !== undefined && err.code !== null);
            const hasMsg = err && (typeof err.message === 'string');
            const errMsg = err && err.errMsg;
            const isBackendOrHttp = hasCode || hasMsg;

            let title = '登录请求失败';
            let content = '';
            if (isBackendOrHttp) {
              title = '登录被服务器拒绝';
              content = 'code: ' + (err.code ?? '') + '\nmessage: ' + (err.message || '无') + '\n\n请把上述信息给后端排查（如 code 换 openid 失败、接口路径或参数名不一致）。';
            } else {
              content = errMsg || (err && err.message) || '网络异常';
              if (content.indexOf('domain') !== -1 || content.indexOf('合法') !== -1) {
                content += '\n\n请到微信公众平台配置 request 合法域名，或真机调试时勾选不校验合法域名。';
              } else if (content.indexOf('timeout') !== -1) {
                content += '\n\n请检查网络或服务器是否响应过慢。';
              }
            }
            console.error('[登录失败]', err);
            wx.showModal({ title: title, content: content, showCancel: false });
          });
        };

        if (avatarTempPath) {
          authApi.uploadAvatar(avatarTempPath).then((url) => doLogin(url)).catch(() => doLogin(''));
        } else {
          doLogin('');
        }
      },
      fail: () => wx.showToast({ title: '微信登录失败', icon: 'none' })
    });
  },

  /** 临时：校验是否接上服务器，点击后请求 GET /campuses 并弹窗显示结果 */
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
          const msg = body && body.data !== undefined
            ? `HTTP ${statusCode}\n校区数: ${Array.isArray(body.data) ? body.data.length : '-'}`
            : `HTTP ${statusCode}`;
          wx.showModal({ title: '连接正常', content: msg, showCancel: false });
        } else {
          const content = body && (body.message || body.msg) ? `HTTP ${statusCode}\n${body.message || body.msg}` : `HTTP ${statusCode}`;
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
