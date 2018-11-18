<template id="tableviewer">
    <!-- eslint-disable max-len -->
    <b-container>
        <b-table striped hover :items=content></b-table>
    </b-container>
</template>

<script>

export default {
  props: {
    job: Object,
    content: Array,
  },
};
</script>
