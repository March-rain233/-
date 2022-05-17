var dataset;
const padding = { left: 100, right: 20, top: 20, bottom: 20 };
const options = ['Confirmed', 'Deaths', 'Active'];
const maxR = 70;
const minR = 0;
const xValue = 'Long';
const yValue = 'Lat';
var minDate;
var showValue = options[0];
function dateDiff(sDate1, sDate2) {
    var aDate = sDate1.split("-");
    var oDate1 = new Date(aDate[0], aDate[1]-1, aDate[2]);
    aDate = sDate2.split("-");
    var oDate2 = new Date(aDate[0], aDate[1]-1, aDate[2]);
    var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    return iDays;
}
function getDate(days){
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
function getSetByYear(year) {
    return dataset.find(elem => elem['Date'] == year).item;
}
function update(){
    const width = 1920;
    const height = 1080;
    let svg = d3.select('#main-canvas');
    let subSet = getSetByYear(getDate(document.getElementById('year-range').value));
    let xScale = d3.scale.linear()
        .domain([d3.min(subSet.map(elem => elem[xValue])), d3.max(subSet.map(elem => elem[xValue]))])
        .range([0, width - padding.left - padding.right]);
    let yScale = d3.scale.linear()
        .domain([d3.min(subSet.map(elem => elem[yValue])), d3.max(subSet.map(elem => elem[yValue]))])
        .range([0, height - padding.top - padding.bottom]);
    let rScale = d3.scale.linear()
        .domain([d3.min(subSet.map((elem) => elem[showValue])), d3.max(subSet.map((elem) => elem[showValue]))])
        .range([minR, maxR]);
    let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    let yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");
    svg.select('#xAxis')
        .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
        .call(xAxis);
    svg.select('#yAxis')
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);
    var circles = svg.selectAll("circle")
        .data(subSet)
        .transition()
        .attr("cx", function (d, i) {
            return padding.left + xScale(d[xValue]);
        })
        .attr("cy", function (d, i) {
            return padding.top + yScale(d[yValue]);
        })
        .attr("r", function (d) {

            return rScale(d[showValue]);
        })
}
function create() {
    d3.csv('../data/covid_19_clean_complete.csv', function (error, data) {
        if (error) {
            alert("数据读取错误");
            return;
        }
        let times = Array.from(new Set(data.map(elem => elem['Date'])));
        dataset = times.map((d) => {
            let subSet = [];
            data.map((i) => {
                if (i['Date'] == d) {
                    subSet.push({
                        State:i['Province/State'],
                        Country:i['Country'],
                        Lat:parseFloat(i['Lat']),
                        Long:parseFloat(i['Long']),
                        Confirmed:parseInt(i['Confirmed']),
                        Deaths:parseInt(i['Deaths']),
                        Recovered:parseInt(i['Recovered']),
                        Active:parseInt(i['Active']),
                        WHO:i['WHO Region']
                    });
                }
            });
            return { Date: d, item: subSet };
        });
        minDate = d3.min(times);
        let range = document.getElementById('year-range');
        range.max = dateDiff(minDate, d3.max(times));
        range.min = 0;
        range.value = 0;
        document.getElementById("year-label").innerText = getDate(range.value);
        range.onchange = () => {
            document.getElementById("year-label").innerText = getDate(range.value);
            update();
        }
        const width = 1920;
        const height = 1080;
        let svg = d3.select('#main-canvas')
            .attr("preserveAspectRatio", "none")
            .attr("viewBox", "0 0 " + width + " " + height);
        let subSet = getSetByYear(times[0]);
        let xScale = d3.scale.linear()
            .domain([d3.min(subSet.map(elem => elem[xValue])), d3.max(subSet.map(elem => elem[xValue]))])
            .range([0, width - padding.left - padding.right]);
        let yScale = d3.scale.linear()
            .domain([d3.min(subSet.map(elem => elem[yValue])), d3.max(subSet.map(elem => elem[yValue]))])
            .range([0, height - padding.top - padding.bottom]);
        let rScale = d3.scale.linear()
            .domain([d3.min(subSet.map((elem) => elem[showValue])), d3.max(subSet.map((elem) => elem[showValue]))])
            .range([minR, maxR]);
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
        var circles = svg.selectAll("circle")
            .data(subSet);
        circles.enter()
            .append("circle")
            .attr('class', 'circle')
            .attr("cx", function (d, i) {
                return padding.left + xScale(d[xValue]);
            })
            .attr("cy", function (d, i) {
                return padding.top + yScale(d[yValue]);
            })
            .attr("r", function (d) {
                return rScale(d[showValue]);
            })
            .on("mouseover", function (d) {
                // d3.select(this)
                //     .transition()
                //     .attr("fill", "#71361C");
                // var xPosition = parseFloat(d3.select(this).attr("cx"));
                // var yPosition = parseFloat(d3.select(this).attr("cy")) + 24;

                // svg.append("text")
                //     .attr("id", "tooltip")
                //     .attr("x", xPosition)
                //     .attr("y", yPosition)
                //     .attr("text-anchor", "middle")
                //     .attr("font-family", "sans-setif")
                //     .attr("font-size", "11px")
                //     .attr("font-weight", "bold")
                //     .attr("fill", "black")
                //     .text(d['country']);
            })
            .on("mouseout", function (d) {
                // d3.select(this)
                //     .transition()
                //     .attr("fill", colorSCale(d['gdp']));
                // d3.select("#tooltip")
                //     .remove();
            });
        circles.exit()
            .remove();
    })
}
create();
var selects = document.getElementById("selects").children;
for(let i = 0; i < selects.length; ++i){
    selects[i].onclick = ()=>{
        showValue = options[i];
        for(let j = 0; j < selects.length; ++j){
            selects[j].className = "";
        }
        selects[i].className = "active";
        update();
    }
}
selects[0].className = "active";