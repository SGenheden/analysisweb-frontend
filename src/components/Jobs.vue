<template id="jobs">
    <!-- eslint-disable max-len -->
    <div class="container">
        <p></p>
        <div class="row">
            <div class="col-sm-10">
                <b-tabs ref="tabs">
                    <b-tab title="All jobs" :active="active_job===-1">
                        <p>
                        </p>
                         <button type="button" class="btn btn-success btn-sm" @click="addJob()">
                            <icon name="plus" scale="1"></icon>
                            New job
                        </button>
                        <button type="button" class="btn btn-info btn-sm" @click="$emit('getJobs')">
                            <icon name="sync" scale="1"></icon>
                            Refresh list
                        </button>
                        <p/>
                        <b-table show-empty stacked="md" :items="job_list"  :fields="job_fields">
                            <template slot="analysis" slot-scope="row">{{row.value.label}}</template>
                            <template slot="measurement" slot-scope="row">{{row.value?row.value.label:'N/A'}}</template>
                            <template slot="actions" slot-scope="row">
                                <button class="btn btn-sm btn-danger" @click.stop="deleteJob(row.item.id, row.index)" :hidden="row.item.status != 'COMPLETED'">
                                    <icon name="trash-alt" scale="1"></icon>
                                </button>
                                <button class="btn btn-sm btn-warning" @click.stop="$emit('gotoJob', row.item.id)" :hidden="(row.item.status != 'COMPLETED') || open_jobs.includes(row.index)">
                                    <icon name="eye" scale="1"></icon>
                                </button>
                            </template>
                        </b-table>
                    </b-tab>
                    <b-tab v-for="(job_list_idx, index) in open_jobs" :key="index" :active="active_job===job_list_idx">
                        <template slot="title">
                            {{ job_list[job_list_idx].label }}
                            <button class="btn btn-sm" @click="$emit('hideJob', index)">
                                <icon name="window-close" scale="1"></icon>
                            </button>
                        </template>
                        <jobeditor v-bind:job="job_list[job_list_idx]" v-on:getJobs="$emit('getJobs')"></jobeditor>
                    </b-tab>
                </b-tabs>
            </div>
        </div>

        <b-modal ref="jobModal" id="job-modal" title="Execute new job" size="lg" hide-footer>
            <b-form @submit="onSubmit" @reset="onReset" class="w-100">
                <b-form-select v-model="selected_analysis" :options="analysis_options" class="mb-3" />
                <b-form-select v-model="selected_measurement" :options="measurement_options" class="mb-3" />
                <b-form-group id="label-group" label="Label:" label-for="label-input" horizontal>
                    <b-form-input class="form-control form-control-sm" id="title-input" type="text" v-model="new_job_label" required></b-form-input>
                </b-form-group>
                <span v-if="selected_analysis">Analysis input:</span>
                <jobinputform :input_list="analysis_input[selected_analysis]" :form_data="job_input_form[selected_analysis]" :measurement_labels="measurement_labels[selected_measurement]"></jobinputform>
                <br><hr><br>
                <b-button type="submit" variant="primary">Execute</b-button>
                <b-button type="reset" variant="danger">Cancel</b-button>
                <p></p>
            </b-form>
        </b-modal>

    </div>
</template>

<script>
import axios from 'axios';
import jobeditor from './JobEditor';
import jobinputform from './JobInputForm';

export default {
  props: {
    job_list: Array,
    measurement_list: Array,
    analysis_list: Array,
    open_jobs: Array,
    active_job: Number,
  },
  data() {
    return {
      figpath: '../../static/test.html',
      active_tab: -1,
      selected_analysis: null,
      selected_measurement: null,
      analysis_options: [],
      measurement_options: [],
      analysis_input: {},
      measurement_labels: {},
      job_input_form: {},
      new_job_label: '',
      job_fields: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'label', label: 'Label', sortable: true },
        { key: 'date', label: 'Date', sortable: true },
        { key: 'status', label: 'Status' },
        { key: 'analysis', label: 'Analysis', sortable: true },
        { key: 'measurement', label: 'Measurement', sortable: true },
        { key: 'actions', label: '' },
      ],
    };
  },
  components: {
    jobeditor,
    jobinputform,
  },
  methods: {
    addJob() {
      this.$refs.jobModal.show();
      this.analysis_options = [];
      this.analysis_input = {};
      this.job_input_form = {};
      this.analysis_options.push({
        value: null,
        text: 'Select an analysis',
      });
      for (let i = 0; i < this.analysis_list.length; i += 1) {
        this.analysis_options.push({
          value: this.analysis_list[i].id,
          text: this.analysis_list[i].label,
        });
        this.analysis_input[this.analysis_list[i].id] = this.analysis_list[i].input;
        this.job_input_form[this.analysis_list[i].id] =
          new Array(this.analysis_list[i].input.length);
      }
      this.measurement_options = [];
      this.measurement_labels = {
        null: [],
      };
      this.measurement_options.push({
        value: null,
        text: 'Select a measurement',
      });
      for (let i = 0; i < this.measurement_list.length; i += 1) {
        this.measurement_options.push({
          value: this.measurement_list[i].id,
          text: this.measurement_list[i].label,
        });
        this.measurement_labels[this.measurement_list[i].id] = [];
        for (let j = 0; j < this.measurement_list[i].files.length; j += 1) {
          this.measurement_labels[this.measurement_list[i].id].push(
            this.measurement_list[i].files[j].label,
          );
        }
      }
    },
    clearForm() {
      this.new_job_label = '';
      this.selected_analysis = null;
    },
    deleteJob(id, listIndex) {
      this.$emit('hideJob', listIndex);
      const path = 'http://localhost:5000/job/';
      axios.delete(path + id)
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getJobs');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    onSubmit(event) {
      event.preventDefault();
      this.$refs.jobModal.hide();
      const formData = new FormData();
      formData.append('label', this.new_job_label);
      formData.append('analysis', this.selected_analysis);
      if (this.selected_measurement) {
        formData.append('measurement', this.selected_measurement);
      }
      const jobinp = this.job_input_form[this.selected_analysis];
      const analysisinp = this.analysis_input[this.selected_analysis];
      const measurlbl = this.measurement_labels[this.selected_measurement];
      let nmeasurement = 0;
      for (let i = 0; i < jobinp.length; i += 1) {
        if (measurlbl.includes(analysisinp[i].label)) {
          nmeasurement += 1;
          formData.append('input', `$measurement${nmeasurement}`);
        } else {
          formData.append('input', jobinp[i]);
        }
      }
      axios.post('http://localhost:5000/jobs',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getJobs');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
      this.clearForm();
    },
    onReset(event) {
      event.preventDefault();
      this.$refs.jobModal.hide();
      this.clearForm();
    },
  },
  created() {
    this.active_tab = -1;
  },
};
</script>

