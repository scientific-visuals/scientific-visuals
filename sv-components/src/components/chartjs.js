import { Chart } from 'chart.js/auto';
import { createChart } from './chartjs-utils';
import { customElement } from 'aurelia';

@customElement('sv-chartjs')
export class Chartjs {

    mychart;

    bind() {}
    attached(){
        const data = [
            { year: 2010, count: 10 },
            { year: 2011, count: 20 },
            { year: 2012, count: 15 },
            { year: 2013, count: 25 },
            { year: 2014, count: 22 },
            { year: 2015, count: 30 },
            { year: 2016, count: 28 },
          ];
          const modifieddata = {
            labels: data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: data.map(row => row.count)
              }
            ]
          }
          this.chartjs = createChart(this.mychart,'bar',modifieddata);
    }
}