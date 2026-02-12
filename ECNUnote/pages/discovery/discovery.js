/**
 * 广场页逻辑修复
 * 变量名：ls(list), c(campus), p(page), t(temp)
 */
Page({
  data: {
    ls: [], 
    c: 'all', 
    p: 1, 
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.init();
  },

  // 筛选切换逻辑
  sel(e) {
    let t = e.currentTarget.dataset.v; 
    if (this.data.c === t) return;
    
    this.setData({ 
      c: t, 
      ls: [], 
      p: 1, 
      hasMore: true 
    }, () => {
      this.init();
    });
  },

  init() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    setTimeout(() => {
        const mock = [
          { 
            id: 1, 
            title: "丽娃河的猫", 
            content: "为了过冬囤了不少肉。", 
            location_name: "普陀校区", 
            view_count: 88, 
            comment_count: 5, 
            create_time: "刚刚", 
            campus: "p",
            is_liked: false, 
            like_count: 10   
          },
          { 
            id: 2, 
            title: "樱桃河午后", 
            content: "这里的樱花已经有花苞了。", 
            location_name: "闵行校区", 
            view_count: 120, 
            comment_count: 8, 
            create_time: "5分钟前", 
            campus: "m",
            is_liked: true, 
            like_count: 25
          },
          { 
            id: 3, 
            title: "滴水湖远眺", 
            content: "国软院的红墙配晚霞绝了。", 
            location_name: "滴水湖校区", 
            view_count: 230, 
            comment_count: 12, 
            create_time: "1小时前", 
            campus: "d",
            is_liked: false, 
            like_count: 5
          }
      ];

      let res = this.data.c === 'all' ? mock : mock.filter(i => i.campus === this.data.c);

      this.setData({
        ls: [...this.data.ls, ...res],
        loading: false,
        hasMore: this.data.p < 3 
      });
    }, 400);
  },

  more() {
    this.setData({ p: this.data.p + 1 });
    this.init();
  },

  onCardLike(e) {
    const { status, targetId } = e.detail;
    const list = this.data.ls;
    const index = list.findIndex(item => item.id === targetId);

    if (index !== -1) {
      const isLikedKey = `ls[${index}].is_liked`;
      const likeCountKey = `ls[${index}].like_count`;
      const oldCount = list[index].like_count || 0;

      this.setData({
        [isLikedKey]: status,
        [likeCountKey]: status ? oldCount + 1 : Math.max(0, oldCount - 1)
      });
    }
  }, 

  goToDetail(e) {
    let id = e.currentTarget.dataset.id;
    let it = this.data.ls.find(x => x.id == id);
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id + '&title=' + encodeURIComponent(it.title) + '&content=' + encodeURIComponent(it.content)
    });
  }
}); 