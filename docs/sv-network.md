---
title: sv-network
layout: home
nav_order: 1
---


# sv-geochart

Visualising network graph.
![network graph image](img/networkgraph.png)


## Usage

<script> function generateNetworkURL() {
    const input = document.getElementById('userNetworkInput').value.trim();
    if(input) {
        const prefixURL = window.location.href+'networkgraph.html#';
        const fullURL = prefixURL + encodeURIComponent(input);
        document.getElementById('generatedNetworkURL').innerHTML = `<a href="${fullURL}" target="_blank">${fullURL}</a>`;
        
    } else {
        document.getElementById('generatedNetworkURL').innerHTML = 'Please enter a value.';
    }
}
</script>
* Basic link: [networkgraph](networkgraph.html)
* give url of your data:<input type="text" id="userNetworkInput" placeholder="Enter your value" /> <button onclick="generateNetworkURL()">Generate URL</button> 
   * and use/share the following link to visualise it: <span id="generatedNetworkURL"></span>

## Hosting web component in HTML or web app

Syntax: `<sv-network datasrc=''></sv-geochart>` 

Attributes:
* `datasrc` url of data to be visualised in the geochart. `TODO`
