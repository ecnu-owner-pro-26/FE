Page({
  data: {
    pageTitle: '消息中心',
    displayType: 'like', // 默认为点赞 'like' 或 'comment'
    
    // 模拟收到的点赞消息
    likeList: [
      { id: 1, userNickname: '同学 A', userAvatar: '', postTitle: '丽娃河的猫', time: '刚刚' },
      { id: 2, userNickname: '同学 B', userAvatar: '', postTitle: '丽娃河的猫', time: '2小时前' }
    ],
    
    // 模拟收到的评论消息
    commentList: [
      { id: 101, userNickname: '学霸小张', userAvatar: '', content: '这题我会！', postTitle: '期末复习求助', time: '1天前' },
      { id: 102, userNickname: '食堂爱好者', userAvatar: '', content: '看起来很好吃', postTitle: '今日午餐分享', time: '昨天' }
    ]
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