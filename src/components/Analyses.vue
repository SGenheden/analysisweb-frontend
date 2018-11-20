<template id="analyses">
    <!-- eslint-disable max-len -->
    <div class="container">
        <p></p>
        <div class="row">
            <div class="col-sm-10">
                <button type="button" class="btn btn-success btn-sm" @click="addAnalysis()">
                    <icon name="plus" scale="1"></icon>
                    Add analysis
                </button>
                <p>
                </p>
                <b-table show-empty stacked="md" :items="analysis_list"  :fields="analysis_fields">
                    <template slot="syx_file" slot-scope="row">
                        {{ row.value.split('/').pop() }}
                    </template>
                    <template slot="jobs" slot-scope="row">
                        <b-dropdown text="Go to" class="m-sm-10" size="sm">
                            <b-dropdown-item v-for="(job, jindex) in row.value" :key="jindex"  @click="gotoJob(job.id)">
                                {{ job.label }}
                            </b-dropdown-item>
                        </b-dropdown>
                    </template>
                    <template slot="actions" slot-scope="row">
                        <button class="btn btn-sm btn-danger" @click.stop="deleteAnalysis(row.item.id)" :disabled="row.item.jobs.length>0">
                            <icon name="trash-alt" scale="1"></icon>
                        </button>
                        <button class="btn btn-sm btn-warning" @click.stop="editAnalysis(row.index)">
                            <icon name="eye" scale="1"></icon>
                        </button>
                    </template>
                </b-table>
            </div>
        </div>
        <b-modal ref="analysisModal" id="analysis-modal" v-bind:title="modal_title" size="lg" hide-footer>
            <b-form @submit="onSubmit" @reset="onReset" class="w-100">
                <b-tabs>
                    <b-tab title="Basic information" active>
                        <p></p>
                        <b-form-group id="label-group" label="Label:" label-for="label-input" horizontal>
                            <b-form-input class="form-control form-control-sm" id="title-input" type="text" v-model="analysisForm.label" required></b-form-input>
                        </b-form-group>
                        <b-form-group id="syx-group" label="Syx file:" label-for="syx-input" horizontal>
                            <b-form-file class="form-control form-control-sm" id="syx-input" type="text" v-model="analysisForm.syx_file" required v-if="modal_index==-1"/>
                            <b-form-input class="form-control form-control-sm" type="text" v-model="analysisForm.syx_file" required plaintext readonly v-else/>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Input">
                        <p></p>
                        <analysisioeditor v-bind:items="analysisForm.input" v-bind:edit="modal_index>-1" v-bind:options="['file', 'value']"/>
                    </b-tab>
                    <b-tab title="Output">
                        <p></p>
                        <analysisioeditor v-bind:items="analysisForm.output" v-bind:edit="modal_index>-1" v-bind:options="['table', 'figure']"/>
                    </b-tab>
                    <b-tab v-if="JSON.stringify(analysis_meta)!=='{}'" title="Meta-data">
                        <p></p>
                        Nothing here yet!
                    </b-tab>
                </b-tabs>
                <br><hr><br>
                <b-button type="submit" variant="primary">{{ modal_submit_text }}</b-button>
                <b-button type="reset" variant="danger">Cancel</b-button>
                <p></p>
            </b-form>
        </b-modal>
    </div>
</template>

<script>
import axios from 'axios';
import analysisioeditor from './AnalysisIOEditor';

export default {
  props: {
    analysis_list: Array,
    analysis_meta: Object,
  },
  data() {
    return {
      analysis_fields: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'label', label: 'Label', sortable: true },
        { key: 'syx_file', label: 'Syx file', sortable: true },
        { key: 'jobs', label: 'Jobs' },
        { key: 'actions', label: '' },
      ],
      analysisForm: {
        label: '',
        syx_file: '',
        input: [],
        output: [],
      },
      modal_index: -1,
      modal_title: 'Add a new analysis',
      modal_submit_text: 'Submit',
    };
  },
  components: {
    analysisioeditor,
  },
  methods: {
    addAnalysis() {
      this.modal_index = -1;
      this.modal_title = 'Add a new analysis';
      this.modal_submit_text = 'Submit';
      this.clearForm();
      this.analysisForm.input.push({
        label: '',
        file: 'value' },
      );
      this.analysisForm.output.push({
        label: '',
        file: 'table' },
      );
      this.$refs.analysisModal.show();
    },
    clearForm() {
      this.analysisForm.label = '';
      this.analysisForm.syx_file = '';
      this.analysisForm.input = [];
      this.analysisForm.output = [];
    },
    deleteAnalysis(index) {
      const path = 'http://localhost:5000/analysis/';
      axios.delete(path + index)
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getAnalyses');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    editAnalysis(index) {
      this.analysisForm.label = this.analysis_list[index].label;
      this.analysisForm.syx_file = this.analysis_list[index].syx_file.split('/').pop();
      this.analysisForm.input = this.analysis_list[index].input;
      this.analysisForm.output = this.analysis_list[index].output;
      this.modal_index = index;
      this.modal_title = 'Edit analysis';
      this.modal_submit_text = 'Update';
      this.$refs.analysisModal.show();
    },
    gotoJob(index) {
      this.$emit('gotoJob', index);
    },
    postData(path, data, func) {
      func(path,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getAnalyses');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    onSubmit(event) {
      event.preventDefault();
      this.$refs.analysisModal.hide();
      const formData = new FormData();
      formData.append('label', this.analysisForm.label);
      formData.append('syx_file', this.analysisForm.syx_file);
      for (let i = 0; i < this.analysisForm.input.length; i += 1) {
        formData.append('input', JSON.stringify(this.analysisForm.input[i]));
      }
      for (let i = 0; i < this.analysisForm.output.length; i += 1) {
        formData.append('output', JSON.stringify(this.analysisForm.output[i]));
      }
      if (this.modal_index === -1) {
        this.postData('http://localhost:5000/analyses', formData, axios.post);
      } else {
        const path = 'http://localhost:5000/analysis/';
        this.postData(path + this.analysis_list[this.modal_index].id, formData, axios.put);
      }
    },
    onReset(event) {
      event.preventDefault();
      this.$refs.analysisModal.hide();
      this.clearForm();
    },
  },
};
</script>

