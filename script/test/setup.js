import Vue from 'vue';
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';
import VueCompositionApi from '@vue/composition-api';
import TDesign from '../../src';

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

Vue.use(VueCompositionApi);
Vue.use(TDesign);
