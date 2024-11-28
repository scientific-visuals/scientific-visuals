import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { Chartjs } from './components/chartjs';
import { ChartjsGeo } from './components/chartjs-geo';
import { ChartjsScatter } from './components/chartjs-scatter';
import { Table } from './components/table';

Aurelia
.register(Chartjs)
.register(ChartjsScatter)
.register(Table)
.register(ChartjsGeo)
  .app(MyApp)
  .start();
