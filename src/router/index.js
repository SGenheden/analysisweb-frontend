import Vue from 'vue';
import Router from 'vue-router';
import Measurements from '@/components/Measurements';
import Flows from '@/components/Flows';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Measurements',
      component: Measurements,
    },
    {
      path: '/',
      name: 'Flows',
      component: Flows,
    },
  ],
  mode: 'history',
});
