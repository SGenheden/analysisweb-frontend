<template id="analysisioeditor">
    <!-- eslint-disable max-len -->
    <b-container>
        <b-row>
            <b-col lg="6">
                <b>Label</b>
            </b-col>
            <b-col lg="6">
                <b>Type</b>
            </b-col>
        </b-row>
        <b-row v-for="(iodict, index) in items" :key="index" class="mt-3" align-v="center">
            <b-col lg="6">
                <b-form-input class="form-control form-control-sm" type="text" v-model="items[index].label" required :plaintext="edit" :readonly="edit"/>
            </b-col>
            <b-col lg="6">
                <b-form-select class="form-control form-control-sm" v-model="items[index].type" :options="options" required v-if="!edit"/>
                <b-form-input class="form-control form-control-sm" type="text" v-model="items[index].type" required plaintext readonly v-else/>
            </b-col>
        </b-row>
        <p></p>
        <b-button class="btn btn-success" @click="addItem()" v-bind:disabled="edit">Add item</b-button>
        <b-button class="btn btn-danger" @click="removeItem()" v-bind:disabled="(items.length<2)||edit">Remove item</b-button>
    </b-container>
</template>

<script>
export default {
  props: {
    items: Array,
    edit: Boolean,
    options: Array,
  },
  created() {
    this.addItem();
    this.edit = false;
  },
  methods: {
    addItem() {
      this.items.push({
        label: '',
        file: this.options[0] },
      );
    },
    removeItem() {
      if (this.items.length > 1) {
        this.items.pop();
      }
    },
  },
};
</script>
