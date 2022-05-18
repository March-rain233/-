const padding = { left: 100, right: 20, top: 20, bottom: 20 };
var width;
const height = 1080;
const interval = 100;
var minDate;
function dateDiff(sDate1, sDate2) {
    var aDate = sDate1.split("-");
    var oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    aDate = sDate2.split("-");
    var oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    return iDays;
}
function getDate(days) {
    var dateTemp = minDate.split("-");
    var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式    
    var millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
    var rDate = new Date(millSeconds);
    var year = rDate.getFullYear();
    var month = rDate.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var date = rDate.getDate();
    if (date < 10) date = "0" + date;
    return (year + "-" + month + "-" + date);
}
d3.csv("../data/covid_19_clean_complete.csv", function (error, data) {
    if (error) {
        console.log(error);
    } else {
        let times = Array.from(new Set(data.map(elem => elem['Date'])));
        let subData = times.map(d => {
            let active = 0;
            let death = 0;
            let recovered = 0;
            let confirmed = 0;
            let countrySort = [];
            data.map(item => {
                if (item['Date'] == d) {
                    active += parseInt(item['Active']);
                    death += parseInt(item['Deaths']);
                    recovered += parseInt(item['Recovered']);
                    confirmed += parseInt(item['Confirmed']);
                    let country = countrySort.find(elem => elem['country'] == item['Country/Region']);
                    if (country == undefined) {
                        countrySort.push({
                            country: item['Country/Region'],
                            data: parseInt(item['Confirmed'])
                        });
                    }
                    else {
                        country.data += parseInt(item['Confirmed']);
                    }
                }
            });
            countrySort = countrySort.sort((a, b) => b.data - a.data);
            return {
                date: d,
                active: active,
                death: death,
                recovered: recovered,
                confirmed: confirmed,
                countrySort: countrySort
            }
        });
        minDate = d3.min(times);
        let subSet = [
            { name: 'death', data: [] },
            { name: 'confirmed', data: [] },
            { name: 'recovered', data: [] }
        ];
        subData.map(elem => {
            subSet[0]['data'].push({ date: elem['date'], data: elem['death'] });
            subSet[1]['data'].push({ date: elem['date'], data: elem['confirmed'] });
            subSet[2]['data'].push({ date: elem['date'], data: elem['recovered'] });
        });
        subSet = d3.layout.stack()
            .values(d => d.data)
            .x(d => d.date)
            .y(d => d.data)
            (subSet);
        width = interval * (times.length - 1) + padding.left + padding.right;
        let svg = d3.select('#main-canvas')
            .attr("preserveAspectRatio", "slice")
            .attr("viewBox", "0 0 " + width + " " + height);
        let xScale = d3.scale.ordinal()
            .domain(times)
            .rangeBands([0, width - padding.left - padding.right]);
        let yScale = d3.scale.linear()
            .domain([0, d3.max(subData.map(elem => elem['confirmed']))])
            .range([height - padding.top - padding.bottom, 0]);
        var colors = d3.scale.category10();
        let xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        let yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        svg.append("g")
            .attr("class", "axis")
            .attr('id', 'xAxis')
            .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "axis")
            .attr('id', 'yAxis')
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis);
        var stack = svg.selectAll('.stakc')
            .data(subSet)
            .enter()
            .append('g')
            .classed('stack', true)
            .attr('fill', function (d, i) {
                return colors(i);
            })
        let lines = svg.selectAll('.line')
            .data(chart.stack(data));
        lines.enter()
            .append('path')
            .attr('class', (d) => 'line line-' + d.key)
            .merge(lines)
            .attr('fill', 'none')
            .attr('stroke', (d, i) => chart._colors(i))
            .transition().duration(config.animateDuration)
            .attrTween('d', lineTween);
        lines.exit()
            .remove();
    }
});