


const svg3 = d3.select('#map');
const margin3 = { top: 100, right: 100, bottom: 100, left: 100};
const width3 = +svg3.attr('width');
const height3 = +svg3.attr('height');
const innerWidth3 = width3 - margin3.left - margin3.right;
const innerHeight3 = height3 - margin3.top - margin3.bottom;



const renderMap = (data,mapData) => {


  const g = svg3.append('g')
      .attr('transform', `translate(${margin3.left}, ${margin3.top})`);
  const projection = d3.geoNaturalEarth1()
      ;

  const path = d3.geoPath()
      .projection(projection);

  // Create an object to store continent names and corresponding refugee numbers
  const refugeeCountByContinent = {};

  data.forEach(data => {
    let continent = data.Region.toLowerCase().trim();
    const refugeeCount = data.RefugeeStock;
    if (refugeeCountByContinent.hasOwnProperty(continent)) {
      refugeeCountByContinent[continent] += refugeeCount;
    } else {
      refugeeCountByContinent[continent] = refugeeCount;
    }

  });
//console.log(refugeeCountByContinent);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  g.selectAll('path')
      .data(mapData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        let continent = d.properties.continent.toLowerCase();
        if (continent === 'south america') {
          continent = 'latin america and the caribbean';
        }
        if (continent === 'north america') {
          continent = 'northern america';
        }
        const refugeeCount = refugeeCountByContinent[continent] || 0;
        return getColor(refugeeCount);
      })
      .attr('stroke', '#fff')
      .on('mouseover', (event, d) => {

        let continent = d.properties.continent.toLowerCase();
        if (continent === 'south america') {
          continent = 'latin america and the caribbean';
        }
        if (continent === 'north america') {
          continent = 'northern america';
        }

        console.log(refugeeCountByContinent);
        console.log(continent);
        console.log(refugeeCountByContinent[continent]);
        const refugeeCount = refugeeCountByContinent[continent] || 0;

        tooltip.style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`)
          .html(`${continent}: ${refugeeCount}`);
      })
      .on('mouseout', () => {

        tooltip.style('opacity', 0);
      });
}

  function getColor(refugeeCount) {
    if (refugeeCount > 10000000) {
      return '#FF0000';
    } else if (refugeeCount > 5000000) {
      return '#FF3300';
    } else if (refugeeCount > 1000000) {
      return '#FF6600';
    } else if (refugeeCount > 500000) {
      return '#FF9900';
    } else if (refugeeCount > 100000) {
      return '#FFCC00';
    } else {
      return '#FFFF00';
    }
  };
  Promise.all([
    d3.json('static/csv/custom.geo.json'),
    d3.csv('static/csv/undesa_pd_2020_numbers.csv')
  ]).then(([mapData, refugeeData]) => {
    //preprocess
    var selectedRows = [21, 85, 142, 195, 249, 255];
    var years = [];
    var extractedData = selectedRows.map(function (index) {
      return refugeeData[index];
    });
    //console.log(extractedData);

    const separatedData = [];
    extractedData.forEach(function (d) {
      var region = d.Region;
      years = ['2020'];

      years.forEach(year => {
        var refugeeStock = parseInt(d[year].trim().replace(/\s/g, ""), 10);
        separatedData.push({Region: region, Year: +year, RefugeeStock: refugeeStock});
      });
    });
    renderMap(separatedData, mapData);
  });


