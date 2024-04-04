// Loading the CSV data from the specified path
d3.csv("../data/Electric_Vehicle_Population_Data.csv", function(d) {
    return {
        modelYear: +d["Model Year"],
        electricRange: +d["Electric Range"],
        msrp: +d["Base MSRP"]
    };
}).then(function(data) {
    // Filtering for the 2019 model year and ensuring valid MSRP and Electric Range values
    let filteredData = data.filter(d => d.modelYear === 2019 && d.msrp > 0 && d.electricRange > 0);

    // Aggregating data to get a count of occurrences for each (Electric Range, MSRP) pair
    let aggregatedData = {};
    filteredData.forEach(function(d) {
        const key = `${d.electricRange}_${d.msrp}`;
        if (!aggregatedData[key]) {
            aggregatedData[key] = { ...d, count: 0 };
        }
        aggregatedData[key].count += 1;
    });

    let data2019 = Object.values(aggregatedData);

    // Setting dimensions and margins for the graph
    const margin = {top: 60, right: 200, bottom: 70, left: 80},
          width = 960 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    // Creating the SVG container for the plot
    const svg = d3.select("#bubble-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Defining the X and Y axes with padding and nice function
    const x = d3.scaleLinear()
        .domain([0, d3.max(data2019, d => d.electricRange)])
        .range([0, width]).nice();

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleLinear()
        .domain([0, d3.max(data2019, d => d.msrp)])
        .range([height, 0]).nice();

    svg.append("g")
        .call(d3.axisLeft(y));

    // Appending x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Electric Range");

    // Appending y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .text("Base MSRP");

    // Determining the maximum count for setting the color scale domain
    const maxCount = d3.max(data2019, d => d.count);

    // Adjusting the colorScale domain based on the dataset's count range
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([1, maxCount]);

    // Defining the bubble size scale, ensuring that it reflects the actual data counts
    const z = d3.scaleSqrt()
        .domain([1, maxCount])
        .range([4, 40]);

    // Creating the bubbles
    const bubbles = svg.append('g')
        .selectAll("dot")
        .data(data2019)
        .enter();

    bubbles.append("circle")
        .attr("cx", d => x(d.electricRange))
        .attr("cy", d => y(d.msrp))
        .attr("r", d => z(d.count))
        .style("fill", d => colorScale(d.count))
        .style("opacity", "0.7")
        .attr("stroke", "black");

    bubbles.append("text")
        .attr("x", d => x(d.electricRange))
        .attr("y", d => y(d.msrp))
        .style("text-anchor", "middle")
        .style("font-size", d => `${Math.max(z(d.count)/4, 10)}px`)
        .text(d => d.count);

    // Adding chart title
    svg.append("text")
        .attr("class", "chart title")
        .attr("x", width + 5 / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("text-decoration", "underline")
        .text("Base MSRP vs Electric Range (2019 Model Year)");

    // Dynamically creating the legend 
    const uniqueCounts = [...new Set(data2019.map(d => d.count))].sort(d3.ascending);

    // Defining a constant size for all legend bubbles
    const legendBubbleSize = 10;

    // Setting the legend title
    svg.append("text")
        .attr("x", width + 50)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Vehicle Count");

    // Adding the dynamic legend
    const legend = svg.selectAll(".legend")
        .data(uniqueCounts)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 50},${20 + i * 30})`);

    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 10)
        .attr("r", legendBubbleSize)
        .style("fill", d => colorScale(d))
        .style("opacity", "0.7")
        .attr("stroke", "black");

    legend.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => `${d} Vehicles`);
}).catch(function(error) {
    console.error(error);
});
