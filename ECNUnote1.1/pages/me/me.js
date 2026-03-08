const authApi = require('../../api/auth');

const DEFAULT_STATS = { postCount: 12, likeCount: 34, msgCount: 56 };

Page({
  data: {
    isLoggedIn: false,
    userInfo: { nickname: '', avatar: '', bio: '', bgImage: '' },
    stats: { postCount: 12, likeCount: 34, msgCount: 56 },
    unreadLikes: 0,
    unreadComments: 0,
    currentTab: 0,
    displayList: [],
    myPosts: [],
    myComments: []
  },

  onShow() {
    const bar = this.getTabBar && this.getTabBar();
    if (bar) bar.setData({ selected: 2 });
    const token = wx.getStorageSync('token');
    const isLoggedIn = !!token;
    this.setData({ isLoggedIn });

    if (isLoggedIn) {
      const info = wx.getStorageSync('userInfo');
      if (info) {
        this.setData({
          'userInfo.nickname': info.nickname || '',
          'userInfo.avatar': info.avatar || '',
          'userInfo.bio': info.bio || '',
          'userInfo.bgImage': info.bgImage || ''
        });
      }
      this.fetchStats();
    } else {
      this.setData({ stats: DEFAULT_STATS });
    }
    this.refreshList();
  },

  fetchStats() {
    authApi.getProfile().then((data) => {
      const postCount = (data && data.postCount != null) ? data.postCount : DEFAULT_STATS.postCount;
      const likeCount = (data && data.likeCount != null) ? data.likeCount : DEFAULT_STATS.likeCount;
      const msgCount = (data && data.msgCount != null) ? data.msgCount : DEFAULT_STATS.msgCount;
      this.setData({ stats: { postCount, likeCount, msgCount } });
    }).catch(() => {
      this.setData({ stats: DEFAULT_STATS });
    });
  },

  changeBackground() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        const path = res.tempFilePaths[0];
        let userInfo = this.data.userInfo;
        userInfo.bgImage = path;
        this.setData({ userInfo });
        wx.setStorageSync('userInfo', userInfo);
        wx.vibrateShort(); // 轻微震动反馈，增加精致感
        wx.showToast({ title: '已更换背景', icon: 'none' });
      }
    });
  },

  handleItemTap(e) {
    const { id, postid } = e.currentTarget.dataset;
    let url = this.data.currentTab === 0 
      ? `/pages/detail/detail?id=${id}` 
      : `/pages/detail/detail?id=${postid}&commentId=${id}`;
    
    wx.navigateTo({ url });
  },

  goToEdit() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/edit-profile/edit-profile' });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  refreshList() {
    this.setData({ 
      displayList: this.data.currentTab === 0 ? this.data.myPosts : this.data.myComments 
    });
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    if (this.data.currentTab === index) return;
    this.setData({ currentTab: index });
    this.refreshList();
  },

  navToLikes() {
    this.setData({ unreadLikes: 0 });
    wx.navigateTo({ url: '/pages/message/message?type=like' });
  },

  navToReceivedComments() {
    this.setData({ unreadComments: 0 });
    wx.navigateTo({ url: '/pages/message/message?type=comment' });
  },

  scrollToContent() {
    wx.pageScrollTo({ selector: '#content-nodes', duration: 400 });
  }
});