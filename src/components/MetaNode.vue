<template>
  <!-- eslint-disable max-len -->
  <div>
    <div v-if="prop===''">
      <meta-node v-for="(subvalue, subprop) in schema" :schema="schema[subprop]" :prop="subprop" v-model="internalVal[subprop]" :key="subprop"></meta-node>
    </div>
    <div v-else-if="isObject(schema)">
      <div class="node-header">{{ prop }}
      <hr>
      </div>
      <meta-node v-for="(subvalue, subprop) in schema" :schema="schema[subprop]" :prop="subprop" v-model="internalVal[subprop]" :key="subprop"></meta-node>
    </div>
    <div v-else>
      <b-form-group id="inp-group" :label="prop+':'" label-for="inp-input" horizontal>
        <b-form-input :type=kind class="form-control form-control-sm" id="inp-input" v-model=internalVal required></b-form-input>
      </b-form-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'meta-node',
  data() {
    return {
      internalVal: this.value,
      kind: 'text',
    };
  },
  props: {
    prop: [String, Number],
    value: null,
    schema: null,
  },
  components: {
    'meta-npde': this,
  },
  watch: {
    // eslint-disable-next-line
    value: function (newValue) {
      this.internalVal = newValue;
    },
    // eslint-disable-next-line
    internalVal: function (newValue) {
      this.$emit('input', newValue);
    },
  },
  methods: {
    isObject(value) {
      return (!(Array.isArray(value)) &&
              !(value === null) &&
              (typeof value === 'object'));
    },
  },
  created() {
    if (!this.isObject(this.value)) {
      this.kind = this.schema;
    }
  },
};
</script>

<style scoped>
.node-header {
  font-weight: bold;
  line-height: 1.5em;
  color: black;
  font-size: 20px;
  position: relative;
  margin-top: 5%;
  line-height: 0px;
}
hr {
  border-top:1px dotted;
  color: gray;
}
</style>

