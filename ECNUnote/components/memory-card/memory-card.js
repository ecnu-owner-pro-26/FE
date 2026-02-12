Component({
  properties: {
    item: {
      type: Object,
      value: {
        id: 0, 
        title: '', 
        content: '', 
        location_name: '未知位置',
        view_count: 0, 
        comment_count: 0, 
        create_time: '', 
        images: [],
        // 建议在这里也加上默认值
        is_liked: false,
        like_count: 0
      }
    }
  },
  methods: {
    // 1. 新增：处理点赞按钮传来的信号
    onLikeTap(e) {
      // 这里的 status 是 true/false，targetId 是帖子的 ID
      // triggerEvent 会把这个消息发送给 discovery.js 里的 bind:like
      this.triggerEvent('like', {
        status: e.detail.status,
        targetId: this.data.item.id
      });
    },

    // 2. 新增：一个空函数，专门用来“截断”点击事件
    // 防止点红心的时候，卡片也触发跳转详情页
    prevent() {
      // 什么都不用写，catchtap 会帮我们搞定一切
    },

    onTapCard() {
      wx.navigateTo({ url: `/pages/detail/detail?id=${this.data.item.id}` });
    }
  }
})