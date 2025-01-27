import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`# D3 Work for Youtube Data`
)}

function _data(FileAttachment){return(
FileAttachment("youtube.json").json()
)}

function _youtube_prev(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _youtube(FileAttachment){return(
FileAttachment("creator_url@2.json").json()
)}

function _tags_data(youtube)
{
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


function _bubble_chart(d3,tags_data)
{
  const width = 1500;
  const height = width;
  const margin = 1;
  const padding = 1;
  const tag = d => d[0];
  const value = d => d[1];

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

  const root = pack(d3.hierarchy({children: tags_data})
      .sum(d => d[1])); //determines size of circle

  //Parent container
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    .attr("text-anchor", "middle")


  var hover_div = d3.select("body").append("div")
     .attr("style", "position: absolute; text-align: center; background: #FFFFFF; color: #313639;")
     .style("opacity", 0);


  const nodeGroup = svg.append("g")
  
  const node = nodeGroup.append("g")
    .selectAll()
    .data(root.leaves())
    .join("g").attr("transform", d => `translate(${d.x},${d.y})`)
    .on('mouseover', function (d, i) {
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
      .text(tag(d.data)); // Tag text

    // Add the value as a second line
    text.append("tspan")
      .attr("x", 0)
      .attr("y", fontSize) // Slightly below the first line
      .attr("fill-opacity", 0.7)
      .text(format(d.data[1])); // Value text
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

  

  
    return Object.assign(svg.node(), {scales: {color}});
}


function _chord_data(youtube,top_tags)
{
  let return_obj = [];
  for (const youtuber of youtube) {
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


function _top_tags(){return(
(youtuber_tags) => {
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
)}

function _chord_data_complete(chord_data)
{
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


function _chord_graph(d3,bilink,chord_data_complete,id)
{
  //const width = 954;
  const width = 1000;
  const radius = width / 2;
  const inner_radius = width-50;
  

  const tree = d3.cluster().size([2 * Math.PI, radius - 100]); //width is 2pi and height is radius size (in radial terms )
      /*
      The .size() method specifies the size of the layout in polar coordinates, not Cartesian coordinates.
      The two arguments [width, height] define the radial range:
      Width: Specifies the angular range in radians (0 to 2π for a full circle).
      Height: Specifies the radial distance from the center (the root node).
    */

   const root = tree(bilink(d3.hierarchy(chord_data_complete).sort((a,b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name)))); 

  const colors = d3.quantize(d3.interpolateRainbow, root.children.length);

  // for (const item of root.descendants()) {
  //   console.log("rotate stuff ", item.height, "level ", item.x);
  // }
// return root;

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", width)
      .attr("viewBox", [-width / 2 - 150, -width / 2 - 150, width + 300, width + 300])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  const zoomGroup = svg.append("g")

  zoomGroup.append("circle")
    .attr("r", radius - 100) // Adjust to match the size of your nodes
    .attr("fill", "none") // Transparent fill
    .attr("stroke", "#FF0033") // Border color
    .attr("stroke-width", 5);

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
    .attr("stroke", "#000")
    .attr("fill", "none")
    .attr("stroke-width", "3")
    .selectAll()
    .data(root.leaves().flatMap(leaf => leaf.outgoing))
    // .data(root.descendants().filter(d => d.depth === 2).outgoing)
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([i, o]) => line(i.path(o)))
    .each(function(d) { d.path = this; });


  function overed(event, d) {
    link.style("mix-blend-mode", null); //Set blend mode to null to not select too much
    d3.select(this).attr("font-weight", "bold"); //highlight on hover mode and make text bold
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", "#f00").attr("stroke-width", "5").raise(); //high light links and bring them to the front
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", "#f00").attr("font-weight", "bold"); //move text to the front and make them that color
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", "#f00").attr("stroke-width", "5").raise(); //Do the same with outgoing nodes
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", "#f00").attr("font-weight", "bold"); //do the same with outgoing nodes
  }

  function outed(event, d) {
    link.style("mix-blend-mode", "multiply"); //Set blend mode for links
    d3.select(this).attr("font-weight", null); //remove any bolding style
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null).attr("stroke-width", "1"); //remove stroke colors on incoming
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null); //remove text bold incoming
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null).attr("stroke-width", "1"); //remove stroke coloring for outgoing
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null); //remove text bold outgoing
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

  //return root.leaves()
  //().flatMap(leaf => leaf.outgoing)


  return svg.node();
}


function _hierarchy(){return(
function hierarchy(data, delimiter = ".") {
  let root;
  const map = new Map;
  data.forEach(function find(data) {
    const {name} = data;
    if (map.has(name)) return map.get(name);
    const i = name.lastIndexOf(delimiter);
    map.set(name, data);
    if (i >= 0) {
      find({name: name.substring(0, i), children: []}).children.push(data);
      data.name = name.substring(i + 1);
    } else {
      root = data;
    }
    return data;
  });
  return root;
}
)}

function _bilink(id){return(
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
)}

function _id(){return(
function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`.toLowerCase(0);
}
)}

function _brandData(youtube)
{
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


function _country_to_code(FileAttachment){return(
FileAttachment("country_to_code@1.json").json()
)}

function _16(topojson,world){return(
topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
)}

function _world_map(d3,countries,borders,brandData,youtube,country_to_code)
{

  const width = 2000;
  const marginTop = 46;
  const height = width * 0.6 + marginTop;
  
  const svg = d3.create("svg")
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


  const creatorsByCountry = d3.group(brandData, d => d.country);

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
    const dynamicPackSize = Math.max(creators.length/youtube.length * 300, 80);
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
        const dynamicPackSize = Math.max(creators.length / youtube.length * 300, 80);
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
        const dynamicPackSize = Math.max(creators.length / youtube.length * 300, 80);
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

return svg.node();
}


function _projection(d3){return(
d3.geoEqualEarth()
)}

function _path(d3,projection){return(
d3.geoPath(projection)
)}

function _height(d3,projection,width,outline)
{
  const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
  const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
  return dy;
}


function _outline(){return(
{type: "Sphere"}
)}

function _land(topojson,world){return(
topojson.feature(world, world.objects.land)
)}

function _borders(topojson,world){return(
topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
)}

function _countries(topojson,world){return(
topojson.feature(world, world.objects.countries)
)}

function _world(FileAttachment){return(
FileAttachment("countries-50m (2).json").json()
)}

function _catogory_data(liked_videos)
{
  const category_set = {};
  const array_of_changes = [];
  const switched_like_videos = liked_videos.reverse();
  switched_like_videos.forEach((item, index) => {
    let value = item;

    if (!category_set[value.category]) {
      category_set[value.category] = 1;
    } else {
      category_set[value.category] += 1;
    }


    const snapshot = {index};

    for (const key in category_set) {
    snapshot[key] = category_set[key];
  }
  array_of_changes.push(snapshot);
  });

  return array_of_changes;
}


function _category_graph(catogory_data,d3,DOM)
{
  let width = 1000;
  let height = 400;

  const allBodyColors = [
  "#FF0033", // Bright red (for "Entertainment")
  "#FF9900", // Vibrant orange (for content like "Music" or "How-to")
  "#3366FF", // Bright blue (for "Science & Technology" or "Education")
  "#00CC99", // Teal (for "Lifestyle" or "People & Blogs")
  "#212121", // Dark gray (neutral, for less extreme categories)
  "#808080", // Light gray (for lower popularity categories)
  "#FFD700", // Gold (for "Movies" or premium content)
  "#00FF00", // Bright green (for "Sports" or "Fitness")
  "#CCCC00"  // Muted yellow (for "Food" or "Travel")
];


  let final_version = catogory_data[catogory_data.length-1];
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
    .range(allBodyColors)

  const svg = d3.select(DOM.svg(width, height))
  .attr("viewBox", [-20, 0, width+150, height*1.1])
  .attr("style", "width: 100%; height: auto; font: 10px; sans-serif;");


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
    svg.append("path")
      .datum(catogory_data.map(d => ({index: d.index, count: d[cat] || 0})))
      .attr("fill", "none")
      .attr("stroke", colorScale(cat))
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);
  

    const areaData = catogory_data.map(d => ({ index: d.index, count: d[cat] || 0 }));

    // Append the filled area
    svg.append("path")
      .datum(areaData)
      .attr("fill", colorScale(cat)) // Match the fill color to the line color
      .attr("opacity", .1) // Add transparency to the fill for better visibility
      .attr("d", areaGenerator);
});


    // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(catogory_data.length - 1);
  const yAxis = d3.axisLeft(yScale).ticks(10);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  // Add legend
  const legend = svg.append("g")
  .attr("transform", `translate(${width + 30}, 40)`);

  categories.forEach((cat, i) => {

  const lastDataPoint = catogory_data[catogory_data.length - 1]; // Get the last entry
  const finalIndex = lastDataPoint.index; // The final x value
  const finalCount = lastDataPoint[cat] || 0; // The final y value

  svg.append("circle")
    .attr("cx", xScale(finalIndex)) // Slightly offset to the right of the line
    .attr("cy", yScale(finalCount)) // Slightly above the point
    .attr("fill", colorScale(cat)) // Match the line color
    .attr("r", 3)

  svg.append("text")
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
    .attr("alignment-baseline", "middle");
});

  // Add text value at the end of each l
  

  return svg.node();
}


function _liked_videos(FileAttachment){return(
FileAttachment("liked_videos@3.json").json()
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["youtube.json", {url: new URL("./files/fa0e15ca5ebe0db6df60ca649727a916f4cc8301bff4bd6b3c0329519ff5531e04537c2014e1ffe11cd29153cc193914e33c8597d5aaf313db04a6647e7722b3.json", import.meta.url), mimeType: "application/json", toString}],
    ["data.json", {url: new URL("./files/8fe7e4d51a3bee5d162fc4f1bd217b0777d59b6515dc087e0cf43504195f7ced9c285d84c5d76e43f45987c957a973018f7fbaa0ce980816ec93eb892e9910de.json", import.meta.url), mimeType: "application/json", toString}],
    ["countries-50m (2).json", {url: new URL("./files/f4afb2d49f0b38843f6d74521b33d41f371246e1acd674ed78016dca816cb1d262b7c54b95d395a4dad7fba5d58ed19db2944698360d19483399c79565806794.json", import.meta.url), mimeType: "application/json", toString}],
    ["country_to_code@1.json", {url: new URL("./files/2aa105c842903b50a0621e6abd9548c4f2f34b508fc8d8852fc05d20a4faef62c468bfeea7caa5f136cc140d0571e424e9d68ba807f24d0545072966fb5d60cc.json", import.meta.url), mimeType: "application/json", toString}],
    ["creator_url@2.json", {url: new URL("./files/aa285cd11e02dd4c7d3181aef41cdf86514026fa00362d38b2763a675c6a3765d6a771cdf359575adbdc0db75ca6af0f012b6ce3c1cdbcf55c90deba816ca0f2.json", import.meta.url), mimeType: "application/json", toString}],
    ["liked_videos@3.json", {url: new URL("./files/8f5f9633a72b0ce0db55089c8e4db00f758a4fba24401a36ffec173c15974bdfc3db4d94e0e358c8e39758e4f20704bb1deb7f05c2f6603373dfbc9b1b1cb85d.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("youtube_prev")).define("youtube_prev", ["FileAttachment"], _youtube_prev);
  main.variable(observer("youtube")).define("youtube", ["FileAttachment"], _youtube);
  main.variable(observer("tags_data")).define("tags_data", ["youtube"], _tags_data);
  main.variable(observer("bubble_chart")).define("bubble_chart", ["d3","tags_data"], _bubble_chart);
  main.variable(observer("chord_data")).define("chord_data", ["youtube","top_tags"], _chord_data);
  main.variable(observer("top_tags")).define("top_tags", _top_tags);
  main.variable(observer("chord_data_complete")).define("chord_data_complete", ["chord_data"], _chord_data_complete);
  main.variable(observer("chord_graph")).define("chord_graph", ["d3","bilink","chord_data_complete","id"], _chord_graph);
  main.variable(observer("hierarchy")).define("hierarchy", _hierarchy);
  main.variable(observer("bilink")).define("bilink", ["id"], _bilink);
  main.variable(observer("id")).define("id", _id);
  main.variable(observer("brandData")).define("brandData", ["youtube"], _brandData);
  main.variable(observer("country_to_code")).define("country_to_code", ["FileAttachment"], _country_to_code);
  main.variable(observer()).define(["topojson","world"], _16);
  main.variable(observer("world_map")).define("world_map", ["d3","countries","borders","brandData","youtube","country_to_code"], _world_map);
  main.variable(observer("projection")).define("projection", ["d3"], _projection);
  main.variable(observer("path")).define("path", ["d3","projection"], _path);
  main.variable(observer("height")).define("height", ["d3","projection","width","outline"], _height);
  main.variable(observer("outline")).define("outline", _outline);
  main.variable(observer("land")).define("land", ["topojson","world"], _land);
  main.variable(observer("borders")).define("borders", ["topojson","world"], _borders);
  main.variable(observer("countries")).define("countries", ["topojson","world"], _countries);
  const child1 = runtime.module(define1);
  main.import("Swatches", child1);
  main.variable(observer("world")).define("world", ["FileAttachment"], _world);
  main.variable(observer("catogory_data")).define("catogory_data", ["liked_videos"], _catogory_data);
  main.variable(observer("category_graph")).define("category_graph", ["catogory_data","d3","DOM"], _category_graph);
  main.variable(observer("liked_videos")).define("liked_videos", ["FileAttachment"], _liked_videos);
  return main;
}
