import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function BubbleChart({ baseData }) {
  const svgRef = useRef();
  const width = 1500;
  const height = width;
  const margin = 1;
  const padding = 1;


  useEffect(() => {

    if (!baseData || baseData.length === 0) return;


    let data = buildTagData(baseData);

    console.log("data found", data);
    const tag = d => d[0];
    const value = d => d[1];

    d3.select(svgRef.current).selectAll("*").remove();

    const format = d3.format(",d");

    const color_val = (d) => {
      if (d[1] > 15) {
        return {
          body: "#660066",
          border: "#660066",
          text: "#FFFFFF"
        } 
        //return 3;
      }
      else if (d[1] > 10) {
        return {
          body: "#FF0033",
          border: "#FF0033",
          text: "#000000"
        }
        //return 2;
      } else if (d[1] > 5) {
        return {
          body: "#212121",
          border: "#212121",
          text: "#FFFFFF"
        }
        //return 1;
      } else if (d[1]>1) {
        return {
          body: "#808080",
          border: "#808080",
          text: "#000000"
        }
        //return 0;
      } else {
        return {
          body: "#FFFFFF",
          border: "#000000",
          text: "#000000"
        }
      }
    }

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    //sets the pack attribute
    const pack = d3.pack().size([width-margin*2, height-margin*2]).padding(padding)

    const root = pack(d3.hierarchy({children: data})
        .sum(d => d[1])); //determines size of circle

    //Parent container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-margin, -margin, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 20px sans-serif; color: white;")
      .attr("text-anchor", "middle")


    var hover_div = d3.select("body").append("div")
      .attr("style", "position: absolute; text-align: center; background: #FFFFFF; color: #313639;")
      .style("opacity", 0);


    const nodeGroup = svg.append("g")
    
    const node = nodeGroup.append("g")
      .selectAll()
      .data(root.leaves())
      .join("g").attr("transform", d => `translate(${d.x},${d.y})`)
      .on(' ', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85');
        hover_div.transition()
          .duration(50)
          .style("opacity", 1);
        hover_div.html(d.data[1])
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
      })
      .on('mouseout', function (d, i) {
          d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
          hover_div.transition()
            .duration(50)
            .style("opacity", 0);
      });

    node.append("circle")
      .attr("fill-opacity", 0.7)
      .attr("fill", d => color_val(d.data).body)
      .attr("stroke",d => color_val(d.data).border)
      .attr("r", d => d.r);

    node.append("title")
      .text(d => d.data[0])

    const text = node.append("text").attr("clip-path", d => `circle(${d.r})`); //set clip path to center of text

    const fitTextToCircle = (selection, diameter) => {
    selection.each(function (d) {
      const text = d3.select(this);
      let fontSize = diameter / 8; // Start with a font size proportional to the circle diameter
      text.style("font-size", `${fontSize}px`);

      // Reduce font size until the text fits within the circle
      while (text.node().getBBox().width > diameter && fontSize > 6) {
        fontSize -= 1; // Decrease font size
        text.style("font-size", `${fontSize}px`);
      }

      // Clear any previous tspans
      text.selectAll("tspan").remove();

      // Add text content with final font size
      text.append("tspan")
        .attr("x", 0)
        .attr("y", -fontSize / 3) // Center vertically
        .text(tag(d.data)) // Tag text
        .attr("fill", d => color_val(d.data).text);

      // Add the value as a second line
      text.append("tspan")
        .attr("x", 0)
        .attr("y", fontSize) // Slightly below the first line
        .attr("fill-opacity", 0.7)
        .text(format(d.data[1])) // Value text
        .attr("fill", d => color_val(d.data).text);
    });
};


// Apply it to your `text` selection
text.each(function (d) {
  const circleDiameter = 2 * d.r; // Diameter of the circle
  fitTextToCircle(d3.select(this), circleDiameter);
});

const zoom = d3.zoom()
  .scaleExtent([1, 8]) // Zoom levels from 1x to 8x
  .translateExtent([[0, 0], [width, height]]) // Constrain panning
  .on("zoom", (event) => {
    nodeGroup.attr("transform", event.transform); // Apply zoom and pan transformations

    const zoom_val = event.transform.k; // Get the current zoom level

    // // Scale the bubble sizes based on zoom level
    // node.selectAll("circle")
    //   .attr("r", d => d.r * zoom_val);
  });

// Apply zoom to the SVG
svg.call(zoom);
  }, [baseData]);

function buildTagData(youtube){
  let tag_output = {};
  for (const youtuber of youtube) {
    for (const tag of youtuber.tags) {
      if (tag_output[tag]) {
        tag_output[tag] += 1;
      } else {
        tag_output[tag] = 1;
      }  
    }   
  }
  let array_version = Object.entries(tag_output);
  let sorted = array_version.sort((a,b) => {
      if ( a[1] > b[1] ){
      return -1;
    }
    if ( a[1] < b[1] ){
      return 1;
    }
    return 0;
  })
  return sorted;
}

  

  
  //return Object.assign(svg.node(), {scales: {color}});




  return <svg ref={svgRef}></svg>;
}

export default BubbleChart;