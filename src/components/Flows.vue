<template id="flows">
    <!-- eslint-disable max-len -->
    <div class="container">
        <p></p>
        <div class="row">
            <div class="col-sm-10">
                <button type="button" class="btn btn-success btn-sm" @click="addFlow()">
                    <icon name="plus" scale="1"></icon>
                    Add flow
                </button>
                <p>
                </p>
                <b-table show-empty stacked="md" :items="flow_list"  :fields="flow_fields">
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
                        <button class="btn btn-sm btn-danger" @click.stop="deleteFlow(row.item.id)" :disabled="row.item.jobs.length>0">
                            <icon name="trash-alt" scale="1"></icon>
                        </button>
                        <button class="btn btn-sm btn-warning" @click.stop="editFlow(row.index)">
                            <icon name="eye" scale="1"></icon>
                        </button>
                    </template>
                </b-table>
            </div>
        </div>
        <b-modal ref="flowModal" id="flow-modal" v-bind:title="modal_title" size="lg" hide-footer>
            <b-form @submit="onSubmit" @reset="onReset" class="w-100">
                <b-tabs>
                    <b-tab title="Basic information" active>
                        <p></p>
                        <b-form-group id="label-group" label="Label:" label-for="label-input" horizontal>
                            <b-form-input class="form-control form-control-sm" id="title-input" type="text" v-model="flowForm.label" required></b-form-input>
                        </b-form-group>
                        <b-form-group id="syx-group" label="Syx file:" label-for="syx-input" horizontal>
                            <b-form-file class="form-control form-control-sm" id="syx-input" type="text" v-model="flowForm.syx_file" required v-if="modal_index==-1"/>
                            <b-form-input class="form-control form-control-sm" type="text" v-model="flowForm.syx_file" required plaintext readonly v-else/>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Input">
                        <p></p>
                        <flowioeditor v-bind:items="flowForm.input" v-bind:edit="modal_index>-1" v-bind:options="['file', 'value']"/>
                    </b-tab>
                    <b-tab title="Output">
                        <p></p>
                        <flowioeditor v-bind:items="flowForm.output" v-bind:edit="modal_index>-1" v-bind:options="['table', 'figure']"/>
                    </b-tab>
                    <b-tab v-if="JSON.stringify(flow_meta)!=='{}'" title="Meta-data">
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
import flowioeditor from './FlowIOEditor';

export default {
  props: {
    flow_list: Array,
    flow_meta: Object,
  },
  data() {
    return {
      flow_fields: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'label', label: 'Label', sortable: true },
        { key: 'syx_file', label: 'Syx file', sortable: true },
        { key: 'jobs', label: 'Jobs' },
        { key: 'actions', label: '' },
      ],
      flowForm: {
        label: '',
        syx_file: '',
        input: [],
        output: [],
      },
      modal_index: -1,
      modal_title: 'Add a new flow',
      modal_submit_text: 'Submit',
    };
  },
  components: {
    flowioeditor,
  },
  methods: {
    addFlow() {
      this.modal_index = -1;
      this.modal_title = 'Add a new flow';
      this.modal_submit_text = 'Submit';
      this.clearForm();
      this.flowForm.input.push({
        label: '',
        file: 'value' },
      );
      this.flowForm.output.push({
        label: '',
        file: 'table' },
      );
      this.$refs.flowModal.show();
    },
    clearForm() {
      this.flowForm.label = '';
      this.flowForm.syx_file = '';
      this.flowForm.input = [];
      this.flowForm.output = [];
    },
    deleteFlow(index) {
      const path = 'http://localhost:5000/flow/';
      axios.delete(path + index)
        .then((response) => {
          // eslint-disable-next-line
          console.info(response);
          this.$emit('getFlows');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    editFlow(index) {
      this.flowForm.label = this.flow_list[index].label;
      this.flowForm.syx_file = this.flow_list[index].syx_file.split('/').pop();
      this.flowForm.input = this.flow_list[index].input;
      this.flowForm.output = this.flow_list[index].output;
      this.modal_index = index;
      this.modal_title = 'Edit flow';
      this.modal_submit_text = 'Update';
      this.$refs.flowModal.show();
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
          this.$emit('getFlows');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    onSubmit(event) {
      event.preventDefault();
      this.$refs.flowModal.hide();
      const formData = new FormData();
      formData.append('label', this.flowForm.label);
      formData.append('syx_file', this.flowForm.syx_file);
      for (let i = 0; i < this.flowForm.input.length; i += 1) {
        formData.append('input', JSON.stringify(this.flowForm.input[i]));
      }
      for (let i = 0; i < this.flowForm.output.length; i += 1) {
        formData.append('output', JSON.stringify(this.flowForm.output[i]));
      }
      if (this.modal_index === -1) {
        this.postData('http://localhost:5000/flows', formData, axios.post);
      } else {
        const path = 'http://localhost:5000/flow/';
        this.postData(path + this.flow_list[this.modal_index].id, formData, axios.put);
      }
    },
    onReset(event) {
      event.preventDefault();
      this.$refs.flowModal.hide();
      this.clearForm();
    },
  },
};
</script>

