const svg2 = d3.select('#chart2');
const width2 = +svg2.attr('width');
const height2 = +svg2.attr('height');
const margin2 = {top: 60, right: 80, bottom: 90, left: 150};
const innerWidth2 = width2 - margin2.left - margin2.right;
const innerHeight2 = height2 - margin2.top - margin2.bottom;
const mainGroup = svg2.append('g')
  .attr('transform', `translate(${margin2.left}, ${margin2.top})`);
const xValue2 = d => d.RefugeeStock;
const yValue2 = d => d.Region;
const xScale = d3.scaleLinear();
const yScale = d3.scaleBand();
const colorScale = d3.scaleOrdinal();
let xAxis, yAxis;
let xAxisGroup, yAxisGroup;
const title2 = "Number of refugees per year by region";
const yearText = mainGroup.append('text')
  .attr('class', 'year')
  .attr('text-anchor', 'end')
  .attr('x', innerWidth2 - 10)
  .attr('y', innerHeight2 - 10)
  .style('font-size', '12px');

const renderChart2 = async function(data, year) {
  yearText.text(year).raise();

  mainGroup.select('.title').remove(); // Remove previous title

  mainGroup.append('text')
    .attr('class', 'title')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + margin.bottom + 28 )
    .attr('text-anchor', 'middle')
    .text(title2);

  data.sort(d => d.RefugeeStock);
  // calculating scales:
  yScale.domain(data.map(yValue2)).range([0, innerHeight2]).padding(0.1);
  xScale.domain([0, d3.max(data, xValue2)]).range([0, innerWidth2]);
  // data-join (enter-selection) for rectangles:
  let enter = mainGroup.selectAll('rect').data(data, d => d.Region).enter().append('rect')
    .attr('height', yScale.bandwidth())
    .attr('x', 0)
    .attr('y', d => yScale(yValue2(d)))
    .attr('fill', d => colorScale(yValue2(d)));
  // data-join (enter-selection) for data-texts:
  let enterText = mainGroup.selectAll('.datatext').data(data, d => d.Region).enter().append('text')
    .attr('class', 'datatext')
    .attr('alignment-baseline', 'central ')
    .attr('x', 3)
    .attr('y', d => yScale.bandwidth() / 2 + yScale(yValue2(d)))
    .attr('fill', 'black');

  // animation:
  let transition = d3.transition().duration(2000).ease(d3.easeLinear);

  mainGroup.selectAll('rect').merge(enter).transition(transition)
    .attr('width', d => xScale(xValue2(d)))
    .attr('y', d => yScale(yValue2(d)))
    .attr('height', yScale.bandwidth());
  mainGroup.selectAll('.datatext').merge(enterText).transition(transition)
    .attr('x', d => 3 + xScale(xValue2(d)))
    .attr('y', d => yScale.bandwidth() / 2 + yScale(yValue2(d)))
    .tween("text", function(d) {
      var i = d3.interpolate(this.textContent, d.RefugeeStock);
      var formatInteger = d3.format(".0f");
      return function(t) {
        this.textContent = formatInteger(i(t));
      };
    });
  xAxisGroup.transition(transition).call(xAxis);
  yAxisGroup.transition(transition).call(yAxis);
  d3.selectAll('.tick text').attr('font-size', '1.3em');

  await transition.end();
}

d3.csv("static/csv/undesa_pd_2020_numbers.csv").then(async data => {
  var selectedRows = [22, 43, 53, 61, 67, 86, 92, 101, 113, 123, 143, 154, 168, 185, 196, 225, 234, 249, 256, 259];
  var years = [];
  var extractedData = selectedRows.map(function(index) {
    return data[index];
  });

  const separatedData = [];
  extractedData.forEach(function(d) {
    var region = d.Region;
    years = ['1990', '1995', '2000', '2005', '2010', '2015', '2020'];

    years.forEach(year => {
      var refugeeStock = parseInt(d[year].trim().replace(/\s/g, ""), 10);
      separatedData.push({ Region: region, Year: +year, RefugeeStock: refugeeStock });
    });
  });

  const regions = Array.from(new Set(separatedData.map(yValue2)));
  // colors:
  colorScale.domain(regions);
  const sp = d3.scalePoint().domain(regions).range([0, 1]);
  colorScale.range(regions.map(d => d3.interpolateSpectral(sp(d))));

  yScale.range([0, innerHeight2]).padding(0.1);
  xScale.range([0, innerWidth2]);

  xAxis = d3.axisBottom(xScale);
  xAxis.ticks(5);
  yAxis = d3.axisLeft(yScale);
  xAxisGroup = mainGroup.append('g').call(xAxis);
  yAxisGroup = mainGroup.append('g').call(yAxis);
  xAxisGroup.attr('transform', `translate(${0}, ${innerHeight2})`);

  xAxisGroup.append('text')
    .attr('class', 'axistitle2')
    .text('Refugee Stock')
    .attr('x', innerWidth2 / 2)
    .attr('y', 38);

  d3.selectAll('.axistitle2').attr('text-anchor', "middle").attr('fill', 'black').attr('font-size', '2em');
  // font-size of texts of axes:
  d3.selectAll('.tick text').attr('font-size', '1.5em');
  separatedData.sort((a, b) => b.RefugeeStock - a.RefugeeStock);

  console.log(separatedData);

  for (let i = 0; i < years.length; i++) {
    const year = +years[i];
    await renderChart2(separatedData.filter(d => d.Year === year), year);
  }
});
