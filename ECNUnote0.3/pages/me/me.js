Page({
  data: {
    userInfo: { 
      nickname: 'ECNU 小狮子', 
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', 
      bio: '热爱丽娃河，也爱樱桃河。' 
    },
    stats: { 
      postCount: 12, 
      likeCount: 88, 
      commentCount: 5, 
      unreadLike: 2, 
      unreadComment: 5 
    },
    currentTab: 0,
    myPosts: [
      { id: 1, title: '丽娃河的猫：为了过冬囤了不少肉', time: '2026-02-10', likes: 10 },
      { id: 2, title: '滴水湖远眺：国软院红墙配晚霞绝了', time: '2026-02-09', likes: 5 }
    ],
    myComments: [
      { id: 101, targetTitle: '食堂红烧肉', myContent: '确实好吃！', time: '2026-02-11' }
    ]
  },

  // 1. 跳转到资料修改页
  goToEditProfile() {
    console.log("正在尝试跳转到修改资料页...");
    wx.navigateTo({
      url: '/pages/edit-profile/edit-profile',
      fail: (err) => {
        console.error("跳转失败，请检查 app.json 是否注册了该路径", err);
        wx.showToast({ title: '页面路径错误', icon: 'none' });
      }
    });
  },

  // 2. 跳转到消息详情页
  goToMessage(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/message/message?type=${type}`
    });
    
    // 静默清除红点
    setTimeout(() => {
      if(type === 'like') this.setData({ 'stats.unreadLike': 0 });
      if(type === 'comment') this.setData({ 'stats.unreadComment': 0 });
    }, 1000);
  },

  // 3. Tab 切换逻辑
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.index });
  },

  onTabSwiperChange(e) {
    this.setData({ currentTab: e.detail.current });
  }
})