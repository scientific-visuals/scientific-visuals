//import { Handsontable } from 'handsontable';
import Handsontable from "handsontable";
//import handsontablecss from 'handsontable/dist/handsontable.full.css';

@customElement('sv-table')
/*@customElement({
    name: 'sv-table',
    //template: `<div ref="hot"></div>`,
    shadowOptions: { mode: 'open' },
    css: handsontableStyles, // Inline CSS into the shadow DOM
  })*/
export class Table {
    mytable;
    hot;
    attached() {
        let data = [
            ["", "Tesla", "Volvo", "Toyota", "Honda"],
            ["2017", 10, 11, 12, 13],
            ["2018", 20, 11, 14, 13],
            ["2019", 30, 15, 12, 13]
          ];
           
          //let container = document.getElementById('example');
          //this.hot = new Handsontable(container, {
          this.hot = new Handsontable(this.mytable, {
            data: data,
            rowHeaders: true,
            colHeaders: true,
            autoWrapRow: true,
            autoWrapCol: true,
            licenseKey: 'non-commercial-and-evaluation' // for non-commercial use only
          });
    }
}