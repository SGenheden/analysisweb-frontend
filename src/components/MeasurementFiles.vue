<template id="measurementfiles">
    <!-- eslint-disable max-len -->
    <b-container>
        <b-row>
            <b-col lg="6">
                <b>Label</b>
            </b-col>
            <b-col lg="6">
                <b>File</b>
            </b-col>
        </b-row>
        <b-row v-for="(filedict, index) in files" :key="index" class="mt-3" align-v="center">
            <b-col lg="6">
                <b-form-input class="form-control form-control-sm" :id="'filelbl-input'+index" type="text" v-model="files[index].label" required :plaintext="edit" :readonly="edit"></b-form-input>
            </b-col>
            <b-col lg="6">
                <b-form-file class="form-control form-control-sm" :id="'file-input'+index" type="text" v-model="files[index].file" required v-if="!edit"></b-form-file>
                <b-form-input class="form-control form-control-sm" :id="'file-input'+index" type="text" v-model="files[index].file" required plaintext readonly v-else></b-form-input>
            </b-col>
        </b-row>
        <p></p>
        <b-button class="btn btn-success" @click="addFile()" v-bind:disabled="edit">Add file</b-button>
        <b-button class="btn btn-danger" @click="removeFile()" v-bind:disabled="(files.length<2)||edit">Remove file</b-button>
    </b-container>
</template>

<script>
export default {
  props: {
    files: Array,
    edit: Boolean,
  },
  created() {
    this.addFile();
    this.edit = false;
  },
  methods: {
    addFile() {
      this.files.push({
        label: '',
        file: '' },
      );
    },
    removeFile() {
      if (this.files.length > 1) {
        this.files.pop();
      }
    },
  },
};
</script>
