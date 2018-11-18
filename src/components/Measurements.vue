<template id="measurements">
    <!-- eslint-disable max-len -->
    <div class="container">
        <p></p>
        <div class="row">
            <div class="col-sm-10">
                <button type="button" class="btn btn-success btn-sm" @click="addMeasurement()">
                    <icon name="plus" scale="1"></icon>
                    Add measurement
                </button>
                <p>
                </p>
                <b-table show-empty stacked="md" :items="measurement_list"  :fields="measurement_fields">
                    <template slot="jobs" slot-scope="row">
                        <b-dropdown text="Go to" class="m-sm-10" size="sm">
                            <b-dropdown-item v-for="(job, jindex) in row.value" :key="jindex"  @click="gotoJob(job.id)">
                                {{ job.label }}
                            </b-dropdown-item>
                        </b-dropdown>
                    </template>
                    <template slot="actions" slot-scope="row">
                        <button class="btn btn-sm btn-danger" @click.stop="deleteMeasurement(row.item.id)" :disabled="row.item.jobs.length>0">
                            <icon name="trash-alt" scale="1"></icon>
                        </button>
                        <button class="btn btn-sm btn-warning" @click.stop="editMeasurement(row.index)">
                            <icon name="eye" scale="1"></icon>
                        </button>
                    </template>
                </b-table>
            </div>
        </div>
        <b-modal ref="measurementModal" id="measurement-modal" v-bind:title="modal_title" size="lg" hide-footer>
            <b-form @submit="onSubmit" @reset="onReset" class="w-100">
                <b-tabs>
                    <b-tab title="Basic information" active>
                        <p></p>
                        <b-form-group id="label-group" label="Label:" label-for="label-input" horizontal>
                            <b-form-input class="form-control form-control-sm" id="title-input" type="text" v-model="measurementForm.label" required></b-form-input>
                        </b-form-group>
                        <b-form-group id="start-group" label="Start time:" label-for="start-input" horizontal>
                            <datetime id="start-input" firstDayOfWeek="1" format="YYYY-MM-DD H:i:s" v-model="measurementForm.start_date"></datetime>
                        </b-form-group>
                        <b-form-group id="end-group" label="End time:" label-for="end-input" horizontal>
                            <datetime id="end-input" firstDayOfWeek="1" format="YYYY-MM-DD H:i:s" v-model="measurementForm.end_date"></datetime>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Files">
                        <p></p>
                        <measurementfiles v-bind:files="measurementForm.files" v-bind:edit="modal_index>-1"></measurementfiles>
                    </b-tab>
                    <b-tab v-if="JSON.stringify(measurement_meta)!=='{}'" title="Meta-data">
                        <p></p>
                        <metaForm name="" v-model=measurementForm.meta :schema=measurement_meta></metaForm>
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
import datetime from 'vuejs-datetimepicker';
import axios from 'axios';
import measurementfiles from './MeasurementFiles';
import metaForm from './MetaForm';

export default {
  props: {
    measurement_list: Array,
    measurement_meta: Object,
  },
  data() {
    return {
      measurement_fields: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'label', label: 'Label', sortable: true },
        { key: 'start_date', label: 'Start date', sortable: true },
        { key: 'end_date', label: 'End date', sortable: true },
        { key: 'jobs', label: 'Jobs' },
        { key: 'actions', label: '' },
      ],
      measurementForm: {
        label: '',
        start_date: '',
        end_date: '',
        files: [],
        meta: Object(),
      },
      modal_index: -1,
      modal_title: 'Add a new measurement',
      modal_submit_text: 'Submit',
      formOptions: {
        validateAfterLoad: true,
        validateAfterChanged: true,
      },
    };
  },
  components: {
    datetime,
    measurementfiles,
    metaForm,
  },
  created() {
    this.clearForm();
  },
  methods: {
    addMeasurement() {
      this.modal_index = -1;
      this.modal_title = 'Add a new measurement';
      this.modal_submit_text = 'Submit';
      this.clearForm();
      this.measurementForm.files.push({
        label: '',
        file: '' },
      );
      this.$refs.measurementModal.show();
    },
    clearForm() {
      this.measurementForm.label = '';
      this.measurementForm.start_date = '';
      this.measurementForm.end_date = '';
      this.measurementForm.files = [];
      const meta = JSON.parse(JSON.stringify(this.measurement_meta));
      this.measurementForm.meta = this.zeroValues(meta);
    },
    deleteMeasurement(index) {
      const path = 'http://localhost:5000/measurement/';
      axios.delete(path + index)
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getMeasurements');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    editMeasurement(index) {
      this.measurementForm.label = this.measurement_list[index].label;
      this.measurementForm.start_date = this.measurement_list[index].start_date;
      this.measurementForm.end_date = this.measurement_list[index].end_date;
      this.measurementForm.meta = this.measurement_list[index].meta_data;
      this.measurementForm.files = [];
      for (let i = 0; i < this.measurement_list[index].files.length; i += 1) {
        this.measurementForm.files.push({
          label: this.measurement_list[index].files[i].label,
          file: this.measurement_list[index].files[i].path.split('/').pop(),
        });
      }
      this.modal_index = index;
      this.modal_title = 'Edit measurement';
      this.modal_submit_text = 'Update';
      this.$refs.measurementModal.show();
    },
    gotoJob(index) {
      this.$emit('gotoJob', index);
    },
    isObject(value) {
      return (!(Array.isArray(value)) &&
              !(value === null) &&
              (typeof value === 'object'));
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
          this.$emit('getMeasurements');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    zeroValues(obj) {
      const ret = Object();
      // eslint-disable-next-line
      for (let [key, value] of Object.entries(obj)) {
        if (this.isObject(value)) {
          ret[key] = this.zeroValues(value);
        } else {
          ret[key] = '';
        }
      }
      return ret;
    },
    onSubmit(event) {
      event.preventDefault();
      this.$refs.measurementModal.hide();
      const formData = new FormData();
      formData.append('label', this.measurementForm.label);
      formData.append('start_date', this.measurementForm.start_date);
      formData.append('end_date', this.measurementForm.end_date);
      formData.append('meta_data', JSON.stringify(this.measurementForm.meta));
      if (this.modal_index === -1) {
        for (let i = 0; i < this.measurementForm.files.length; i += 1) {
          formData.append(this.measurementForm.files[i].label, this.measurementForm.files[i].file);
        }
        this.postData('http://localhost:5000/measurements', formData, axios.post);
      } else {
        const path = 'http://localhost:5000/measurement/';
        this.postData(path + this.measurement_list[this.modal_index].id, formData, axios.put);
      }
    },
    onReset(event) {
      event.preventDefault();
      this.$refs.measurementModal.hide();
      this.clearForm();
    },
  },
};
</script>

