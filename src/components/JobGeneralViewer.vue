<template id="jobgeneralviewer">
    <!-- eslint-disable max-len -->
    <b-container>
        <div v-if="content=='overview'">
            Id:<h4>{{ job.id }}</h4><br>
            Label:<h4>{{ job.label }}</h4><br>
            Date:<h4>{{ job.date }}</h4><br>
            Flow:<h4>{{ job.flow.label }}</h4><br>
            Measurement:
            <h4 v-if="job.measurement == null"> N/A</h4>
            <h4 v-else>{{ job.measurement.label }}</h4>
        </div>
        <div v-else>
            <b-table striped hover :items="job.input"></b-table>
        </div>
    </b-container>
</template>

<script>
export default {
  props: {
    job: Object,
    content: String,
  },
};
</script>
