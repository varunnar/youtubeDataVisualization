import React, {useEffect, useRef} from "react";
import * as d3 from "d3";

function ChordGraph( {baseData} ) {
    const width = 1000;
    const radius = width / 2;
    const inner_radius = width-50;

    const svgRef = useRef();

    useEffect(()=>{

        if (!baseData || baseData.length === 0) return;

        const chord_initial_data = chord_data(baseData);

        const data = chord_data_complete(chord_initial_data);

        const tree = d3.cluster().size([2 * Math.PI, radius - 100]); //width is 2pi and height is radius size (in radial terms )
        /*
        The .size() method specifies the size of the layout in polar coordinates, not Cartesian coordinates.
        The two arguments [width, height] define the radial range:
        Width: Specifies the angular range in radians (0 to 2π for a full circle).
        Height: Specifies the radial distance from the center (the root node).
        */

        const root = tree(bilink(d3.hierarchy(data).sort((a,b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name)))); 

        // const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 50));

        const accessibleColors = [
          "#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666",
          "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5",
          "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f", "#ff7f00", "#6a3d9a", "#b15928", "#1f78b4",
          "#33a02c", "#a6cee3", "#b2df8a", "#fb9a99", "#fdbf6f", "#cab2d6", "#ffff99", "#b3b3b3",
          "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf",
          "#999999", "#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494",
          "#b3b3b3", "#abdda4"
        ];
        const color = d3.scaleOrdinal(accessibleColors);

        d3.select(svgRef.current).selectAll("*").remove();

        // for (const item of root.descendants()) {
        //   console.log("rotate stuff ", item.height, "level ", item.x);
        // }
        // return root;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", width)
            .attr("viewBox", [-width / 2 - 150, -width / 2 - 150, width + 300, width + 300])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        const defs = svg.append("defs");

        const zoomGroup = svg.append("g")

        // Create gradients for each link
        root.leaves().forEach((leaf, i) => {
          //console.log("leaf", leaf);
          leaf.outgoing.forEach(([source, target]) => {
            const gradientId = `gradient-${i}-${source.parent.data.name}-${target.parent.data.name}`;
            const gradient = defs.append("linearGradient")
              .attr("id", gradientId)
              .attr("gradientUnits", "userSpaceOnUse")
              .attr("x1", source.x)
              .attr("y1", source.y)
              .attr("x2", target.x)
              .attr("y2", target.y);

            
            console.log("gradient setup ", gradientId);

            gradient.append("stop")
              .attr("offset", "0%")
              .attr("stop-color", color(source.parent.data.name));

            gradient.append("stop")
              .attr("offset", "25%")
              .attr("stop-color", d3.interpolateRgb(color(source.parent.data.name), color(target.parent.data.name))(0.25));

            gradient.append("stop")
              .attr("offset", "75%")
              .attr("stop-color", d3.interpolateRgb(color(source.parent.data.name), color(target.parent.data.name))(0.75));

            gradient.append("stop")
              .attr("offset", "100%")
              .attr("stop-color", color(target.parent.data.name));
          });
        });

        zoomGroup.append("circle")
            .attr("r", radius - 100) // Adjust to match the size of your nodes
            .attr("fill", "none") // Transparent fill
            .attr("stroke", "#FF0033") // Border color
            .attr("stroke-width", 5);
        console.log("root,", root)

        const arc = d3.arc()
          .innerRadius(radius - 100)
          .outerRadius(radius - 95)
          .startAngle(d => d.x0)
          .endAngle(d => d.x1);

        zoomGroup.append("g")
          .selectAll()
          .data(root.children)
          .join("path")
          .attr("d", arc)
          .attr("fill", d => color(d.data.name));

        const node = zoomGroup.append("g")
            .selectAll()
            .data(root.descendants())
            .join("g")

            node.filter(d => d.height == 0)
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
            .append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d.x < Math.PI ? 8 : -8)
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                .text(d => d.data.name)
                .each(function(d) { d.text = this; })
                .on("mouseover", overed)
                .on("mouseout", outed)
                .call(text => text.append("title").text(d => `${id(d)}
        ${d.outgoing.length} outgoing
        ${d.incoming.length} incoming`));

            node.filter(d=>d.height == 1)
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y+radius/2+80},0)`)
            .append("text")
                .attr("x", d => d.x < Math.PI ? 20 : -20)
                .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
                .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
                .attr("style", "font-weight: bold; font-size: 12px; ")
                .text(d => d.data.name)
                .each(function(d) { d.text = this; })
                .raise();

        const line = d3.lineRadial()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x);


        const link = zoomGroup.append("g")
            .attr("fill", "none")
            .attr("stroke-width", "3")
            .selectAll()
            .data(root.leaves().flatMap(leaf => leaf.outgoing))
            // .data(root.descendants().filter(d => d.depth === 2).outgoing)
            .join("path")
            .style("mix-blend-mode", null)
            .attr("d", ([i, o]) => line(i.path(o)))
          //   .attr("stroke", ([source, target]) => {
          //     const gradientId = `gradient-${root.leaves().indexOf(source)}-${source.parent.data.name}-${target.parent.data.name}`;
          //     //${root.leaves().indexOf(source)}-
          //     return `url(#${gradientId})`;
          // })
            .attr("stroke", "#fff")
            .each(function(d) { d.path = this; });


        function overed(event, d) {
            link.style("mix-blend-mode", null); //Set blend mode to null to not select too much
            d3.select(this).attr("font-weight", "bold"); //highlight on hover mode and make text bold
            d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", "#DD0000").attr("stroke-width", "10").raise(); //high light links and bring them to the front
            d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", "red").attr("font-weight", "bold"); //move text to the front and make them that color
            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", "#DD0000").attr("stroke-width", "10").raise(); //Do the same with outgoing nodes
            d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", "red").attr("font-weight", "bold"); //do the same with outgoing nodes
        }

        function outed(event, d) {
            link.style("mix-blend-mode", null); //Set blend mode for links
            d3.select(this).attr("font-weight", null); //remove any bolding style
            d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", "#FFF").attr("stroke-width", "3"); //remove stroke colors on incoming
            d3.selectAll(d.incoming.map(([d]) => d.text)).attr("font-weight", null).attr("fill", "white"); //remove text bold incoming
            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", "#FFF").attr("stroke-width", "3"); //remove stroke coloring for outgoing
            d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("font-weight", null).attr("fill", "white"); //remove text bold outgoing
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 8]) // Zoom levels from 1x to 8x
            .translateExtent([[-width / 2-150, -width / 2-150], [width / 2+150, width / 2+150]]) // Constrain panning
            .on("zoom", (event) => {
                zoomGroup.attr("transform", event.transform); // Apply zoom and pan transformations

            const zoom_val = event.transform.k; // Get the current zoom level

            // // Scale the bubble sizes based on zoom level
            // node.selectAll("circle")
            //   .attr("r", d => d.r * zoom_val);
            });

        // Apply zoom to the SVG
        svg.call(zoom);
    }, [baseData]);

    function bilink(root) {
        // Replace spaces in names with underscores for consistent matching
        
        // Create a map of nodes based on sanitized identifiers
        const map = new Map(root.leaves().map(d => [id(d), d]));
        //console.log("map", map); 
      
        // Initialize incoming and outgoing arrays for each node
        for (const d of root.leaves()) {
          d.incoming = [];
          d.outgoing = d.data.imports.map(i => {
            // console.log("i value", i);
            // console.log("mapping", map.get(i))
            return [d, map.get(i)]
          });
        }
        // Establish incoming links
        for (const d of root.leaves()) {
          for (const o of d.outgoing) {
            // if (o[1]) {
            //   console.log("success found", o[1]);
            //  o[1].incoming.push(o); 
            // } else {
            //   console.log("unable to find value for", o);
            // }
            o[1].incoming.push(o);
          }
        }
      
        return root;
    }

    function id(node) {
        return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`.toLowerCase(0);
    }

    function top_tags(youtuber_tags) {
        let new_map = new Map();
        for (const tag of youtuber_tags) {
          if (new_map.has(tag)) {
            new_map.set(tag, new_map.get(tag)+1);
          } else {
            new_map.set(tag, 1);
          }
        }
        const sortedEntries = Array.from(new_map.entries()).sort((a, b) => b[1] - a[1]);
    
        // Step 2: Take the top 10 most common items
        const top10 = sortedEntries.slice(0, 5);
        const children = [];
      
        // Step 3: Extract only the keys (if you need just the items)
        const top10Keys = top10.map(([key]) => key);
        return top10Keys;
    }

    function chord_data(youtube) {
        let return_obj = [];
        for (const youtuber of youtube) {
            //const youtuber = youtube[i];
            let youtuber_updated = {}
            let new_tag_arr = [];
            if (youtuber.tags.length > 0) {
              let top_10 = top_tags(youtuber.tags)
              youtuber_updated = {
                "name": youtuber.title,
                "children": top_10
              }
              return_obj.push(youtuber_updated);
            }
        }
        return return_obj;
    }

    function chord_data_complete(chord_data) {
        const return_data = {
        name: "root",
        children: chord_data.map(channel => ({
          name: channel.name,
          children: channel.children.map(tag => ({
            name: `${tag}`,
            value: 1,
            imports: chord_data
              .filter(c => c.name !== channel.name) // Exclude the current channel
              .flatMap(c => 
                c.children
                  .filter(t => t === tag) // Find matching tags in other channels
                  .map(t => `root.${c.name}.${t}`.toLowerCase()) // Create unique identifiers for targets
                )
            }))
          }))
        };
        return return_data;
    }

    return <svg ref={svgRef}></svg>;
}

export default ChordGraph;