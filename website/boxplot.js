// Load the CSV data from the specified path
d3.csv("/data/Electric_Vehicle_Population_Data.csv", d => {
    return {
        modelYear: +d["Model Year"],
        electricRange: +d["Electric Range"],
        msrp: +d["Base MSRP"]
    };
}).then(data => {
    // Filter for the 2019 model year and ensure valid MSRP and Electric Range values
    let filteredData = data.filter(d => d.modelYear === 2019 && d.msrp > 0 && d.electricRange > 0);

    // Aggregate data to get a count of occurrences for each (Electric Range, MSRP) pair
    let aggregatedData = {};
    filteredData.forEach(d => {
        const key = `${d.electricRange}_${d.msrp}`;
        if (!aggregatedData[key]) {
            aggregatedData[key] = { ...d, count: 0 };
        }
        aggregatedData[key].count += 1;
    });

    // Prepare the aggregated data for D3 visualization
    let data2019 = Object.values(aggregatedData);

    // Set dimensions and margins for the graph
    const margin = {top: 60, right: 30, bottom: 70, left: 80},
          width = 900 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Create SVG container for the plot
    const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define the X axis
    const x = d3.scaleLinear()
      .domain([0, d3.max(data2019, d => d.electricRange)])
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add X axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2 + margin.left)
      .attr("y", height + margin.top - 15)
      .text("Electric Range (miles)");

    // Define the Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data2019, d => d.msrp)])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add Y axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - height/2 + 20)
      .text("Base MSRP ($)");

    // Define a scale for the bubble size
    const z = d3.scaleSqrt()
      .domain([0, d3.max(data2019, d => d.count)])
      .range([2, 20]); // Bubble size range

    // Create and fill the bubbles
    svg.append('g')
      .selectAll("dot")
      .data(data2019)
      .enter()
      .append("circle")
        .attr("cx", d => x(d.electricRange))
        .attr("cy", d => y(d.msrp))
        .attr("r", d => z(d.count))
        .style("fill", "#69b3a2")
        .style("opacity", "0.7")
        .attr("stroke", "black");

    // Add a title to the chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("text-decoration", "underline")
      .text("Base MSRP vs Electric Range (2019 Model Year)");

    const legendSizes = [1, 3, 10]; // Example counts to represent in the legend

// Add a legend title
svg.append("text")
    .attr("x", width - 100)
    .attr("y", 20)
    .text("Vehicle Count")
    .style("font-size", "16px")
    .attr("alignment-baseline","middle");

// Create legend bubbles and labels
legendSizes.forEach((size, index) => {
    const radius = z(size); // Convert count to radius size
    const yPos = 40 + index * 40; // Position each legend item vertically

    // Add legend bubbles
    svg.append("circle")
        .attr("cx", width - 80)
        .attr("cy", yPos)
        .attr("r", radius)
        .style("fill", "#69b3a2")
        .style("opacity", "0.7")
        .attr("stroke", "black");

    // Add legend labels
    svg.append("text")
        .attr("x", width - 60)
        .attr("y", yPos)
        .text(`= ${size} Vehicles`)
        .style("font-size", "14px")
        .attr("alignment-baseline","middle");
});

}).catch(error => {
    console.log(error);
});