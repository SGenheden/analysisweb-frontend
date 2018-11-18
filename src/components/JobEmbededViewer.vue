<template id="jobembededviewer">
    <!-- eslint-disable max-len -->
    <b-container>
        <b-embed :src=content type="iframe"/>
    </b-container>
</template>

<script>
export default {
  props: {
    job: Object,
    content: String,
  },
};
</script>
