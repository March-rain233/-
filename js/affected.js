const options = ['Confirmed', 'Deaths', 'Active'];
var showValue = options[0];
var chart;
function updata() {
    chart.updata();
}
function create() {
    let filter = function (date) {
        date = date.find(d => d.Date == parent.nowDate).item;
        return date.map((d) => {
            return { xValue: d['Long'], yValue: d['Lat'], rValue: d[showValue] };
        });
    }
    let range = document.getElementById('year-range');
    range.max = parent.dateDiff(parent.minDate, parent.maxDate);
    range.min = 0;
    range.value = parent.dateDiff(parent.minDate, parent.nowDate);
    document.getElementById("year-label").innerText = parent.getDate(range.value);
    range.onchange = () => {
        document.getElementById("year-label").innerText = parent.getDate(range.value);
        parent.nowDate = parent.getDate(range.value);
        updata();
    }
    let svg = d3.select('#main-canvas');
    chart = new ScatterPlot(svg, parent.dataset, filter);
    chart.create();
}
create();
var selects = document.getElementById("selects").children;
for (let i = 0; i < selects.length; ++i) {
    selects[i].onclick = () => {
        showValue = options[i];
        for (let j = 0; j < selects.length; ++j) {
            selects[j].className = "";
        }
        selects[i].className = "active";
        updata();
    }
}
selects[0].className = "active";