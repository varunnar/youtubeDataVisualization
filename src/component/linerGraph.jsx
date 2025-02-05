import React, {useEffect, useRef} from "react";
import * as d3 from "d3";

function LineGraph({baseData, allBodyColors, darkerBodyColors}) {


    const svgRef = useRef();
    let width = 1000;
    let height = 400;

    useEffect(() => {

        if (!baseData || baseData.length === 0) return;

        const catogory_data = lineGraphData(baseData);


        let reversed_cat = catogory_data
        let final_version = catogory_data[0];
        let categories = Object.keys(final_version).filter((key) => key !== "index");
        let maxValue = Math.max(...categories.map((key) => final_version[key]));

        console.log("max value", maxValue);

        //const svg = d3.select(DOM.svg(width, height))

        let xScale = d3.scaleLinear()
            .domain([0, catogory_data.length-1])
            .range([0, width-50]);

        let yScale = d3.scaleLinear()
            .domain([0, maxValue+5])
            .range([height, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(categories)
            .range(darkerBodyColors)

        const bodyScale = d3.scaleOrdinal()
            .domain(categories)
            .range(allBodyColors)

        
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg
            .attr("viewBox", [-20, 0, width+150, height*1.1])
            .attr("style", "width: 100%; height: auto; font: 10px; sans-serif;");

        const svgGroup = svg.append("g");


        const lineGenerator = d3.line()
        .x(d => xScale(d.index))
        .y((d, i, nodes) => yScale(d.count))
        .curve(d3.curveMonotoneX);

        const areaGenerator = d3.area()
        .x(d => xScale(d.index))
        .y0(height) // The bottom of the area (aligned with the x-axis)
        .y1(d => yScale(d.count)) // The top of the area (aligned with the line)
        .curve(d3.curveMonotoneX); // Use the same curve as the line


        categories.forEach(cat => {

            const data = catogory_data.map(d => ({ index: d.index, count: d[cat] || 0 }));

            const line_path = svgGroup.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("class", `line ${cat}`)
            .attr("stroke", colorScale(cat))
            .attr("stroke-width", 2)
            .attr("d", lineGenerator);
        

            // Append the filled area
            const fill_area = svgGroup.append("path")
            .datum(data)
            .attr("class", `area ${cat}`)
            .attr("fill", bodyScale(cat)) // Match the fill color to the line color
            .attr("opacity", .1) // Add transparency to the fill for better visibility
            .attr("d", areaGenerator);

            const content = [line_path, fill_area];

            // content.forEach(path => {
            //   path.on('mouseover', function() {
                
            //   })
            // });


            content.forEach(path => {
            path.on("mouseover", () => {
                // Dim all lines and areas except the hovered one
                svgGroup.selectAll("path")
                .attr("opacity", 0.1); // Dim everything else
        
                line_path.attr("opacity", 1); // Keep the hovered line bright
                fill_area.attr("opacity", 0.2); // Keep the hovered area visible
            })
            .on("mouseout", () => {
                // Reset all lines and areas to default state
                svgGroup.selectAll("path")
                .attr("opacity", (d, i, nodes) => {
                    const isArea = nodes[i].classList.contains(`area`);
                    return isArea ? 0.2 : 1; // Reset opacity based on class
                });
            });
            });
            
        });


            // Add axes
        const xAxis = d3.axisBottom(xScale).ticks(catogory_data.length - 1);
        const yAxis = d3.axisLeft(yScale).ticks(10);

        svgGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

            svgGroup.append("g")
            .call(yAxis);

        // Add legend
        const legend = svgGroup.append("g")
        .attr("transform", `translate(${width + 30}, 40)`);

        categories.forEach((cat, i) => {

        const lastDataPoint = catogory_data[0]; // Get the last entry
        const finalIndex = lastDataPoint.index; // The final x value
        const finalCount = lastDataPoint[cat] || 0; // The final y value

        svgGroup.append("circle")
            .attr("cx", xScale(finalIndex)) // Slightly offset to the right of the line
            .attr("cy", yScale(finalCount)) // Slightly above the point
            .attr("fill", colorScale(cat)) // Match the line color
            .attr("r", 3)

            svgGroup.append("text")
            .attr("x", xScale(finalIndex) + 5) // Slightly offset to the right of the line
            .attr("y", yScale(finalCount)) // Slightly above the point
            .attr("fill", colorScale(cat)) // Match the line color
            .attr("font-size", "12px")
            .text(finalCount); // Display the final value

            
        // Add colored circle
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", i * 20) // Space out items
            .attr("r", 5)
            .attr("fill", colorScale(cat));

        // Add text label
        legend.append("text")
            .attr("x", 10)
            .attr("y", i * 20)
            .text(cat)
            .style("font-size", "12px")
            .attr("style", "font: 12px color: #FFFFFF;")
            .attr("alignment-baseline", "middle");
        });

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

  // Add text value at the end of each l


    }, [baseData])



    function lineGraphData(liked_videos_with_channel) {
        const category_set = {};
        const array_of_changes = [];
        const switched_like_videos = liked_videos_with_channel.reverse();

        switched_like_videos.forEach((item, index) => {
            let value = item;

            if (!category_set[value.category]) {
            category_set[value.category] = 1;
            } else {
            category_set[value.category] += 1;
            }

            const snapshot = { index };

            for (const key in category_set) {
            snapshot[key] = category_set[key];
            }
            array_of_changes.push(snapshot);
        });

        array_of_changes.reverse();

        // Sort the keys of each object based on the final snapshot values
        const finalSnapshot = array_of_changes[0];
        const sortedKeys = Object.keys(finalSnapshot)
            .filter((key) => key !== "index") // Exclude 'index' from sorting
            .sort((a, b) => finalSnapshot[b] - finalSnapshot[a]); // Sort by descending values

        // Reorder keys in each object
        return array_of_changes.map((snapshot) => {
            const sortedSnapshot = { index: snapshot.index };
            sortedKeys.forEach((key) => {
            if (key in snapshot) sortedSnapshot[key] = snapshot[key];
            });
            return sortedSnapshot;
        });
    }

    return <svg ref={svgRef}></svg>;
}

export default LineGraph;