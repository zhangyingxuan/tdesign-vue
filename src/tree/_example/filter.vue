<template>
  <t-space :size="32" direction="vertical">
    <t-input-adornment prepend="filter:">
      <t-input v-model="filterText" @change="onInput" />
    </t-input-adornment>

    <t-tree :data="items" expand-on-click-node :default-expanded="expanded" :filter="filterByText" hover line />
  </t-space>
</template>

<script>
export default {
  data() {
    return {
      filterText: '',
      filterByText: null,
      expanded: ['1.1.1'],
      items: [
        {
          value: '1',
          label: '1',
          children: [
            {
              value: '1.1',
              label: '1.1',
              children: [
                {
                  value: '1.1.1',
                  label: '1.1.1',
                  children: [
                    {
                      value: '1.1.1.1',
                      label: '1.1.1.1',
                    },
                    {
                      value: '1.1.1.2',
                      label: '1.1.1.2',
                    },
                  ],
                },
                {
                  value: '1.1.2',
                  label: '1.1.2',
                  children: [
                    {
                      value: '1.1.2.1',
                      label: '1.1.2.1',
                    },
                    {
                      value: '1.1.2.2',
                      label: '1.1.2.2',
                    },
                  ],
                },
              ],
            },
            {
              value: '1.2',
              label: '1.2',
              children: [
                {
                  value: '1.2.1',
                  label: '1.2.1',
                  children: [
                    {
                      value: '1.2.1.1',
                      label: '1.2.1.1',
                    },
                    {
                      value: '1.2.1.2',
                      label: '1.2.1.2',
                    },
                  ],
                },
                {
                  value: '1.2.2',
                  label: '1.2.2',
                  children: [
                    {
                      value: '1.2.2.1',
                      label: '1.2.2.1',
                    },
                    {
                      value: '1.2.2.2',
                      label: '1.2.2.2',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: '2',
          label: '2',
          children: [
            {
              value: '2.1',
              label: '2.1',
            },
            {
              value: '2.2',
              label: '2.2',
            },
          ],
        },
      ],
    };
  },
  methods: {
    onInput(state) {
      console.info('onInput:', state);
      if (this.filterText) {
        // ????????????????????????????????????
        this.filterByText = (node) => {
          const rs = node.data.label.indexOf(this.filterText) >= 0;
          // ??????????????????????????????
          // ??????????????????????????????????????????
          // ???????????????????????????
          return rs;
        };
      } else {
        // ?????????????????????????????? tree ??????????????????
        this.filterByText = null;
      }
    },
  },
};
</script>
