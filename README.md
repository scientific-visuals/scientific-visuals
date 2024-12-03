# scientific-visuals
Web components for reusable scientific visualisation.

## Usage

Directly in your HTML. 
1. download the JS script `sv-components.es.js` or use some JS cache.
2. load the JS script module with web components implementation:
   ```HTML
   <script src="sv-components.es.js" type="module"></script>
   ```
3. use the webcomponents inside HTML `<body>`, e.g.:
   ```HTML
   <sv-geochart src="mydata.csv"></sv-geochart>
   <p><i> Figure 1. Map of findings </i>  </p>
   ```

The browser nows howto interpret the new tags defined as webcomponents and will render it.

## Web components details

### Geochart
Syntax: `<sv-geochart src="https://-unique-url-to-csv-data"></sv-geochart>`

Utilizes [Chart.js Geo](https://github.com/sgratzl/chartjs-chart-geo) to show data in geographical context.

Use menu to change default projection or to focus on particular continent.
