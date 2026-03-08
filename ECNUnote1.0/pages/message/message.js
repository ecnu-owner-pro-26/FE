Page({
  data: {
    pageTitle: '消息中心',
    displayType: 'like',
    likeList: [],
    commentList: []
  },

  onLoad(options) {
    // 接收从个人中心传来的 type 参数 (?type=like 或 ?type=comment)
    if (options.type) {
      this.setData({
        displayType: options.type,
        pageTitle: options.type === 'like' ? '收到的点赞' : '收到的评论'
      });
      // 动态设置页面顶部的标题
      wx.setNavigationBarTitle({
        title: this.data.pageTitle
      });
    }
  }
})