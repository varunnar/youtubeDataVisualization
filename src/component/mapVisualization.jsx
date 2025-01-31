import React, {useEffect, useState, useRef} from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

function MapVisualization({baseData}) {

    const width = 2000;
    const marginTop = 46;
    const height = width * 0.6 + marginTop;

    const svgRef = useRef();

    const [world, setWorld] = useState([]);
    const [country_to_code, setCountryToCode] = useState([]);

    useEffect(() => {
        d3.json("/data/countries-50m.json").then(data => {
            console.log("Fetched Countries:", data);
            setWorld(data);
        });
    }, []);

    useEffect(() => {
        d3.json("/data/country_to_code.json").then(data => {
            console.log("Fetched Country code pairings", data);
            setCountryToCode(data);
        });
    }, []);

    useEffect(() => {

        if (!baseData || baseData.length === 0) return;

        const data = brandData(baseData);
        

        console.log("world countries", world);
        const countries = topojson.feature(world, world.objects.countries);
        const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
        console.log("countries", countries);

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;")
        
        const svgGroup = svg.append("g");

        const projection = d3.geoNaturalEarth1().fitExtent([[0, 0], [width, height]], {type: "Sphere"});
        const path = d3.geoPath(projection);


        let zoom_val = 1;
        //sphere around the graph
        svgGroup.append("path")
            .datum({type: "Sphere"})
            .attr("fill", "white")
            .attr("stroke", "currentColor")
            .attr("d", path);

        // Add a path for each country and color it according te this data.
        svgGroup.append("g")
            .selectAll("path")
            .data(countries.features)
            .join("path")
            .attr("fill", "#000000")
            .attr("d", path)

            
        svgGroup.append("path")
            .datum(borders)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("d", path);


        const creatorsByCountry = d3.group(data, d => d.country);

        let centroids = {};
        countries.features.forEach(feature => {
            centroids[feature.properties.name] = d3.geoCentroid(feature);
        });

        let projectedCentroids = {};
        for (const [country, coords] of Object.entries(centroids)) {
            projectedCentroids[country] = projection(coords);
        }

        //console.log("projectedCentroid", projectedCentroids)

        // Add packs
        //const pack = d3.pack().size([width/2, height/2]).padding(2); // Adjust size for country circles

        creatorsByCountry.forEach((creators, country) => {
            //console.log("creator information", country, " creators ", creators);

            const maxSize = Math.min(width / 2, height / 2); // Max size constraint
            //const dynamicPackSize = creators.length * 10; // Scale based on number of creators (10px per creator, minimum 100px)
            const dynamicPackSize = Math.max(creators.length/data.length * 300, 80);
            const pack = d3.pack().size([dynamicPackSize, dynamicPackSize]).padding(2);
            
            const root = d3.hierarchy({ children: creators }).sum(() => 1);
            const packed = pack(root);

            let country_name = country_to_code.find((v) => v.code == country).name;
            if (country_name == "United States") {
            country_name = "United States of America";
            }
        
            const [x, y] = projectedCentroids[country_name] || [0, 0];

            const packRadius = packed.r; // Scale the pack radius slightly to fit the pack

            //Larger Circle
            svgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", packRadius) // Radius of the pack circle
            .attr("fill", "#FF0033")
            .attr("opacity", "0.8")
            .attr("stroke-width", 2)
        });


        const imageGroup = svgGroup.append("g").attr("class", "image-group");
        const textGroup = svgGroup.append("g").attr("class", "text-group");


        textContent()
        // Add zoom behavior
        const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Zoom levels from 1x to 8x
        .translateExtent([[0, 0], [width, height]]) // Constrain panning
        .on("zoom", (event) => {
            svgGroup.attr("transform", event.transform);
            zoom_val = event.transform.k;// Apply zoom and pan transformations

            // Clear previous content (images and text) before redrawing based on zoom level
            imageGroup.selectAll("*").remove();
            textGroup.selectAll("*").remove();

            // Perform actions based on zoom level
            if (zoom_val < 1.5) {
            // When zoom is less than 2, show creator count text
            textContent();
            } else {
            singleImages();
            }
        });


        function textContent() {
            creatorsByCountry.forEach((creators, country) => {
                const maxSize = Math.min(width / 2, height / 2);
                const dynamicPackSize = Math.max(creators.length / data.length * 300, 80);
                const border = dynamicPackSize/2;
                const textSize = (dynamicPackSize - border)/2;
                const pack = d3.pack().size([dynamicPackSize, dynamicPackSize]).padding(2);

                const root = d3.hierarchy({ children: creators }).sum(() => 1);
                const packed = pack(root);

                let country_name = country_to_code.find((v) => v.code == country).name;
                if (country_name == "United States") {
                country_name = "United States of America";
                }

                const [x, y] = projectedCentroids[country_name] || [0, 0];
                const packRadius = packed.r;

                // Add text showing creator count when zoomed out (and remove images)
                const creator_num = creators.length;
                textGroup.append("text")
                .attr("class", "creator-text")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", border/3) // Adjust vertical position
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("font-size", `${textSize}px`)
                .style("font-weight", "bold")
                .text(creator_num);


                textGroup.append("text")
                .attr("class", "creator-text")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", -border/4) // Adjust vertical position
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .style("font-size", `${textSize}px`)
                .style("font-weight", "bold")
                .text(country);
            });
        }

        function singleImages() {
        // When zoom is greater than or equal to 2, show images and circles (and remove text)
            creatorsByCountry.forEach((creators, country) => {
                const maxSize = Math.min(width / 2, height / 2);
                const dynamicPackSize = Math.max(creators.length / data.length * 300, 80);
                const pack = d3.pack().size([dynamicPackSize, dynamicPackSize]).padding(2);

                const root = d3.hierarchy({ children: creators }).sum(() => 1);
                const packed = pack(root);

                let country_name = country_to_code.find((v) => v.code == country).name;
                if (country_name == "United States") {
                country_name = "United States of America";
                }

                const [x, y] = projectedCentroids[country_name] || [0, 0];
                const packRadius = packed.r;

                const group = imageGroup.append("g")
                .attr("transform", `translate(${x - packRadius}, ${y - packRadius})`);

                // Create patterns for each creator circle (images)
                group.selectAll("defs")
                .data(packed.leaves())
                .join("defs")
                .append("pattern")
                    .attr("id", d => `creator-${d.data.creator}`)
                    .attr("width", 1)
                    .attr("height", 1)
                    .attr("patternUnits", "objectBoundingBox")
                    .append("image")
                    .attr("xlink:href", d => d.data.image)
                    .attr("width", 20)
                    .attr("height", 20);

                // Add circles and use patterns as fills
                group.selectAll("circle")
                .data(packed.leaves())
                .join("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 10)
                    .attr("fill", d => `url(#creator-${d.data.creator})`)
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .append("title")
                    .text(d => d.data.name);
            });
        }
        
        svg.call(zoom);

    }, [baseData]);

    function brandData(youtube) {
        let new_obj = [];
      
        for (const youtuber of youtube) {
          if (youtuber && youtuber.branding && youtuber.branding && youtuber.branding.country) {
            let country = youtuber.branding.country;
            new_obj.push({
              "creator": youtuber.branding.title,
              "country":  youtuber.branding.country,
              "image": youtuber.icon.high.url
            });
          }
        }
      
        return new_obj;
      }


    return (
        <svg ref={svgRef}></svg>
    )
}

export default MapVisualization;