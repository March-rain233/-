d3.csv("covid_19_clean_complete.csv", function (error, data) {
    if (error) {
        console.log(error);
    } else {
        let dates = Array.from(new Set(data.map(elem => elem['Date'])));
        let totalConfirmed = dates.map(elem => {
            let t = 0;
            for (let i = 0; i < data.length; ++i) {
                if (data[i]['Date'] == elem) {
                    t += Number.parseInt(data[i]['Confirmed']);
                }
            }
            return t;
        });
        let rate = dates.map((elem, i) => {
            if (i == 0)
                return 0;
            return 100 * (totalConfirmed[i] - totalConfirmed[i - 1]) / totalConfirmed[i - 1];
        });
        let subSet = dates.map((elem, i) => {
            return {
                date: elem,
                confirmed: totalConfirmed[i],
                rate: rate[i]
            }
        });
        console.log(subSet);
        //画布周边的空白
        var padding = { left: 100, right: 50, top: 20, bottom: 100 };
        let rectPadding = 5;
        var rectWidth = 150;
        //画布大小
        var width = (rectPadding + rectWidth) * subSet.length;
        var height = 1080;
        //获取SVG画布
        var svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height);
        //x轴的比例尺
        var xScale = d3.scale.ordinal()
            .domain(dates)
            .rangeBands([0, width - padding.left - padding.right]);
        //y轴的比例尺
        var yScale = d3.scale.linear()
            .domain([0, d3.max(totalConfirmed)])
            .range([height - padding.top - padding.bottom, 0]);
        //增长率的比例尺
        var rateScale = d3.scale.linear()
            .domain([0, d3.max(rate)])
            .range([height - padding.top - padding.bottom, 0]);
        //定义x轴
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom");
        //定义y轴
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left");
        //定义rate轴
        var rateAxis = d3.svg.axis()
            .scale(rateScale)
            .orient("right");
        //添加x轴
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
            .call(xAxis);
        //添加y轴
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis);
        //添加rate轴
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (width - padding.right) + "," + padding.top + ")")
            .call(rateAxis);
        //柱状图绘制
        var rects = svg.selectAll(".MyRect")
            .data(subSet);
        rects.enter()
            .append("rect")
            .attr("class", "MyRect")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function (d, i) {
                return xScale(d['date']) + rectPadding / 2;
            })
            .attr("y", function (d) {
                return yScale(d['confirmed']);
            })
            .attr("width", xScale.rangeBand() - rectPadding)
            .attr("height", function (d) {
                return height - padding.top - padding.bottom - yScale(d['confirmed']);
            })
            .attr("fill", "#44444f")
            .on("mouseover", function (d) {
                let top10 = [];
                data.map(elem => {
                    if (elem['Date'] == d['date']) {
                        top10.push(elem);
                    }
                });
                top1 = top10.sort((a, b)=>{
                    return b['Confirmed'] - a['Confirmed'];
                })
                top10 = top10.slice(0, 10);
                top10 = top10.map(d=>d['Country/Region']);
                d3.select(this)
                    .attr("fill", "#44449f");
                console.log(top10);
                document.getElementById("tooltip").innerText = "全世界感染人数前十国家:" + top10.toString();
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .attr("fill", "#44444f");
                document.getElementById("tooltip").innerText = "";

            });
        rects.exit()
            .remove();
        // 添加折线
        var line = d3.svg.line()
            .x(function (d) {
                return xScale(d['date']) + rectPadding / 2 + padding.left + rectWidth / 2;
            })
            .y(function (d) {
                return rateScale(d['rate']);
            })
            // 选择线条的类型
            .interpolate('linear');
        // 添加path元素，并通过line()计算出值来赋值
        svg.append('path')
            .attr('stroke-width', 2)
            .attr('d', line(subSet))
            .attr('stroke', 'green');
        // 添加折线
        var line2 = d3.svg.line()
            .x(function (d) {
                return xScale(d['date']) + rectPadding / 2 + padding.left + rectWidth / 2;
            })
            .y(function (d) {
                return padding.top + yScale(d['confirmed']);
            })
            // 选择线条的类型
            .interpolate('linear');
        // 添加path元素，并通过line()计算出值来赋值
        svg.append('path')
            .attr('stroke-width', 2)
            .attr('d', line2(subSet))
            .attr('stroke', 'red');
        //标记绘制
        let markBottom = 5;
        let marks = svg.selectAll(".Mark")
            .data(subSet)
            .enter()
            .append("text")
            .attr("class", "Mark")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .attr("x", function (d, i) {
                return xScale(d['date']) + rectPadding / 2 + rectWidth / 4;
            })
            .attr("y", function (d) {
                return yScale(d['confirmed']) - markBottom;
            })
            .text(function (d) {
                return d['confirmed'];
            });
    }
});