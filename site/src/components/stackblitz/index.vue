<template>
  <t-tooltip content="在 Stackblitz 中打开">
    <form
      ref="formRef"
      method="post"
      action="https://stackblitz.com/run?file=src%2Fdemo.vue"
      target="_blank"
      @click="submit"
    >
      <input type="hidden" name="project[files][src/demo.vue]" :value="code" />
      <input type="hidden" name="project[files][src/index.css]" :value="styleContent" />
      <input type="hidden" name="project[files][src/main.js]" :value="mainJsContent" />
      <input type="hidden" name="project[files][index.html]" :value="htmlContent" />
      <input type="hidden" name="project[files][package.json]" :value="packageJSONContent" />
      <input type="hidden" name="project[files][vite.config.js]" :value="viteConfigContent" />
      <input type="hidden" name="project[files][.stackblitzrc]" :value="stackblitzRc" />
      <input type="hidden" name="project[template]" value="node" />

      <div class="action-online">
        <svg viewBox="0 0 28 28" height="20">
          <path
            fill="currentColor"
            d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"
          ></path>
        </svg>
      </div>
    </form>
  </t-tooltip>
</template>

<script>
import {
  htmlContent,
  mainJsContent,
  styleContent,
  packageJSONContent,
  stackblitzRc,
  viteConfigContent,
} from './content';

export default {
  name: 'Stackblitz',
  props: {
    code: String,
    demoName: String,
    componentName: String,
  },

  data() {
    return {
      htmlContent,
      mainJsContent,
      styleContent,
      stackblitzRc,
      viteConfigContent,
      packageJSONContent,
    };
  },

  methods: {
    submit() {
      this.$refs.formRef.submit();
    },
  },
};
</script>
