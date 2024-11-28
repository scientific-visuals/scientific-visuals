import { Chart } from 'chart.js/auto';

export function createChart(reference, type, data, options = {}) {
    return new Chart(
        reference,
        {
          type: type,
          data: data,
          options: options
        }
      );
}