d3.json(
    "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
).then((data) => {
    const dataset = data.data;

    const tooltip = d3.select("#chart").append("div").attr("id", "tooltip");

    const maxValue = d3.max(dataset, (d) => d[1]);

    /**
     * Take the fetched data date and parsed to then be compared
     */
    const parseTime = d3.timeParse("%Y-%m-%d");
    let dates = [];
    for (let obj of dataset) {
        dates.push(parseTime(obj[0]));
    }

    /**
     * d3.extent() returns an array with the min and max value of an iterable (array) so It can be used as argument in xScale.domain().
     * e.g. It's like using the min and max function but in just one variable
     */
    const xDomain = d3.extent(dates);
    // const minYear = d3.min(dates, (d) => d);
    // const maxYear = d3.max(dates, (d) => d);

    const h = 500;
    const w = 950;
    const padding = 30;

    const xScale = d3.scaleTime();
    xScale.domain(xDomain).range([0, w - padding]);

    const yScale = d3.scaleLinear();
    yScale.domain([0, maxValue]).range([h - padding, 0]);

    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("overflow", "hidden");

    svg.append("text")
        .attr("id", "title")
        .attr("text-anchor", "middle")
        .attr("x", "50%")
        .text("United States GDP");

    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("width", (d, i) => w / dataset.length)
        .attr("height", 0) // y and height update later on transition
        .attr("y", (d) => h - padding)
        .attr("rx", 1.5)
        .attr("x", (d, i) => xScale(parseTime(d[0])))
        .attr("class", "bar")
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .on("mouseover", (d) => {
            tooltip.classed("show", true);

            const date = formatTooltipDate(d.target.dataset.date);
            const gdp = d3.format("$,.2f")(d.target.dataset.gdp);

            tooltip.html(`
            ${date}
            <br>
            ${gdp} Billions
            `);

            tooltip.attr("data-date", d.target.dataset.date);

            tooltip.style(
                "transform",
                `translate(${d.offsetX + 10}px,${d.offsetY + 10}px)`
            );
            tooltip.style("transform-origin", "0 0");
        })
        .on("mouseleave", () => tooltip.classed("show", false));

    svg.selectAll("rect")
        .transition()
        .ease(d3.easePoly)
        .duration(500)
        .delay((d, i) => i * 10)
        .attr("height", (d) => h - yScale(d[1]) - padding)
        .attr("y", (d) => yScale(d[1]));
    /**
     * For some reason, one of the ticks is 12:30, so it's necessary to
     * format the xAxis ticks to be in years
     */
    const xAxis = d3.axisBottom(xScale);
    xAxis.tickFormat(d3.timeFormat("%Y"));

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .attr("id", "y-axis")
        .call(yAxis);
});

function formatTooltipDate(date) {
    const yearAndQuarter = d3.timeFormat("%B - %Y");
    return yearAndQuarter(new Date(date));
}
