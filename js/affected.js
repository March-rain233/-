const options = ['Confirmed', 'Deaths', 'Active', 'Recovered'];
var showValue = options[0];
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
var selects = document.getElementById("selects").children;
for (let i = 0; i < selects.length; ++i) {
    selects[i].onclick = () => {
        showValue = options[i];
        for (let j = 0; j < selects.length; ++j) {
            selects[j].className = "";
        }
        selects[i].className = "select-active";
        updata();
    }
}
selects[0].className = "active";
let sunburstFilter = function(data){//旭日图过滤
    data = data.find(elem => elem['Date'] == parent.nowDate).item;
    let subSet = Array.from(new Set(data.map(elem => elem['WHO'])));
    subSet = subSet.map((elem, index) => {
        let children = [];
        data.map(d => {
            if (d['WHO'] != elem)
                return;
            let i = children.find(elem => elem.name == d['Country']);
            if (i == undefined) {
                children.push({ 
                    name: d['Country'], 
                    value: d[showValue],
                    info:"国家:" + d['Country'] + "<br>" + "人数:" + d[showValue]
                });
            }
            else {
                i['value'] += d[showValue];
            }
        });
        return { 
            name: elem, 
            children: children, 
            color: index,
            info:"WHO:" + elem + "<br>" + "人数：" + d3.sum(children.map(d=>d.value))
        };
    })
    return { name: 'sunburst', children: subSet };
}
let sunburst = new SunBurst(d3.select('#sunburst'), parent.dataset, sunburstFilter);
sunburst.create();

let stackBarFilter = function (data) {//堆叠图过滤
    let subSet = [
        { name: 'Death', data: [] },
        { name: 'Active', data: [] },
        { name: 'Recovered', data: [] }
    ];
    data.map(elem => {
        subSet[0]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem => elem['Deaths'])) });
        subSet[1]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem => elem['Active'])) });
        subSet[2]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem => elem['Recovered'])) });
    });
    return subSet;
}
let stackbar = new StackBar(d3.select('#stackbar'), parent.dataset, stackBarFilter);
stackbar.create();

let datemapFilter = function (data) {//日历热力图过滤
    function getDay(sdate) {
        let aDate = sdate.split("-");
        let date = new Date(aDate[0], aDate[1] - 1, aDate[2]);
        return date.getDay();
    }
    let preValue = 0;
    function getValue(d) {
        let nv = d3.sum(d.item.map(d => d[showValue]));
        let v = (nv - preValue);
        preValue = nv;
        return v;
    }
    let week = 0;
    return data.map(elem => {
        let value = getValue(elem);
        let day = getDay(elem['Date']);
        week += day == 0;
        return{ date: elem['Date'],
                value: value, 
                week: week, 
                day: day, 
                info:"日期：" + elem['Date'] + '<br>' + '新增人数：' + value 
            };
    });
}
let datemap = new DateMap(d3.select('#datemap'), parent.dataset, datemapFilter);
datemap.create();
datemap.rects
    .on('click', function(d){
        upadteDate(d.date);
    });

let mapFilter = function (date) {//散点图过滤
    date = date.find(d => d.Date == parent.nowDate).item;
    return date.map((d) => {
        return { xValue: d['Long'], yValue: d['Lat'], rValue: d[showValue], info:d['Country']};
    });
}
let map = new ScatterPlot(d3.select('#map'), parent.dataset, mapFilter);
map.create();

updateDeathRate();
updateRecoveredRate();

function upadteDate(date){
    range.value = parent.dateDiff(parent.minDate, date);
    document.getElementById("year-label").innerText = parent.getDate(range.value);
    parent.nowDate = parent.getDate(range.value);
    updata();
}
function updataWater(percent, item){
    item.select('.wave')
        .style('top', -percent + '%');
    
    item.attr('rate', percent + '%');
}
function updateDeathRate(){
    let data = parent.dataset.find(d=>d['Date']==parent.nowDate).item;
    if(parent.local != 'world'){
        data = data.filter(d=>d.item['Country']==parent.local);
    }
    let death = d3.sum(data.map(d=>d['Deaths']));
    let confirmed = d3.sum(data.map(d=>d['Confirmed']));
    updataWater(d3.select('#death-rate'), Math.round((death*1.0 / confirmed) * 10000) / 100);
}
function updateRecoveredRate(){
    let data = parent.dataset.find(d=>d['Date']==parent.nowDate).item;
    if(parent.local != 'world'){
        data = data.filter(d=>d.item['Country']==parent.local);
    }
    let recovered = d3.sum(data.map(d=>d['Recovered']));
    let confirmed = d3.sum(data.map(d=>d['Confirmed']));
    updataWater(d3.select('#recovered-rate'), Math.round((recovered*1.0 / confirmed) * 10000) / 100);
}
function updata(){
    map.updata();
    sunburst.updata();
    datemap.updata();
    updateDeathRate();
    updateRecoveredRate();
}