class Chart {//图表基类
    constructor(svg, data, filter, padding = { top: 0, bottom: 0, left: 0, right: 0 }) {
        this.svg = svg;//输出的svg画布
        this.data = data;//数据集
        this.filter = filter;//数据处理函数对象
        this.padding = padding;//内边距
    }
    create() {//外界调用创建图表
        this.init(this.filter(this.data));
    }
    updata() {//外界调用更新图表
        let data = this.filter(this.data);
        this.updataBase(data);//更新图表实现函数
    }
}
class ScatterPlot extends Chart {//散点图
    constructor(svg, data, filter, padding = { top: 10, bottom: 30, left: 80, right: 10 }) {
        super(svg, data, filter, padding);
    }
    init(data) {
        this.width = 1920;
        this.height = 1080;
        this.minR = 0;
        this.maxR = 50;
        this.svg.attr("preserveAspectRatio", "none")
            .attr("viewBox", "0 0 " + this.width + " " + this.height);
        this.xScale = this.getxScale(data);
        this.yScale = this.getyScale(data);
        this.rScale = this.getrScale(data);
        this.xAxis = this.getxAxis();
        this.yAxis = this.getyAxis();
        this.circles = this.getCircles(data);
        this.marks = this.getMarks?.(data);
    }
    updataBase(data) {
        this.xScale = this.getxScale(data);
        this.yScale = this.getyScale(data);
        this.rScale = this.getrScale(data);
        this.xAxis
            .transition()
            .call(this.xScale);
        this.yAxis
            .transition()
            .call(this.yScale);
        this.updataCircles(data);
        this.updataMarks?.data(data);
    }
    getxScale(data) {
        return d3.scale.linear()
            .domain([d3.min(data.map(elem => elem['xValue'])), d3.max(data.map(elem => elem['xValue']))])
            .range([0, this.width - this.padding.left - this.padding.right]);
    }
    getyScale(data) {
        return d3.scale.linear()
            .domain([d3.min(data.map(elem => elem['yValue'])), d3.max(data.map(elem => elem['yValue']))])
            .range([this.height - this.padding.top - this.padding.bottom, 0]);
    }
    getrScale(data) {
        return d3.scale.linear()
            .domain([d3.min(data.map((elem) => elem['rValue'])), d3.max(data.map((elem) => elem['rValue']))])
            .range([this.minR, this.maxR]);
    }
    getxAxis() {
        let height = this.height;
        let padding = this.padding;
        let x = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom");
        return this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
            .call(x)
            .selectAll('.tick')
            .each(function () {
                d3.select(this).append('line')
                    .attr('class', 'grid')
                    .attr('stroke', 'gray')
                    .attr('stroke-dasharray', '10')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', 0)
                    .attr('y2', -height);
            });
    }
    getyAxis() {
        let width = this.width;
        let padding = this.padding;
        let y = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");
        return this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .call(y)
            .selectAll('.tick')
            .each(function () {
                d3.select(this).append('line')
                    .attr('class', 'grid')
                    .attr('stroke', 'gray')
                    .attr('stroke-dasharray', '10')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', width)
                    .attr('y2', 0);
            });
    }
    getCircles(data) {
        var circles = this.svg.selectAll("circle")
            .data(data);
        let xScale = this.xScale;
        let yScale = this.yScale;
        let rScale = this.rScale;
        let left = this.padding.left;
        let top = this.padding.top;
        circles.enter()
            .append("circle")
            .attr('class', 'circle')
            .attr("cx", function (d) {
                return left + xScale(d['xValue']);
            })
            .attr("cy", function (d) {
                return top + yScale(d['yValue']);
            })
            .attr("r", function (d) {
                return rScale(d['rValue']);
            });
        circles.exit()
            .remove();
        return circles;
    }
    updataCircles(data) {
        let xScale = this.xScale;
        let yScale = this.yScale;
        let rScale = this.rScale;
        let left = this.padding.left;
        let top = this.padding.top;
        this.circles
            .data(data)
            .transition()
            .attr('class', 'circle')
            .attr("cx", function (d) {
                return left + xScale(d['xValue']);
            })
            .attr("cy", function (d) {
                return top + yScale(d['yValue']);
            })
            .attr("r", function (d) {
                return rScale(d['rValue']);
            });
    }
}
class StackBar extends Chart {//堆叠柱状图
    constructor(svg, data, filter, padding = { top: 10, bottom: 30, left: 90, right: 10 }) {
        super(svg, data, filter, padding);
    }
    init(data) {
        this.width = 1920;
        this.height = 1080;
        this.interaval = 0.1;
        this.rectWidth = 100;
        let rw = (this.interaval + this.rectWidth) * data[0].data.length - this.interaval + this.padding.left + this.padding.right;
        this.svg.attr("preserveAspectRatio", "none")
            .attr("viewBox", "0 0 " + this.width + " " + this.height);
        this.width = rw;
        this.svg.append('g');
        this.svg = this.svg.select('g');
        this.stack = d3.layout.stack()
            .values(d => d.data)
            .x(d => d.xValue)
            .y(d => d.yValue);
        data = this.stack(data);
        this.xScale = this.getxScale(data);
        this.yScale = this.getyScale(data);
        this.colors = this.getColors(data);
        this.xAxis = this.getxAxis();
        this.yAxis = this.getyAxis();
        this.rects = this.getRects(data);
        this.marks = this.getMarks?.(data);
        this.svg.call(this.getZoom());
    }
    getxScale(data) {
        return d3.scale.ordinal()
            .domain(data[0].data.map(elem=>elem['xValue']))
            .rangeBands([0, this.width - this.padding.left - this.padding.right], this.interaval);
    }
    getyScale(data) {
        return d3.scale.linear()
            .domain([0, d3.max(data.map(elem=>d3.max(elem.data.map(elem => elem['yValue']))))])
            .range([this.height - this.padding.top - this.padding.bottom, 0]);
    }
    getColors(data) {
        return d3.scale.category10();
    }
    getxAxis() {
        let padding = this.padding;
        let height = this.height;
        let xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient("bottom");
        return this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
            .call(xAxis);
    }
    getyAxis() {
        let width = this.width;
        let padding = this.padding;
        let yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient("left");
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            .call(yAxis)
            .selectAll('.tick')
            .each(function () {
                d3.select(this).append('line')
                    .attr('class', 'grid')
                    .attr('stroke', 'gray')
                    .attr('stroke-dasharray', '10')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', width)
                    .attr('y2', 0);
            });
    }
    getRects(data) {
        let padding = this.padding;
        let height = this.height;
        let colors = this.colors;
        let xScale = this.xScale;
        let yScale = this.yScale;
        var stack = this.svg.selectAll('.stack')
            .data(data)
            .enter()
            .append('g')
            .classed('stack', true)
            .attr('fill', function (d, i) {
                return colors(i);
            });
        var rect = stack.selectAll('rect')
            .data(function (d) {
                return d.data;
            })
            .enter()
            .append('rect')
            .attr('x', function (d) {
                return padding.left + xScale(d.xValue);
            })
            .attr('y', function (d) {
                return padding.top + yScale(d.y0) - (height - padding.top - padding.bottom - yScale(d.y));

            })
            .attr('width', xScale.rangeBand())
            .attr('height', function (d) {
                return (height - padding.top - padding.bottom - yScale(d.y));
            })
        return rect;
    }
    getZoom(){
        let svg = this.svg;
        let zoom = d3.behavior.zoom()
            .on('zoomstart', () => {
                svg.style('cursor', 'pointer');
            })
            .on('zoom', zoomed)
            .on('zoomend', () => {
                svg.style('cursor', 'default');
            });
        function zoomed(){
            console.log(d3.event.translate[0]);
            if(d3.event.translate[0] > 0){
                zoom.translate([0,0]);
                return;
            }
            svg.attr('transform',
                'translate(' + d3.event.translate[0] + ', 0 ' + ')'
            );
        }
        return zoom;
    }
}
class SunBurst extends Chart{//旭日图
    constructor(svg, data, filter, padding = { top: 10, bottom: 30, left: 90, right: 10 }) {
        super(svg, data, filter, padding);
    }
    init(data) {
        this.width = 1920;
        this.height = 1080;
        this.svg.attr("preserveAspectRatio", "none")
            .attr("viewBox", "0 0 " + this.width + " " + this.height)
            .append('g');
        this.svg = this.svg.select('g')
            .attr('transform', 'translate(' + this.width/2 + ',' + this.height/2 + ')');
        this.partition = d3.layout.partition()
            .size([2 * Math.PI, (this.height - this.padding.top - this.padding.bottom)/ 2])
        data = this.partition(data);
        this.arc = d3.svg.arc()
            .startAngle(function (d) { return d.x; })
            .endAngle(function (d) { return d.x + d.dx; })
            .innerRadius(function (d) { return d.y; })
            .outerRadius(function (d) { return d.y + d.dy; });
        this.colors = d3.scale.category10();
        console.log(data);
        let colors = this.colors;
        this.path = this.svg.selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", this.arc)
            .attr("fill-rule", "evenodd")
            .style("fill", function(d){
                if(!d.depth)
                    return 'transparent';
                while(d.depth != 1)
                    d=d.parent;
                return colors(d.color);
            })
            .style("opacity", d=>{
                return d.dx >= 0.05 || d.depth <= 1 ? 1 : 0;
            });
        this.label = this.svg.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('x', d=>d.y)
            .attr('dx', 5)
            .attr('text-anchor', 'start')
            .attr('opacity', d => d.dx >= 0.06 && d.depth != 0 ? 1 : 0)
            .attr('transform', d => {
                return 'rotate(' + ((d.x + d.dx / 2) * 180 / Math.PI - 90)+ ')';
            })
            .text(d => d.name);
    }
}
class DateMap extends Chart{//日期热力图

}