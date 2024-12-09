import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { Chartjs } from './components/chartjs';
import { ChartjsGeo } from './components/chartjs-geo';
import { ChartjsScatter } from './components/chartjs-scatter';
import { Table } from './components/table';
import {Network} from './components/network';
import {Tabs} from './components/tabs';

Aurelia
.register(Chartjs)
.register(ChartjsScatter)
.register(Table)
.register(ChartjsGeo)
.register(Network)
.register(Tabs)
  .app(MyApp)
  .start();
