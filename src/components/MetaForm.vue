<template>
  <div>
    <form ref="metaForm" :model="value">
      <meta-node v-model="value" :prop="name" :schema="schema"></meta-node>
    </form>
  </div>
</template>

<script>
import MetaNode from './MetaNode';

export default {
  components: {
    MetaNode,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    value: Object,
    schema: Object,
  },
  methods: {
    clear() {
      this.$emit('input', {});
    },
  },
};
</script>
