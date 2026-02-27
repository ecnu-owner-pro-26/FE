/**
 * 树洞详情页 detail
 * 功能：展示帖子内容、点赞、评论、回复
 */
const MemoryApi = require('../../api/memory');
const CommentApi = require('../../api/comment');

Page({
  // ---------- 页面数据 ----------
  data: {
    info: {
      id: 0,
      avatar: 'https://mmbiz.qpic.cn/mmbiz_png/icTdbqWNOwNRna42FI242Lcia07afakS2Aia07v89ibYy6m6ia6qicic427XpA7S6jXicicicWtiaib6Qicibicia4iaa849Wic5Wv9Q/0',
      nickname: '校友',
      title: '正在加载...',
      content: '',
      like_count: 0,
      is_liked: false,
      ip_location: '上海',
      location_name: '',
      images: []
    },
    comments: [
      { id: 1, nickname: "华师大小狮子", content: "沙发！", create_time: "刚刚" }
    ],
    commentText: '',
    inputPlaceholder: '说点什么...',
    replyTargetUser: null,
    inputFocus: false
  },

  // ---------- 生命周期 ----------
  onLoad(options) {
    const id = Number(options.id);

    if (id) {
      // 预设帖子：与地图红点对应（101→1, 102→2, 201→3, 202→4），后续可接接口
      const mockData = [
      { id: 1, title: "河西食堂的早餐", content: "豆浆油条永远的神，早起占座值得。", location_name: "河西食堂", like_count: 10, is_liked: false },
      { id: 2, title: "理科楼自习一角", content: "期末复习中，窗外阳光正好。", location_name: "理科大楼", like_count: 25, is_liked: true },
      { id: 3, title: "秋实阁的樱花", content: "这里的樱花已经有花苞了，下周应该会开。", location_name: "秋实阁", like_count: 8, is_liked: false },
      { id: 4, title: "实验楼夜色", content: "国软院的红墙配晚霞绝了，随手一拍。", location_name: "实验楼", like_count: 5, is_liked: false }
    ];

    const item = mockData.find(x => x.id === id);

    if (item) {
      this.setData({
  'info.id': item.id,
  'info.title': item.title,
  'info.content': item.content,
  'info.location_name': item.location_name,
  'info.is_liked': options.is_liked === 'true' ? true : item.is_liked,
  'info.like_count': options.like_count ? Number(options.like_count) : item.like_count
});
    }
  }
},

  // ---------- 点赞 ----------
  onLikeTap(e) {
    const { status } = e.detail;
    const oldCount = this.data.info.like_count;

    this.setData({
      'info.is_liked': status,
      'info.like_count': status ? oldCount + 1 : Math.max(0, oldCount - 1)
    });
    wx.showToast({
      title: status ? '点赞成功' : '取消点赞',
      icon: 'none'
    });
  },

  // ---------- 评论与回复 ----------
  onInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  /** 点击某条评论的“回复”：占位符改为 @昵称，并聚焦输入框 */
  handleReplyTrigger(e) {
    const name = e.detail.name; 
    this.setData({
      inputPlaceholder: `回复 @${name}:`,
      replyTargetUser: name,
      inputFocus: true 
    });
  },

  /** 提交评论：支持普通评论和 @回复，当前为模拟提交 */
  submitComment() {
    const text = this.data.commentText.trim();

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

  // ---------- 图片预览 ----------
  preview(e) {
    if(!this.data.info.images) return;
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: this.data.info.images
    });
  },

   // ---------- 跳转他人页面 ----------
   goToOthersProfile(e) {
    const userId = e.currentTarget.dataset.userid|| 10086;
    const isPublic = this.data.info.is_public;

    // 如果是匿名发布的，通常不允许查看主页
    
    console.log("正在尝试跳转到用户主页，ID为:", userId);
    wx.navigateTo({
      url: `/pages/user-home/user-home?id=${userId}`,
      fail: (err) => {
        console.error("跳转失败，请检查 app.json 是否注册了该页面", err);
        wx.showToast({ title: '页面还没创建', icon: 'none' });
      }
    });
  }
});
