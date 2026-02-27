Page({
  data: {
    userId: null,
    userInfo: {},
    memories: []
  },

  onLoad(options) {
    const id = options.id || 10086;
    this.setData({ userId: id });
    this.fetchUserInfo(id);
  },

  fetchUserInfo(id) {
    wx.showLoading({ title: '收录记忆中...' });
    
    // 模拟后端返回
    setTimeout(() => {
      this.setData({
        userInfo: {
          nickname: "华师狮友 #" + id.toString().slice(-4),
          avatar: "https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07afakS2Aia07v89ibYy6m6ia6qicic427XpA7S6jXicicicWtiaib6Qicibicia4iaa849Wic5Wv9Q/0",
          bio: "爱在华师大，记忆永存。这里记录了我大学四年的点点滴滴。",
          gender: 1, // 1 男, 2 女
          post_count: 8,
          like_total: 256
        },
        memories: [
          { id: 1, title: "丽娃河边的晚霞", location_name: "丽娃河", like_count: 42, day: "27", month: "Feb" },
          { id: 2, title: "秋实阁的红烧肉真香", location_name: "中北校区", like_count: 89, day: "24", month: "Feb" },
          { id: 3, title: "图书馆凌晨四点的样子", location_name: "图书馆", like_count: 125, day: "15", month: "Feb" }
        ]
      });
      wx.hideLoading();
    }, 800);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  }
});