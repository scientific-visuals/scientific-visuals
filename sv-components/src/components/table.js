import { IEventAggregator, resolve, customElement, bindable} from 'aurelia';
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
    attached() {
        
        let data = [
            ["Subject/Object/Predicate","type", "CRC Risk", "CRC Neoplasia","Physical Activity"],
            ["Trans-Chlordane","environmental", 1, 1,0 ],
            ["PCB194", "environmental" ,1, 1],
            ["Sterilisation", "biometric", 1, 0],
            ["Tobacco Consumption", "lifestyle", 1, 1,1],
            ["PAC-RSK","Interaction Term",1,0,1]
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

    submit(){
      let mydata= this.hot.getData();
      console.log('submit data:',mydata);
      this.ea.publish(this.datachannel,mydata)
    }

    
}