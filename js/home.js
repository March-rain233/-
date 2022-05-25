const graphs = ['tendency.html','affected.html'];
var tabs = document.getElementById('nav').children;
function select(i){
    for(let j = 0; j < tabs.length; ++j){
        tabs[j].className = "";
    }
    tabs[i].className = 'active';
    document.getElementById('graph').setAttribute('src', graphs[i]);
}
for(let i = 0; i < tabs.length; ++i){
    tabs[i].onclick = ()=>{
        select(i);
    }
}
select(0);
var dataset;//全局数据集
var minDate;//最小时间
var maxDate;//最大时间
var nowDate;//当前选中时间
function dateDiff(sDate1, sDate2) {//获取日期差
    var aDate = sDate1.split("-");
    var oDate1 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    aDate = sDate2.split("-");
    var oDate2 = new Date(aDate[0], aDate[1] - 1, aDate[2]);
    var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);
    return iDays;
}
function getDate(days) {//根据日期差获取时间
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
d3.csv('../data/covid_19_clean_complete.csv', function (error, data) {
    if (error) {
        alert("数据读取错误");
        return;
    }
    else{
        let times = Array.from(new Set(data.map(elem => elem['Date'])));
        dataset = times.map((d) => {
            subSet = [];
            data.map((i) => {
                if (i['Date'] == d) {
                    subSet.push({
                        State: i['Province/State'],
                        Country: i['Country/Region'],
                        Lat: parseFloat(i['Lat']),
                        Long: parseFloat(i['Long']),
                        Confirmed: parseInt(i['Confirmed']),
                        Deaths: parseInt(i['Deaths']),
                        Recovered: parseInt(i['Recovered']),
                        Active: parseInt(i['Active']),
                        WHO: i['WHO Region']
                    });
                }
            });
            return { Date: d, item: subSet };
        });
        minDate = d3.min(times);
        maxDate = d3.max(times);
        nowDate = minDate;
    }
});