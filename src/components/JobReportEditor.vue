<template id="jobreporteditor">
    <!-- eslint-disable max-len -->
    <div class="container">
        <p></p>
        <div class="row">
            <b-form inline>
                <b-form-input v-model="name"></b-form-input>
            </b-form>
                <button class="btn btn-info"  @click="save_report()">
                    <icon name="file-upload" scale="1"></icon>
                </button>
                <button class="btn btn-link" @click="toggle_markup()" :hidden="show_markup">Show markup</button>
                <button class="btn btn-link" @click="toggle_markup()" :hidden="(!show_markup)">Hide markup</button>
        </div>
        <p></p>
        <div class="row" :hidden="show_markup">
            <b-form-textarea v-model="code" :rows="10" :max-rows="20"></b-form-textarea>
        </div>
        <div class="row" :hidden="(!show_markup)">
            <div v-html="compiledOutput"></div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import marked from 'marked';

export default {
  props: {
    job: Object,
    content: Number,
  },
  data() {
    return {
      code: '# hello',
      compiledOutput: '',
      show_markup: false,
      name: 'unnamed report',
      resourcesURL: 'http://localhost/',
    };
  },
  watch: {
    // eslint-disable-next-line
    content: function (val) {
      this.setup();
    },
  },
  methods: {
    toggle_markup() {
      let tCode = this.code;
      for (let i = 0; i < this.job.figure_output.length; i += 1) {
        // eslint-disable-next-line
        const from = '{{ figure:' + this.job.figure_output[i].label + ' }}';
        // eslint-disable-next-line
        const to = '<img height="250px" src="' + this.resourcesURL + this.job.figure_output[i].path + '"/>';
        tCode = tCode.replace(from, to);
      }
      for (let i = 0; i < this.job.table_output.length; i += 1) {
        const from = `{{ table:${this.job.table_output[i].label} }}`;
        const to = this.csv2Md(this.job.table_csv[i]);
        tCode = tCode.replace(from, to);
      }
      this.compiledOutput = marked(tCode);
      this.show_markup = !this.show_markup;
    },
    csv2Md(csv) {
      const keys = Object.keys(csv[0]);
      let md = `| ${keys.join('|')}|\n|`;
      for (let i = 0; i < keys.length; i += 1) {
        md += '---|';
      }
      md += '\n';
      for (let i = 0; i < csv.length; i += 1) {
        md += '|';
        for (let j = 0; j < keys.length; j += 1) {
          if (csv[i][keys[j]]) {
            md += `${csv[i][keys[j]]}|`;
          } else {
            md += '|';
          }
        }
        md += '\n';
      }
      return md;
    },
    loadReport() {
      axios.get(`http://localhost/${this.job.reports[this.content]}`)
        .then((response) => {
          this.code = response.data;
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    save_report() {
      const f = new FormData();
      const b = new Blob([this.code]);
      f.append(this.name, b);
      axios.post(`http://localhost:5000/job/${this.job.id}/report`,
        f,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          this.$emit('getJobs');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error(error);
        });
    },
    setup() {
      if (this.content === -1) {
        this.code = '# Report header\n\nThis is some text';
        this.name = 'unnamed report';
      } else {
        this.loadReport();
        this.name = this.job.reports[this.content].split('/').pop();
      }
    },
  },
  created() {
    this.show_markup = false;
    this.setup();
  },
};
</script>
