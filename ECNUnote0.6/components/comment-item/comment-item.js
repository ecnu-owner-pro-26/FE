Component({
  properties: { item: { type: Object, value: {} } },
  methods: {
    onReply() {
      let t = this.data.item;
      this.triggerEvent('reply', { name: t.nickname });
    }
  }
})