Page({
  data: {
    userInfo: {
      nickname: 'ECNU 小狮子',
      avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07afakS2Aia07v89ibYy6m6ia6qicic427XpA7S6jXicicicWtiaib6Qicibicia4iaa849Wic5Wv9Q/0',
      bio: '热爱丽娃河，也爱樱桃河。',
      bgImage: ''
    },
    unreadLikes: 2,
    unreadComments: 5, 
    currentTab: 0,
    displayList: [],
    myPosts: [
      { id: 1001, title: '丽娃河的猫：今天又在图书馆门口营业了', time: '2026-02-10', likes: 15 },
      { id: 1002, title: '华师大樱桃河的晚霞真的无敌', time: '2026-02-09', likes: 21 }
    ],
    myComments: [
      { id: 2001, postId: 1001, title: '我也见过它，它真的很亲人！', time: '2026-02-11' }
    ]
  },

  onShow() {
    // 每次进入页面重新获取缓存
    const info = wx.getStorageSync('userInfo');
    if (info) {
      this.setData({
        'userInfo.nickname': info.nickname || this.data.userInfo.nickname,
        'userInfo.avatar': info.avatar || this.data.userInfo.avatar,
        'userInfo.bio': info.bio || this.data.userInfo.bio,
        'userInfo.bgImage': info.bgImage || this.data.userInfo.bgImage
      });
    }
    this.refreshList();
  },

  handleItemTap(e) {
    const { id, postid } = e.currentTarget.dataset;
    let url = this.data.currentTab === 0 
      ? `/pages/detail/detail?id=${id}` 
      : `/pages/detail/detail?id=${postid}&commentId=${id}`;
    
    wx.navigateTo({ url });
  },

  goToEdit() {
    wx.navigateTo({ url: '/pages/edit-profile/edit-profile' });
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