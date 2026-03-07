/**
 * 树洞详情页 detail
 * 功能：展示帖子内容、点赞、评论、回复
 */
const MemoryApi = require('../../api/memory');
const CommentApi = require('../../api/comment');

function formatTime(str) {
  if (!str) return '';
  const d = new Date(str);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
  return d.toLocaleDateString();
}

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
    if (!id) return;

    this.memoryId = id;
    // 从接口拉取记忆详情
    MemoryApi.getMemoryDetail(id).then((data) => {
      const creator = data.creator || {};
      this.setData({
        'info.id': data.id,
        'info.title': data.title || '无标题',
        'info.content': data.content || '',
        'info.location_name': data.location_name || '',
        'info.like_count': data.like_count || 0,
        'info.is_liked': !!data.is_liked,
        'info.avatar': creator.avatar || this.data.info.avatar,
        'info.nickname': creator.nickname || '校友',
        'info.images': data.images || []
      });
    }).catch(() => {
      this.setData({ 'info.title': '加载失败' });
    });

    // 拉取评论列表
    CommentApi.getCommentList(id).then((data) => {
      const comments = (data || []).map((c) => ({
        id: c.id,
        nickname: (c.creator && c.creator.nickname) || '校友',
        content: c.content,
        create_time: c.created_at ? formatTime(c.created_at) : ''
      }));
      this.setData({ comments });
    }).catch(() => {});
  },

  // ---------- 点赞 ----------
  onLikeTap(e) {
    const { status } = e.detail;
    const id = this.memoryId || this.data.info.id;
    const oldCount = this.data.info.like_count;

    const fn = status ? MemoryApi.likeMemory(id) : MemoryApi.unlikeMemory(id);
    fn.then(() => {
      this.setData({
        'info.is_liked': status,
        'info.like_count': status ? oldCount + 1 : Math.max(0, oldCount - 1)
      });
      wx.showToast({ title: status ? '点赞成功' : '取消点赞', icon: 'none' });
    }).catch(() => {
      this.setData({ 'info.is_liked': !status });
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

  /** 提交评论：调用接口 POST /api/memories/:id/comments */
  submitComment() {
    const text = this.data.commentText.trim();
    if (!text) {
      return wx.showToast({ title: '写点什么再发送吧', icon: 'none' });
    }

    const memoryId = this.memoryId || this.data.info.id;
    const content = this.data.replyTargetUser ? `@${this.data.replyTargetUser} ${text}` : text;

    CommentApi.createComment(memoryId, content).then((data) => {
      const newComment = {
        id: data.id,
        nickname: (data.creator && data.creator.nickname) || '我',
        content: data.content,
        create_time: '刚刚'
      };
      this.setData({
        comments: [newComment, ...this.data.comments],
        commentText: '',
        replyTargetUser: null,
        inputPlaceholder: '说点什么...',
        inputFocus: false
      });
      wx.showToast({ title: '发送成功' });
    }).catch(() => {});
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
