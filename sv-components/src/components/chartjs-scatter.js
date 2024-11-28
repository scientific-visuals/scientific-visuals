import { Chart } from 'chart.js/auto';
import { Chartjs } from "./chartjs";
import { createChart } from './chartjs-utils';
import { customElement } from 'aurelia';

@customElement('sv-chartjs-scatter')
export class ChartjsScatter extends Chartjs{
    mychart;

    bind() {}
    attached(){
        const data = {
            datasets: [{
              label: 'First Dataset',
              data: [{
                x: 20,
                y: 30,
                r: 15
              }, {
                x: 40,
                y: 10,
                r: 10
              },{
                x: 30,
                y: 12,
                r: 5
              }],
              //backgroundColor: 'rgb(255, 99, 132)'
            },{
                label: 'Second Dataset',
                data: [{
                  x: 19,
                  y: 32,
                  r: 2
                }, {
                  x: 41,
                  y: 12,
                  r: 5
                },{
                  x: 35,
                  y: 11,
                  r: 6
                }],
                //backgroundColor: 'rgb(99, 255, 132)'
              }]
          };
        this.chartjs = createChart(this.mychart,'bubble',data);
    }
}