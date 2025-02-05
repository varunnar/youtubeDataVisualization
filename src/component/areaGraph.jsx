import React, {useEffect, useRef} from "react";
import * as d3 from "d3";

function AreaGraph({ baseData, allBodyColors }) {
    const width = 1154;
    const height = 1154;

    const svgRef = useRef();

    const generateUid = (() => {
        let counter = 0;
        return (prefix) => `${prefix}-${counter++}`;
      })();
  
    // Specify the color scale.
    useEffect(() => {
        if (!baseData || baseData.length === 0) return;

        const liked_video_by_channel = setData(baseData);

         d3.select(svgRef.current).selectAll("*").remove();

        const color = d3.scaleOrdinal(liked_video_by_channel.children.map(d => d.value), allBodyColors);

        // console.log("COLOR SCHEME ", Array.from(new Set(liked_video_by_channel.children.map(d => d.value))));
        // const color = d3.scaleOrdinal()
        // .domain(Array.from(new Set(liked_video_by_channel.children.map(d => d.value)))) // Set of all unique values
        // .range(d3.schemeTableau10);
        
        // Compute the layout.
        const root = d3.treemap()
            .tile(d3.treemapBinary) // e.g., d3.treemapSquarify
            .size([width, height])
            .padding(1)
            .round(true)
        (d3.hierarchy(liked_video_by_channel)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

        // Create the SVG container.
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("style", "max-width: 100%; height: auto;");

        const svgGroup = svg.append("g");

        // Add a cell for each leaf of the hierarchy.
        const leaf = svgGroup.selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        // Append a tooltip.
        const format = d3.format(",d");
        leaf.append("title")
            .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(".")}\n${format(d.value)}`);

        // Append a color rectangle. 
        leaf.append("rect")
            .attr("id", d => (d.leafUid = generateUid("leaf")))
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.value); })
            .attr("fill-opacity", 0.6)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);

        // Append a clipPath to ensure text does not overflow.
        leaf.append("clipPath")
            .attr("id", d => (d.clipUid = generateUid("clip")))
            .append("use")
            .attr("xlink:href", d => d.leafUid.href);

        // Append multiline text. The last line shows the value and has a specific formatting.
        leaf.append("text")
            .attr("clip-path", d => d.clipUid)
            .selectAll("tspan")
            .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
            .join("tspan")
            .attr("x", 3)     
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .text(d => d);
        
        const zoom = d3.zoom()
            .scaleExtent([1, 8]) // Zoom levels from 1x to 8x
            .translateExtent([[0, 0], [width, height]]) // Constrain panning
            .on("zoom", (event) => {
                svgGroup.attr("transform", event.transform); // Apply zoom and pan transformations

                const zoom_val = event.transform.k; // Get the current zoom level

                // // Scale the bubble sizes based on zoom level
                // node.selectAll("circle")
                //   .attr("r", d => d.r * zoom_val);
            });

        // Apply zoom to the SVG
        svg.call(zoom);

    }, [baseData]);


    function setData(liked_videos_with_channel) {
        let liked_channels = {};
        for (const video of liked_videos_with_channel) {
          if (!liked_channels[video.channel]) {
            liked_channels[video.channel] = 1;
          } else {
            liked_channels[video.channel] = liked_channels[video.channel] + 1;
          }
        }
        let final_object = {
          name: "liked_channel",
          children: []
        };
      
        for (const val of Object.keys(liked_channels)) {
          final_object.children.push({
            name: val,
            value: liked_channels[val]
          })
        }

        return final_object;
    }

    return (
        <svg ref={svgRef}></svg>
    )
}

export default AreaGraph;