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
  @bindable tabid; //
  showtable = true; //triggers showing/hiding table in view

  attached() {
    let data = [
      ['Gene','Type','CEA','CA19_9','Tumor Size','Metabolic Activity','ctDNA','CRP','Bowel MovementPatterns',
        'Ki-67','Cascpase-3','MMP-1','Cell Proliferation'
      ],
      ["APC", "Tumor suppressor gene", 0.8, 0.3, 0.9, 0.7, 0.6, 0.2, 0.1, 0.9, -0.6, -0.7, 0.9],
      ["KRAS", "Kirsten Rat Sarcoma Viral Oncogene Homolog", 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0, 0.8, -0.5, 0.2, 0.8],
      ["TP53", "Tumor Protein 53", 0.6, 0.2, 0.7, 0.5, 0.4, 0.4, 0.1, 0.7, 0.9, -0.4, 0.7],
      ["MLH1", "Mismatch Repair gene", 0.5, 0.3, 0.6, 0.4, 0.7, 0.5, 0.2, 0.6, 0.7, -0.3, 0.6],
      ["MSH2", "Mismatch Repair gene", 0.5, 0.3, 0.6, 0.4, 0.7, 0.5, 0.2, 0.6, 0.7, -0.3, 0.6],
      ["BRAF", "Oncogene MAPK/ERK signaling pathway", 0.4, 0.5, 0.5, 0.8, 0.3, 0.3, 0, 0.5, -0.2, 0.5, 0.5],
      ["SMAD4", "Tumor suppressor gene", 0.3, 0.2, 0.4, 0.3, 0.2, 0.4, 0.1, 0.4, 0.6, -0.5, 0.4],
      ["PIK3CA", "Oncogene", 0.6, 0.4, 0.7, 0.6, 0.5, 0.3, 0, 0.7, -0.4, 0.3, 0.7],
      ["NRAS", "Oncogene", 0.4, 0.3, 0.5, 0.5, 0.4, 0.2, 0.1, 0.5, -0.3, 0.2, 0.5],
      ["CTNNB1", "Cell adhesion signaling pathway", 0.3, 0.2, 0.4, 0.3, 0.3, 0.1, 0, 0.4, -0.2, -0.1, 0.4],
      ["FBXW7", "Tumor suppressor gene", 0.2, 0.1, 0.3, 0.2, 0.2, 0.3, 0.1, 0.3, 0.5, -0.4, 0.3]
    ];
    //let container = document.getElementById('example');
    //this.hot = new Handsontable(container, {
    let that = this;
    this.hot = new Handsontable(this.mytable, {
      data: data,
      rowHeaders: true,
      colHeaders: true,
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation', // for non-commercial use only
      // Define the afterChange hook
      afterChange: function (changes, source) {
        // Prevent triggering during initial data load
        if (source === 'loadData' || !changes) return;
        //this.layout.stop()
        // Iterate over each change and call changeContent()
        changes.forEach(([row, prop, oldValue, newValue]) => {
          // Optional: Pass relevant details to changeContent
          that.changeContent(row, prop, oldValue, newValue);
        });
        //this.layout.start()
      }
    });
  }

  changeContent(row,prop,oldValue,newValue) {
    console.log(`Cell at row ${row}, column ${prop} changed from "${oldValue}" to "${newValue}".`);
    if (row == 0) {
      //change Object
      this.ea.publish(this.datachannel,{'type':'changeNode','old':oldValue,'value':newValue})
    } else {
      if (prop == 0) {
        //change Subject
        this.ea.publish(this.datachannel,{'type':'changeNode','old':oldValue,'value':newValue})
      } else if (prop ==1) {
        //change Subject type  
        const nodeName = this.hot.getDataAtCell(row, 0);
        this.ea.publish(this.datachannel,{'type':'changeType','node':nodeName,'old':oldValue,'value':newValue})
      } else {
        //change relationship
        const subjectName = this.hot.getDataAtCell(row, 0);
        const objectName = this.hot.getDataAtCell(0, prop);
        this.ea.publish(this.datachannel,{'type':'changeEdge','subject':subjectName,'object':objectName,'old':oldValue,'value':newValue})
      }
    }
    
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
      this.hot.selectCell(newRowIndex, 0);
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

  switchTo1Table() {

  }
  switchTo2Table() {
    
  }


}