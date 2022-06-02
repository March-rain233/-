let filter = function (data) {//堆叠图过滤
    let subSet = [
        { name: 'Death', data: [] },
        { name: 'Active', data: [] },
        { name: 'Recovered', data: [] }
    ];
    data.map(elem => {
        subSet[0]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem=>elem['Deaths'])) });
        subSet[1]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem=>elem['Active']))  });
        subSet[2]['data'].push({ xValue: elem['Date'], yValue: d3.sum(elem['item'].map(elem=>elem['Recovered']))  });
    });
    return subSet;
}
// let filter = function(data){//旭日图过滤
//     data = data.find(elem=>elem['Date']==parent.nowDate).item;
//     let subSet = Array.from(new Set(data.map(elem => elem['WHO'])));
//     subSet = subSet.map((elem, index)=>{
//         let children = [];
//         const ShowValue = 'Confirmed';
//         data.map(d=>{
//             if(d['WHO'] != elem)
//                 return;
//             let i = children.find(elem=>elem.name==d['Country']);
//             if(i == undefined){
//                 children.push({name:d['Country'], value:d[ShowValue]});
//             }
//             else{
//                 i['value'] += d[ShowValue];
//             }
//         });
//         return {name:elem, children:children, color:index};
//     })
//     return {name:'sunburst', children:subSet};
// }
// let filter = function (data) {//日历热力图过滤
//     function getDay(sdate) {
//         let aDate = sdate.split("-");
//         let date = new Date(aDate[0], aDate[1] - 1, aDate[2]);
//         return date.getDay();
//     }
//     const ShowValue = 'Deaths';
//     let preValue = 0;//d3.sum(data[0].item.map(d=>d[ShowValue]));
//     function getValue(d) {
//         let nv = d3.sum(d.item.map(d => d[ShowValue]));
//         let v = (nv - preValue);
//         preValue = nv;
//         return v;
//     }
//     let week = 0;
//     return data.map(elem => {
//         let day = getDay(elem['Date']);
//         week += day == 0;
//         return { date: elem['Date'], value: getValue(elem), week: week, day: day };
//     });
// }
let svg = d3.select('#main-canvas');
let chart = new StackBar(svg, parent.dataset, filter);
//let chart = new SunBurst(svg, parent.dataset, filter);
//let chart = new DateMap(svg, parent.dataset,filter)
chart.create();