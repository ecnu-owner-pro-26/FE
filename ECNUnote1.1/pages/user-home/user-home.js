const authApi = require('../../api/auth');
const MemoryApi = require('../../api/memory');

const DEFAULT_STATS = { postCount: 12, likeCount: 34, msgCount: 56 };

Page({
  data: {
    userId: null,
    notLoggedIn: false,
    isLoggedIn: false,
    isSelf: false,
    userInfo: {},
    stats: { postCount: 12, likeCount: 34, msgCount: 56 },
    memories: []
  },

  onLoad(options) {
    const id = options.id || null;
    const token = wx.getStorageSync('token');
    const isLoggedIn = !!token;
    const selfId = (wx.getStorageSync('userInfo') || {}).id;
    const isSelf = !!(id && selfId && String(id) === String(selfId));

    this.setData({
      userId: id,
      isLoggedIn,
      isSelf,
      stats: DEFAULT_STATS
    });

    if (!id || (!isLoggedIn && isSelf)) {
      this.setData({ notLoggedIn: true, userInfo: { nickname: '', avatar: '', bio: '' }, memories: [] });
      return;
    }
    this.fetchUserInfo(id);
  },

  fetchUserInfo(id) {
    wx.showLoading({ title: '加载中...' });

    const applyStats = (data) => {
      const postCount = (data && data.postCount != null) ? data.postCount : DEFAULT_STATS.postCount;
      const likeCount = (data && data.likeCount != null) ? data.likeCount : DEFAULT_STATS.likeCount;
      const msgCount = (data && data.msgCount != null) ? data.msgCount : DEFAULT_STATS.msgCount;
      this.setData({ stats: { postCount, likeCount, msgCount } });
    };

    if (this.data.isSelf) {
      authApi.getProfile()
        .then((data) => {
          const userInfo = {
            nickname: (data && data.nickname) || '',
            avatar: (data && data.avatar) || '',
            bio: (data && data.bio) || ''
          };
          this.setData({ userInfo });
          applyStats(data);
          return this.fetchMemories();
        })
        .catch(() => {
          this.setData({ userInfo: wx.getStorageSync('userInfo') || {}, memories: [] });
          applyStats(null);
        })
        .finally(() => wx.hideLoading());
    } else {
      this.setData({ userInfo: {}, memories: [] });
      applyStats(null);
      wx.hideLoading();
    }
  },

  fetchMemories() {
    return MemoryApi.getMemories({ page: 1 }).then((data) => {
      const raw = Array.isArray(data) ? data : (data && data.list) ? data.list : (data && data.data) ? data.data : [];
      const memories = raw.map((item) => ({
        id: item.id,
        title: item.title || item.content || '无标题',
        location_name: item.location_name || '',
        like_count: item.like_count || 0,
        day: item.day || '',
        month: item.month || ''
      }));
      this.setData({ memories });
    }).catch(() => this.setData({ memories: [] }));
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});
