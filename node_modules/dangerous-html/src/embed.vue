<template>
  <div :style="{ display: 'contents' }" ref="wrapper"></div>
</template>

<script>
export default {
  name: "DangerousHTML",
  props: ['html', 'file'],
  async mounted(){
    let content;

    if (!this.$refs?.wrapper) {
      return
    }

    if (this.html) {
        content = this.html
    }

    if (this.file && !this.html) {
        content = await (await fetch(this.file)).text();
    }

    const slotHtml = document.createRange().createContextualFragment(content);
    this.$refs.wrapper.append(slotHtml)
  },
};
</script>
