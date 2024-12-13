---
title: sv-geochart
layout: home
nav_order: 1
---


# sv-geochart

Visualising geo chart.

![geochart image](img/geochart.png)

## Usage

<script> function generateURL() {
    const input = document.getElementById('userInput').value.trim();
    if(input) {
        const prefixURL = window.location.href+'geochart.html#';
        const fullURL = prefixURL + encodeURIComponent(input);
        const fullURLEurope = prefixURL + encodeURIComponent(input)+'&europe';
        document.getElementById('generatedURL').innerHTML = `<a href="${fullURL}" target="_blank">${fullURL}</a>`;
        document.getElementById('generatedEUURL').innerHTML = `<a href="${fullURL}" target="_blank">${fullURLEurope}</a>`;
    } else {
        document.getElementById('generatedURL').innerHTML = 'Please enter a value.';
    }
}
</script>

* Basic link: [geochart](geochart.html)
* give url of your data:<input type="text" id="userInput" placeholder="Enter your value" /> <button onclick="generateURL()">Generate URL</button> 
   * and use/share the following to visualise it in world map: <span id="generatedURL"></span>
   * and use/share the following to visualise it in Europe map: <span id="generatedEUURL"></span>

## Hosting web component in HTML or web app

Syntax: `<sv-geochart datasrc='' countriessrc='' continent=''></sv-geochart>` 

Attributes:
* `datasrc` url of data to be visualised in the geochart. CSV data are expected, country per row. Default value `g/National_Initiatives_Figure_Data.csv`
* `countriessrc` url of map coordinates to be visualised, e.g. map of countries. Default value `g/countries-50m.json` 
* `continent` continent to be focused during view. Default value `world` 
