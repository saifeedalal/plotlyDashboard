/*
@author - Saifee Dalal
@Name - buildGauge
@Input - Washing Frequency
@Output - None
@Description - This function will build a gauge chart to represent washing frequency for a specific sample
*/
function buildGauge(frequency){

  washing_freq = frequency;
  console.log(`Washing Frequency: ${washing_freq}`);

  //Multiplying frequency by 20 as there are 9 slots to cover 180 degrees. So each slot should take 20 degress.
  var level = washing_freq*20;

  // Trig to calc meter point
  var degrees = 180- level,
      radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
      x: [0], y:[0],
      marker: {size: 28, color:'black'},
      showlegend: false,
      name: 'Scrubs',
      text: washing_freq,
      hoverinfo: 'text+name'
      },
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(0, 30, 0, .5)', 'rgba(7, 60, 22, .5)',
                      'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                      'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                      'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                      'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
  }];

  var layout = {
      shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
      color: 'black'
      }
      }],
      title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
      height: 600,
      width: 600,
      xaxis: {zeroline:false, showticklabels:false,
           showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
           showgrid: false, range: [-1, 1]},
      };

  Plotly.newPlot('gauge', data, layout);
}

/*
@author - Saifee Dalal
@Name - buildMetadata
@Input - sample
@Output - None
@Description - This function will display metadata for a specific sample
*/
function buildMetadata(sample) {

  console.log("buildMetadata: Begin");

  // Use d3 to select the panel with id of `#sample-metadata`
  var meta_section = d3.select("#sample-metadata");
    
  // Use `.html("") to clear any existing metadata
  meta_section.html("");

  console.log(`Selection: ${sample}`);

  d3.json(`metadata/${sample}`).then(function(metadata) {
    console.log(metadata);

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(metadata).forEach(function([key, value]){
      
      console.log(`Key: ${key} and Value ${value}`);

      // Hint: Inside the loop, you will need to use d3 to append new
      // tags for each key-value in the metadata.
      if (key != "WFREQ")
      meta_section.append("h6").html(`<b>${key} : ${value}</b>`)

    });

    // BONUS: Build the Gauge Chart    
     buildGauge(metadata.WFREQ);
  });
  
    console.log("buildMetadata: End");
}

/*
@author - Saifee Dalal
@Name - buildCharts
@Input - sample
@Output - None
@Description - This function will display pie and bubble chart for a specific sample
*/
function buildCharts(sample) {

  console.log("buildCharts: Begin");
  console.log("Sample Value:" ,sample);
  // @TODO: Use `d3.json` to fetch the sample data for the plots
  
  d3.json(`samples/${sample}`).then(function(inpData) {
    
    console.log("Sample Value:" ,sample);
    console.log("otu_id:" ,inpData.otu_ids);
    console.log("otu_labels:" ,inpData.otu_labels);
    console.log("sample_values:" ,inpData.sample_values);

    var pie_trace = {
      values: inpData.sample_values.slice(0,10),
      labels: inpData.otu_ids.slice(0,10),
      hovertext: inpData.otu_labels.slice(0,10),
      hoverinfo: "hovertext",
      type: 'pie'
    };
    
    Plotly.newPlot("pie", [pie_trace]);
    
    var bubble_trace = {
      x: inpData.otu_ids,
      y: inpData.sample_values,
      text: inpData.otu_labels,
      mode: 'markers',
      marker: {
        size: inpData.sample_values,
        color: inpData.otu_ids
      }
    };
    
    
    var layout = {
      title: 'Bubble Plot',
      showlegend: false,
      xaxis: {
        title: "otu_id"
      },
      yaxis: {
        title: "Sample values"
      },
      height: 600,
      width: 1200
    };
    
    Plotly.newPlot('bubble', [bubble_trace], layout);
  });

  console.log("buildCharts: End");
}

/*
@author - Saifee Dalal
@Name - init
@Input - None
@Output - None
@Description - This function is called when the page is loaded for the first time
*/
function init() {
    
  console.log(`init: Begin`);
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  console.log(`Selector : ${selector}`);
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    console.log(`Populating selector`);
    sampleNames.forEach((sample) => {
      console.log(`Selector Value: ${sample}`);
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    console.log(`After Populating selector`);
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log(`First Sample: ${firstSample}`);

    buildCharts(firstSample);
    buildMetadata(firstSample);

  });

  console.log("init: End");
}

/*
@author - Saifee Dalal
@Name - optionChanged
@Input - sample
@Output - None
@Description - This function is called when user selects a new sample from the dropdown
*/
function optionChanged(newSample) {

  console.log("optionChanged: Begin");
  // d3.event.preventDefault();
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);

  console.log("optionChanged: End");
}

// Initialize the dashboard
console.log("Begin");
init();
console.log("End");
