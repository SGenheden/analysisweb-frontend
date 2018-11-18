<template id="jobinputform">
    <!-- eslint-disable max-len -->
    <b-container>
        <b-form-group v-for="(inp, index) in input_list"
            :key="index"
            :id="'inp-group-'+inp.label"
            :label="inp.label+':'"
            :label-for="'inp-'+inp.label">
            <b-form-input class="form-control form-control-sm" :id="'inp-'+inp.label" v-model="form_data[index]" v-if="inp.type==='value'"></b-form-input>
            <b-form-file class="form-control form-control-sm" :id="'inp-'+inp.label" v-model="form_data[index]" v-else-if="!measurement_labels.includes(inp.label)"></b-form-file>
            <b-form-input class="form-control form-control-sm" :id="'inp-'+inp.label" v-model="form_data[index]" type="text" plaintext readonly v-else value="$measurement"></b-form-input>
        </b-form-group>
    </b-container>
</template>

<script>

export default {
  props: {
    input_list: Array,
    form_data: Array,
    measurement_labels: Array,
  },
  methods: {
    match(label) {
      // eslint-disable-next-line
      console.info(label, this.measurement_labels);
      return false;
    },
  },
};
</script>
