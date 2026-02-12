Component({
  properties: {
    isLiked: { type: Boolean, value: false },
    cnt: { type: Number, value: 0 }
  },
  methods: {
    onTap() {
      let a = !this.data.isLiked;
      let b = a ? this.data.cnt + 1 : this.data.cnt - 1;
      this.setData({ isLiked: a, cnt: b });
      this.triggerEvent('change', { status: a });
    }
  }
})