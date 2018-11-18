<template id="jobeditor">
    <!-- eslint-disable max-len -->
    <b-container>
        <p></p>
        <b-nav pills>
            <b-nav-item @click="show_general('overview')" :active="activeBtn=='overview'">
                <icon name="info-circle" scale="1"></icon>
                Overview
            </b-nav-item>
            <b-nav-item @click="show_general('input')" :active="activeBtn=='input'">
                <icon name="long-arrow-alt-right" scale="1"></icon>
                Input
            </b-nav-item>
            <b-nav-item @click="show_log()" :active="activeBtn=='log'">
                <icon name="clipboard-check" scale="1"></icon>
                Log file
            </b-nav-item>
            <b-nav-item-dropdown text="Reports" left :active="activeBtn=='report'">
                <template slot="button-content">
                    <icon name="file-export" scale="1"></icon> Reports
                </template>
                <b-dropdown-item @click="show_report(-1)">New...</b-dropdown-item>
                <b-dropdown-item v-for="(report, index) in job.reports" :key="index" @click="show_report(index)">
                    {{ report.split('/').pop() }}
                </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown text="Tables" left :active="activeBtn=='table'">
                <template slot="button-content">
                    <icon name="table" scale="1"></icon> Tables
                </template>
                <b-dropdown-item v-for="(table, index) in job.table_output" :key="index" @click="show_table(index)">
                    {{ table.label }}
                </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown text="Figures" left :active="activeBtn=='figure'">
                <template slot="button-content">
                    <icon name="chart-line" scale="1"></icon> Figures
                </template>
                <b-dropdown-item v-for="(figure, index) in job.figure_output" :key="index" @click="show_figure(index)">
                    {{ figure.label }}
                </b-dropdown-item>
            </b-nav-item-dropdown>
        </b-nav>
        <p></p>
        <component :is="currentView" :content=content :job=job v-on:getJobs="$emit('getJobs')"></component>
        <p></p>
    </b-container>
</template>

<script>
import jobgeneralviewer from './JobGeneralViewer';
import tableviewer from './TableViewer';
import jobreporteditor from './JobReportEditor';
import jobembededviewer from './JobEmbededViewer';

export default {
  data() {
    return {
      currentView: jobgeneralviewer,
      content: 'overview',
      activeBtn: 'overview',
      resourcesURL: 'http://localhost/',
    };
  },
  props: {
    job: Object,
  },
  components: {
    jobgeneralviewer,
    tableviewer,
    jobreporteditor,
    jobembededviewer,
  },
  methods: {
    show_figure(index) {
      this.currentView = jobembededviewer;
      this.content = this.resourcesURL + this.job.figure_output[index].path.replace('.png', '.html');
      this.activeBtn = 'figure';
    },
    show_general(kind) {
      this.currentView = jobgeneralviewer;
      this.content = kind;
      this.activeBtn = kind;
    },
    show_log() {
      this.currentView = jobembededviewer;
      this.content = this.resourcesURL + this.job.log;
      this.activeBtn = 'log';
    },
    show_report(index) {
      this.currentView = jobreporteditor;
      if (index === -1) {
        this.content = -1;
      } else {
        // TODO: load report
        this.content = index;
      }
      this.activeBtn = 'report';
    },
    show_table(index) {
      this.currentView = tableviewer;
      this.content = this.job.table_csv[index];
      this.activeBtn = 'table';
    },
  },
};
</script>
