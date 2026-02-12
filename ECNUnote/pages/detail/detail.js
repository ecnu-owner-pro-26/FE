const MemoryApi = require('../../api/memory');
const CommentApi = require('../../api/comment');

Page({
  data: {
    info: {
      id: 0,
      avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07afakS2Aia07v89ibYy6m6ia6qicic427XpA7S6jXicicicWtiaib6Qicibicia4iaa849Wic5Wv9Q/0',
      nickname: '校友',
      title: '正在加载...',
      content: '',
      like_count: 0,
      is_liked: false,
      ip_location: '上海'
    },
    comments: [
      { id: 1, nickname: "华师大小狮子", content: "沙发！", create_time: "刚刚" }
    ],
    commentText: '',
    inputPlaceholder: '说点什么...',
    replyTargetUser: null,
    inputFocus: false
  },

// pages/detail/detail.js
onLoad(options) {
  console.log("📥 原始 options 检查:", options);
  const id = Number(options.id); // 拿到 ID 并转为数字

  if (id) {
    // 1. 这里直接定义和你广场页一模一样的 mock 数据
    const mockData = [
      { id: 1, title: "丽娃河的猫", content: "为了过冬囤了不少肉。", like_count: 10, is_liked: false },
      { id: 2, title: "樱桃河午后", content: "这里的樱花已经有花苞了。", like_count: 25, is_liked: true },
      { id: 3, title: "滴水湖远眺", content: "国软院的红墙配晚霞绝了。", like_count: 5, is_liked: false }
    ];

    // 2. 根据 ID 找到那条正确的数据
    const item = mockData.find(x => x.id === id);

    if (item) {
      // 3. 把找到的数据塞进页面
      // 在 detail.js 的 onLoad 里
this.setData({
  'info.id': item.id,
  'info.title': item.title,
  'info.content': item.content,
  // 优先使用 URL 传过来的实时状态，如果没有，再用 mock 的默认值
  'info.is_liked': options.is_liked === 'true' ? true : item.is_liked,
  'info.like_count': options.like_count ? Number(options.like_count) : item.like_count
});
      console.log("✅ 匹配成功，当前显示内容:", item.title);
    }
  }
},

  
  onLikeTap(e) {
    const { status } = e.detail;
    const oldCount = this.data.info.like_count;

    // 直接修改详情页的 info 状态
    this.setData({
      'info.is_liked': status,
      'info.like_count': status ? oldCount + 1 : Math.max(0, oldCount - 1)
    });

    // 提示：这里如果要做得更完美，可以使用本地缓存同步回广场页
    wx.showToast({
      title: status ? '点赞成功' : '取消点赞',
      icon: 'none'
    });
  },

  onInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  handleReplyTrigger(e) {
    const name = e.detail.name; 
    this.setData({
      inputPlaceholder: `回复 @${name}:`,
      replyTargetUser: name,
      inputFocus: true 
    });
  },

  submitComment() {
    const text = this.data.commentText.trim();
    const info = this.data.info;

    if (!text) {
      return wx.showToast({ title: '写点什么再发送吧', icon: 'none' });
    }

    const newComment = {
      id: Date.now(),
      nickname: "我 (模拟用户)",
      content: this.data.replyTargetUser ? `@${this.data.replyTargetUser} ${text}` : text,
      create_time: "刚刚"
    };
  
    wx.showLoading({ title: '发送中...' });
  
    setTimeout(() => {
      wx.hideLoading();
      const newCommentsList = [newComment, ...this.data.comments];
      
      this.setData({
        comments: newCommentsList,
        commentText: '',
        replyTargetUser: null,
        inputPlaceholder: '说点什么...',
        inputFocus: false
      });
  
      wx.showToast({ title: '发送成功(模拟)' });
    }, 500);
  },

  preview(e) {
    if(!this.data.info.images) return;
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.info.images
    });
  }
});
