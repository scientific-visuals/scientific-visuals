import { IEventAggregator, resolve, customElement, bindable } from 'aurelia';
//import { Handsontable } from 'handsontable';
import Handsontable from "handsontable";
//import handsontablecss from 'handsontable/dist/handsontable.full.css';

@customElement('sv-table')
export class Table {
  ea /* IEventAggregator*/ = resolve(IEventAggregator);
  mytable;
  hot;
  @bindable datachannel;
  @bindable tabid;
  showtable = true;
  attached() {

    let data = [
      ["Subject/Object/Predicate", "type", "CRC Risk", "CRC Neoplasia", "Physical Activity"],
      ["Trans-Chlordane", "environmental", "corelates", "is", 0],
      ["PCB194", "environmental", "corelates", 1],
      ["Sterilisation", "biometric", "increase", 0],
      ["Tobacco Consumption", "lifestyle", "increase", 1, 1],
      ["PAC-RSK", "Interaction Term", "decrease", 0, 1]
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

  submit() {
    let mydata = this.hot.getData();
    console.log('submit data:', mydata);
    this.ea.publish(this.datachannel, mydata)
  }
  showHide() {
    this.showtable = !this.showtable;
  }

  addRow() {
    let name = prompt('Subject name', '');
    if (name) {
      const newRowIndex = this.hot.countRows()
      this.hot.alter('insert_row_below', newRowIndex)
      this.hot.setDataAtCell(newRowIndex, 0, name);
      this.hot.setDataAtCell(newRowIndex, 1, 'environmental');
      this.hot.selectCell(newRowIndex,0);
    }
  }
  addColumn() {
    let name = prompt('Object name', '');
    if (name) {
      // 1. Determine the index where the new column will be inserted (end of the table)
      const newColIndex = this.hot.countCols();

      // 2. Insert the new column at the determined index
      this.hot.alter('insert_col_end', newColIndex);

      // 3. Set the value of the first cell (row index 0) in the new column to 'name'
      this.hot.setDataAtCell(0, newColIndex, name);

      // Optional: If you want to focus on the newly added cell
      this.hot.selectCell(0, newColIndex);
    }
  }


}