const svg = d3.select('#chart1');
const width = +svg.attr('width');
const height = +svg.attr('height');

const yValue = d => +d.Percentage;
const xValue = d => +d.Year;
const xAxisLabel = "year";
const yAxisLabel = "percentage";
const title = "refugee and asylum seeker as a percentage of the international migrant stock";
const margin = { top: 100, right: 100, bottom: 100, left: 100 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const colors = ['red', 'green', 'lightblue'];

const renderChart1 = data => {

  const xScale = d3.scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0]);

  const line = d3.line()
    .x(d => xScale(xValue(d)) + xScale.bandwidth() / 2)
    //.x(d => xScale(xValue(d) ))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveBasis);


  const g = svg.append('g')
    .attr('transform', `translate( ${margin.left}, ${margin.top})`);


  g.selectAll('path')
    .data(d3.groups(data, d => d.Region).map(d => d[1]))
    .join("path")
    .attr('fill', 'none')
    .attr('d', line)
    .attr('class', 'line')
    .attr('stroke', (d, i) => colors[i % colors.length])
    .attr('stroke-width', '3px');

  var legend = svg.selectAll("g.legend")
    .data(Array.from(new Set(data.map(d => d.Region))))
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(20," + (i * 20 + 20) + ")"; });

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) { return colors[i % colors.length]; });

  legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function(d) { return d; });

  const yAxis = d3.axisLeft(yScale);
  const xAxis = d3.axisBottom(xScale);

  const yAxisGroup = g.append('g').call(yAxis);
  const xAxisGroup = g.append('g').call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`);

  yAxisGroup.append('text')
    .attr('class', 'axis-label')
    .attr('y', -40)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('font-size', '2em')
    .text(yAxisLabel);


  xAxisGroup.append('text')
    .attr('class', 'axis-label')
    .attr('y', 40)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .attr('font-size', '2em')
    .text(xAxisLabel);


    g.append('text')
    .attr('class', 'title')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .text(title);
}

d3.csv("static/csv/undesa_pd_2020_percentages.csv").then(data => {
  const highIncome = data.at(16);
  const middleIncome = data.at(17);
  const lowIncome = data.at(20);
  const incomeCountries = [highIncome, middleIncome, lowIncome];
  
  
  const separated_data = [];
  incomeCountries.forEach(function(d) {
    var region = d.Region;
    var years = ['1990','1995', '2000', '2005', '2010', '2015', '2020'];
    
    years.forEach(year => {
      separated_data.push({ Region: region, Year: +year, Percentage: +d[year] });
    });
    
  });
  renderChart1(separated_data);
  
});
