/* Creates line graph visualization for webpage */
function draw_line_Temperature(areaID, repoNameWOwner) {
    // load data file, process data, and draw visualization
    Promise.all([d3.json('./data.json')]).then(result => {
        let data = reformatData(result[0]);
        drawGraph(data, areaID);
    })

    //var parseTime = d3.timeParse('%Y-%m-%d');
    var formatTime = date => d3.isoParse(date);

    // Draw graph from data
    function drawGraph(data, areaID) {
        const sensors = Object.keys(data);

        const margin = { top: stdMargin.top, right: stdMargin.right, bottom: stdMargin.bottom, left: stdMargin.left * 1.15 },
            width = stdTotalWidth * 2 - margin.left - margin.right,
            height = stdHeight;
        const dotRadius = stdDotRadius / 3;

        const colors = d3.scaleOrdinal()
            .domain(sensors)
            .range(["#377eb8","#e41a1c","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]);
        
        const firstDate = d3.min(sensors, sensor => {
            const date = d3.min(data[sensor], d => d.date);
            return(date);
        });

        const lastDate = d3.max(sensors, sensor => {
            const date = d3.max(data[sensor], d => d.date);
            return(date);
        });

        const lowestTemp = d3.min(sensors, sensor => {
            const temp = d3.min(data[sensor], d => d.temp);
            return(temp);
        });

        const highestTemp = d3.max(sensors, sensor => {
            const temp = d3.max(data[sensor], d => d.temp);
            return(temp);
        });

        const x = d3
            .scaleTime()
            .domain([
                firstDate,
                lastDate
            ])
            .range([0,width]);

        const y = d3
            .scaleLinear()
            .domain([Math.floor(lowestTemp), Math.ceil(highestTemp)])
            .range([height, 0]);
        
        const xAxis = d3.axisBottom().scale(x);

        const yAxis = d3.axisLeft().scale(y);
        
        var valueline = d3
            .line()
            .x(function(d) {
                return x(d.date);
            })
            .y(function(d) {
                return y(d.temp);
            });

        var chart = d3
            .select('.' + areaID)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Add the x axis
        chart
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        // Add the y axis
        chart
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        // Add y axis label
        chart
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left + margin.left / 4)
            .attr('x', 0 - height / 2)
            .attr('text-anchor', 'middle')
            .text('Temperature');

        sensors.forEach(sensor => {
            // Draw line
            chart
                .append('g')
                .append('path')
                .datum(data[sensor])
                    .attr("fill", "none")
                    .attr("stroke", colors(sensor))
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.temp) }));

            // Draw dots
            chart
                .append('g')
                .selectAll('circle')
                .data(data[sensor])
                .join('circle')
                .attr('cx', function(d) {
                    return x(d.date);
                })
                .attr('cy', function(d) {
                    return y(d.temp);
                })
                .attr('r', dotRadius);
            })
        

    }

    // Turn json obj into desired working data
    // {
    //   sensor1:
    //     [
    //       {date: ..., temp: ...}
    //                ...
    //       {date: ..., temp: ...}
    //     ]
    //                ...
    //   sensorn:
    //     [
    //       {date: ..., temp: ...}
    //                ...
    //       {date: ..., temp: ...}
    //     ]
    // }
    function reformatData(obj) {
        const data = {};
        const sensors = Object.keys(obj);
        sensors.forEach(sensor => {
            data[sensor] = [];

            const arrays = obj[sensor];
            arrays.forEach(array => {
                data[sensor].push({ date: formatTime(array[0]), temp: array[1] });
            })
        });
        console.debug(data);
        return data;
    }
}