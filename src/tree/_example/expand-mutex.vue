<template>
  <t-space :size="10" direction="vertical" class="tdesign-tree-demo">
    <!-- <div class="operations"> -->
    <t-form labelWidth="120">
      <t-form-item label="互斥展开">
        <t-switch v-model="mutex" />
      </t-form-item>
      <t-form-item label="整个节点可点击">
        <t-switch v-model="expandOnClickNode" />
      </t-form-item>
    </t-form>
    <!-- </div> -->
    <t-tree
      :data="items"
      hover
      :expand-mutex="mutex"
      :expand-on-click-node="expandOnClickNode"
      @click="onClick"
      @expand="onExpand"
      :onExpand="propOnExpand"
    />
  </t-space>
</template>

<script>
export default {
  data() {
    return {
      mutex: true,
      expandOnClickNode: true,
      items: [
        {
          label: '1',
          children: [
            {
              label: '1.1',
              children: [
                {
                  label: '1.1.1',
                },
                {
                  label: '1.1.2',
                },
              ],
            },
            {
              label: '1.2',
              children: [
                {
                  label: '1.2.1',
                },
                {
                  label: '1.2.2',
                },
              ],
            },
          ],
        },
        {
          label: '2',
          children: [
            {
              label: '2.1',
              children: [
                {
                  label: '2.1.1',
                },
                {
                  label: '2.1.2',
                },
              ],
            },
            {
              label: '2.2',
              children: [
                {
                  label: '2.2.1',
                },
                {
                  label: '2.2.2',
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    onClick(context) {
      console.info('onClick', context);
    },
    onExpand(value, context) {
      console.info('onExpand', value, context);
    },
    propOnExpand(value, context) {
      console.info('propOnExpand', value, context);
    },
    toggleMutex() {
      this.mutex = !this.mutex;
    },
    toggleExpandOnClickNode() {
      this.expandOnClickNode = !this.expandOnClickNode;
    },
  },
};
</script>

<style scoped>
.tdesign-tree-demo .t-form__item {
  margin-bottom: 5px;
}
</style>
