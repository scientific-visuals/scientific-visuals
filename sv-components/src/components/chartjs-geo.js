import { Chart, registerables } from "chart.js/auto";
import { bindable, observable } from 'aurelia';
import { topojson, ChoroplethController, GeoFeature, ProjectionScale, ColorScale } from "chartjs-chart-geo";
import { whereNumeric,whereAlpha2 } from 'iso-3166-1'
//import { TaskQueue } from '@aurelia/runtime-html';
import { inject} from 'aurelia';
import { PLATFORM } from 'aurelia';

@customElement('sv-chartjs-geo')
//@inject(TaskQueue)
export class ChartjsGeo {
    @bindable datasrc = 'g/National_Initiatives_Figure_Data.csv';
    @bindable countriessrc = 'https://unpkg.com/world-atlas/countries-50m.json'
    //@bindable selected = {};
    geochart;
    countryDataDesc = {};
    projecturls = [];
    @observable countryName='';

  /*  constructor(taskQueue) {
        this.taskQueue = taskQueue;
    }
    */
    // Helper function to parse CSV
    /*parseCSV(csv) {
        const rows = csv.split('\n').map((row) => row.split(','));
        const headers = rows.shift(); // Extract header row
        return rows.map((row) =>
            headers.reduce((acc, header, index) => {
                acc[header] = row[index];
                return acc;
            }, {})
        );
    }*/
        parseCSV(str) {
            const arr = [];
            let quote = false;  // 'true' means we're inside a quoted field
        
            // Iterate over each character, keep track of current row and column (of the returned array)
            for (let row = 0, col = 0, c = 0; c < str.length; c++) {
                let cc = str[c], nc = str[c+1];        // Current character, next character
                arr[row] = arr[row] || [];             // Create a new row if necessary
                arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary
        
                // If the current character is a quotation mark, and we're inside a
                // quoted field, and the next character is also a quotation mark,
                // add a quotation mark to the current column and skip the next character
                if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        
                // If it's just one quotation mark, begin/end quoted field
                if (cc == '"') { quote = !quote; continue; }
        
                // If it's a comma and we're not in a quoted field, move on to the next column
                if (cc == ',' && !quote) { ++col; continue; }
        
                // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
                // and move on to the next row and move to column 0 of that new row
                if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        
                // If it's a newline (LF or CR) and we're not in a quoted field,
                // move on to the next row and move to column 0 of that new row
                if (cc == '\n' && !quote) { ++row; col = 0; continue; }
                if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        
                // Otherwise, append the current character to the current column
                arr[row][col] += cc;
            }
            console.log('parseCSV arr:',arr)
            return arr;
        }
    
    showSelected(selectedid){
        if (this.countryDataDesc) {
            this.selected = this.countryDataDesc[selectedid];
            console.log('showselected',selectedid, this.selected)
            if (this.selected) {
              this.countryName = this.selected[0];
              this.projectName = this.selected[3];
              this.projectPublication = this.selected[2];
              this.projectStatus = this.selected[8];
              this.projectStatusText = this.selected[7];
              if (this.selected[4]) {
                this.projecturls = this.selected[4].split(' / ');
              }
              console.log('countryName',this.countryName)            
            } else 
            console.warn('showselected this.selected is null')
            
        } else {
            console.warn('showselected countryDataDesc is null');
        }
//        console.log(this.selected)
    }

    attached() {
        console.log('attached')

this.task = PLATFORM.taskQueue.queueTask(() => {
    // Task to be executed after the delay
    console.log('task delayed 100ms');
  }, { delay: 100 });
  

        Chart.register(ChoroplethController, GeoFeature, ProjectionScale, ColorScale, ...registerables);
        Promise.all([
            fetch(this.countriessrc).then((res) => res.json()),
            fetch(this.datasrc).then((res) => res.text()), // Fetch the CSV file
        ]).then(([topoData, csvData]) => {
            let that = this;
            const countries = topojson.feature(topoData, topoData.objects.countries).features;
            // Parse the CSV
            const parsedCSV = this.parseCSV(csvData);
            // Create a lookup for ISO country codes to project status (number)
            let countryDataMap = {}
            this.countryDataDesc = {}
            for (let row of parsedCSV) {
                try {
                let countryid = whereAlpha2(row[1]);
                if (countryid) {
                    countryDataMap[countryid.numeric]=row[8];
                    this.countryDataDesc[countryid.numeric]=row;
                }
                } catch (exc) {
                    console.warn(exc);
                }
            }
            let myData = []
            for (let country of countries) {
                //let isocountry = whereNumeric(country.id)
                let myValue = 0;
                //if (isocountry) {
                  //let isocountryalpha2 = isocountry.alpha2
                  //let countryvalue = countryDataMap[isocountryalpha2]
                  //myValue = parseFloat(countryvalue);
                //} else {
                    //console.warn('cannot find alpha code for country with id'+ country.id+ ' name:' + country.properties.name);
                //}
                let rawValue = countryDataMap[country.id];
                if (rawValue) {
                    myValue = parseFloat(rawValue)
                } else console.warn('no data for country with id'+ country.id+ ' name:' + country.properties.name);
                myData.push({
                    feature: country,
                    value: myValue
                })
            }

            //console.log('countries',countries);
            
            const chart = new Chart(this.geochart.getContext("2d"), {
                type: 'choropleth',
                data: {
                    labels: countries.map((d) => d.id +':'+d.properties.name),
                    datasets: [{
                        label: 'Countries',
                        //data: countries.map((d) => ({ feature: d, value: Math.random() })),
                        data:myData,
                        outline: countries
                    }]
                },
                options: {
                    showOutline: true,
                    showGraticule: true,
                    plugins: {
                        legend: {
                            display: false
                        },

                    },
                    scales: {
                        projection: {
                            axis: 'x',
                            projection: 'equalEarth'
                        },
                        color: {
                            axis: 'x',
                            interpolate: 'oranges',
                            legend: {
                                position: 'bottom-right',
                                align: 'right',
                            }
                        }
                    },
                    onClick: (evt, elems) => {
                        let myitem = elems.map((elem) => elem.element.feature.id)
                        //console.log('selected item + this + that', myitem,this,that);
                        that.showSelected(myitem[0])
                    },
                }
            });
        });
    }

    detached(){
          // Cancel the task if needed
  this.task.cancel();

    }
}