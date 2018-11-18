<template>
  <!-- eslint-disable max-len -->
  <div id="app">
    <b-navbar toggleable="md" type="light" variant="light">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-brand>Sympathy for the web</b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">

            <b-navbar-nav>
                <b-nav-item href="#" @click="currentView='measurements'" :active="currentView==='measurements'">Measurements</b-nav-item>
                <b-nav-item href="#" @click="currentView='flows'" :active="currentView==='flows'">Flows</b-nav-item>
                <b-nav-item href="#" @click="currentView='jobs'" :active="currentView==='jobs'">Jobs</b-nav-item>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <div class="container">
      <component :is="currentView" v-on:gotoJob="gotoJob($event)" v-on:hideJob="hideJob($event)" v-on:getMeasurements="getMeasurements" v-on:getJobs="getJobs" v-on:getFlows="getFlows"
       :measurement_list=measurement_list :flow_list=flow_list :job_list=job_list :open_jobs=open_jobs :active_job=active_job
       :measurement_meta=measurement_meta :flow_meta=flow_meta>
      </component>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';
import axios from 'axios';
import measurements from './components/Measurements';
import flows from './components/Flows';
import jobs from './components/Jobs';

export default {
  name: 'App',
  components: {
    measurements,
    flows,
    jobs,
  },
  data() {
    return {
      currentView: 'jobs',
      measurement_list: [],
      flow_list: [],
      job_list: [],
      open_jobs: [],
      active_job: -1,
      measurement_meta: Object(),
      flow_meta: Object(),
    };
  },
  created() {
    this.getMeasurements();
    this.getFlows();
    this.getJobs();
    this.getMeta();
  },
  methods: {
    onChangeView(view) {
      this.currentView = view;
      // eslint-disable-next-line
      console.error(view);
    },
    getFlows() {
      const path = 'http://localhost:5000/flows';
      axios.get(path)
        .then((response) => {
          this.flow_list = response.data;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    getJobs() {
      const path = 'http://localhost:5000/jobs';
      axios.get(path)
        .then((response) => {
          this.job_list = response.data;
          for (let i = 0; i < this.job_list.length; i += 1) {
            if (this.job_list[i].status === 'SUBMITTED') {
              /* eslint no-underscore-dangle: */
              this.job_list[i]._rowVariant = 'warning';
            }
            // eslint-disable-next-line
            this.job_list[i].table_csv = Array.apply(null, Array(5)).map(() => { return []; });
            this.parseCSV(i);
          }
          this.getFlows();
          this.getMeasurements();
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    getMeasurements() {
      const path = 'http://localhost:5000/measurements';
      axios.get(path)
        .then((response) => {
          this.measurement_list = response.data;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    getMeta() {
      axios.get('http://localhost:5000/measurements/meta')
        .then((response) => {
          this.measurement_meta = response.data;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
      axios.get('http://localhost:5000/flows/meta')
        .then((response) => {
          this.flow_meta = response.data;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    gotoJob(id) {
      let index = -1;
      for (let i = 0; i < this.job_list.length; i += 1) {
        if (this.job_list[i].id === id) {
          index = i;
        }
      }
      if (index === -1) return;
      if (!this.open_jobs.includes(index)) {
        this.open_jobs.push(index);
      }
      this.active_job = -1;
      this.active_job = index;
      this.currentView = 'jobs';
    },
    hideJob(index) {
      this.open_jobs.splice(this.open_jobs.indexOf(index), 1);
    },
    parseCSV(jobId) {
      for (let i = 0; i < this.job_list[jobId].table_output.length; i += 1) {
        this.callPapa(jobId, i);
      }
    },
    callPapa(jobId, tableId) {
      const path = 'http://localhost/';
      Papa.parse(path + this.job_list[jobId].table_output[tableId].path, {
        download: true,
        delimiter: ',',
        header: true,
        complete: (results) => {
          this.job_list[jobId].table_csv[tableId] = results.data;
        },
      });
    },
  },
};
</script>

<style>
</style>
