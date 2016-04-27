var comparativeVis = function comparativeVis(svgID) {
    /*Creates comparative visualization between eahc year's best picture nominees.
      Dynamically displays trends between IMDb and RT ratings per year */

    //Svg parameters
    var width = 1.75 * height,
        padding = 75;

    //Color Scheme
    var colAxes = "#173e43",
        colText = "#173e43",
        colPoint = "#4d0000",
        colAvg = "#173e43",
        colHighlight = "#8b8e73";

    //Array init
    var movieArray = [], //Contains info on all read movies
        yrAvgArray = [], //Contain info on all year avgs.
        winnerArray = [], //Contains info on all winners
        winnerPts = [], //Contains info on graphic reprs. of winners
        scatterPts = []; //Contains info on graphic reprs. of nominees

    //Scale determination init
    var minX = Infinity,
        maxX = 0,
        minY = Infinity,
        maxY = 0,
        paramX = "year" //parameter on xAxis
        paramY = "IMDb"; //parameter on yAxis

    //Obtain all movie data in accesible format
    allOscars.forEach(function(year) {
        //Init year avgs.
        var runAvg = 0,
            IMDBAvg = 0,
            RTAvg = 0,
            DomAvg = 0,
            WorldAvg = 0,
            yr = 0;

        //Parse individual film's data
        year.data.forEach(function(film) {

            winners.forEach(function(winner) {
                if (film.movie == winner) {
                    winnerArray.push({
                        "title": film.movie,
                        "year": +film.data.year.text,
                        "RT": +film.data.rt.text,
                        "runtime": +film.data.runtimes.text,
                        "IMDb": +film.data.rating.text,
                        "grossDom": +film.data.grossDom.text,
                        "grossWorld": +film.data.grossWorld.text
                    });
                } else {
                    movieArray.push({
                        "title": film.movie,
                        "year": +film.data.year.text,
                        "RT": +film.data.rt.text,
                        "runtime": +film.data.runtimes.text,
                        "IMDb": +film.data.rating.text,
                        "grossDom": +film.data.grossDom.text,
                        "grossWorld": +film.data.grossWorld.text
                    });
                };
            });

            //Scale determiner
            if (movieArray[movieArray.length - 1][paramY] > maxY) {
                maxY = movieArray[movieArray.length - 1][paramY];
            };
            if (movieArray[movieArray.length - 1][paramY] < minY) {
                minY = movieArray[movieArray.length - 1][paramY];
            };

            if (movieArray[movieArray.length - 1][paramX] > maxX) {
                maxX = movieArray[movieArray.length - 1][paramX];
            };
            if (movieArray[movieArray.length - 1][paramX] < minX) {
                minX = movieArray[movieArray.length - 1][paramX];
            };

            //Increment year avgs.
            runAvg += movieArray[movieArray.length - 1].runtime;
            IMDBAvg += movieArray[movieArray.length - 1].IMDb;
            RTAvg += movieArray[movieArray.length - 1].RT;
            DomAvg += movieArray[movieArray.length - 1].grossDom,
                WorldAvg += movieArray[movieArray.length - 1].grossWorld;
            yr += movieArray[movieArray.length - 1].year;
        });

        //Adjust year avgs. based on # of nominees
        runAvg /= year.data.length;
        IMDBAvg /= year.data.length;
        RTAvg /= year.data.length;
        DomAvg /= year.data.length;
        WorldAvg /= year.data.length;
        yr /= year.data.length;

        yrAvgArray.push({
            "year": +yr,
            "runtime": +runAvg,
            "IMDb": +IMDBAvg,
            "RT": +RTAvg,
            "grossDom": +DomAvg,
            "grossWorld": +WorldAvg,
        });
    });

    // Init svg, scales, labels, scatter pts //
    var xScale = d3.scale.linear().domain([minX, maxX]).range([2 * padding, width - 2 * padding]);

    var yScale = d3.scale.linear().domain([minY, maxY]).range([height - padding, padding]);

    var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(5);
    if (paramX == "year") {xAxis.tickFormat(d3.format("d"))}

    var yAxis = d3.svg.axis().orient("left").scale(yScale);

    var svg = d3.select(svgID).append("svg")
        .attr({
            height: height,
            width: width
        });

    var xTicks = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .style("fill", colAxes)
        .call(xAxis);

    var yTicks = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ", 0)")
        .style("fill", colAxes)
        .call(yAxis);

    var xLabel = svg.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .attr("x", xScale((minX + maxX) / 2))
        .attr("y", height - padding / 2)
        .text(paramX);

    var yLabel = svg.append("text")
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .attr("transform", "translate(" + padding / 2 + ", " + yScale((minY + maxY) / 2) + ")rotate(-90)")
        .text(paramY);

    //Add nominee movie scatter points
    movieArray.forEach(function(film) {
        var circle = svg.append("circle")
            .attr("cx", xScale(film[paramX]))
            .attr("cy", yScale(film[paramY]))
            .attr("r", 5)
            .style("fill", colPoint);

        //Create ptObj encoded with raw data and graphic pointer
        var ptObj = {
            "x": film[paramX],
            "y": film[paramY],
            "graphic": circle
        };

        //Point Interactivity
        circle.on("mouseover", function() {
            var group = svg.append("g").attr("id", "tooltip")

            if (yScale(film[paramY]) < 85) {
                var offset = 25;
            } else {
                var offset = 0;
            }

            if (film["title"].length > 20) {
                var wScale = 2;
            } else {
                var wScale = 1;
            }

            group.append("rect")
                .attr({
                    x: xScale(film[paramX]) + 10,
                    y: yScale(film[paramY]) - 35 + offset,
                    height: 25,
                    width: 75 * wScale,
                })
                .style({
                    fill: "#dddfd4",
                    "stroke-width": 0,
                    opacity: 0.8
                })

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11,
                    "font-weight": "bold"
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) - 25 + offset,
                })
                .text(film["title"]);

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) - 12.5 + offset,
                })
                .text(paramX + ": " + film[paramX]);

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) + offset,
                })
                .text(paramY + ": " + film[paramY]);

            group.style("opacity", 0);
            group.transition()
                .ease("sin")
                .duration(150)
                .style("opacity", 1)
        })

        circle.on("mouseout", function() {
            svg.select("#tooltip").transition()
                .ease("sin")
                .duration(75)
                .style("opacity", 0)
                .each('end', function() {
                    svg.selectAll("#tooltip").remove()
                });
        })

        scatterPts.push(ptObj);
    });

    //Add winning movie scatter points
    winnerArray.forEach(function(film) {
        var circle = svg.append("circle")
            .attr("cx", xScale(film[paramX]))
            .attr("cy", yScale(film[paramY]))
            .attr("r", 5)
            .style("fill", colPoint)
            .style("stroke", colHighlight)
            .style("stroke-width", 3);

        //Create ptObj encoded with raw data and graphic pointer
        var ptObj = {
            "x": film[paramX],
            "y": film[paramY],
            "graphic": circle
        };

        //Point Interactivity
        circle.on("mouseover", function() {
            var group = svg.append("g").attr("id", "tooltip")

            if (yScale(film[paramY]) < 85) {
                var offset = 25;
            } else {
                var offset = 0;
            }

            if (film["title"].length > 20) {
                var wScale = 2;
            } else {
                var wScale = 1;
            }

            group.append("rect")
                .attr({
                    x: xScale(film[paramX]) + 10,
                    y: yScale(film[paramY]) - 35 + offset,
                    height: 25,
                    width: 75 * wScale,
                })
                .style({
                    fill: "#dddfd4",
                    "stroke-width": 0,
                    opacity: 0.8
                })

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11,
                    "font-weight": "bold"
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) - 25 + offset,
                })
                .text(film["title"]);

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) - 12.5 + offset,
                })
                .text(paramX + ": " + film[paramX]);

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11
                })
                .attr({
                    x: xScale(film[paramX]) + 15,
                    y: yScale(film[paramY]) + offset,
                })
                .text(paramY + ": " + film[paramY]);

            group.style("opacity", 0);
            group.transition()
                .ease("sin")
                .duration(150)
                .style("opacity", 1)
        })

        circle.on("mouseout", function() {
            svg.select("#tooltip").transition()
                .ease("sin")
                .duration(75)
                .style("opacity", 0)
                .each('end', function() {
                    svg.selectAll("#tooltip").remove()
                });
        })

        winnerPts.push(ptObj);
    });

    //Create scatter representations of year averages
    yrAvgArray.forEach(function(nominees) {
        var circle = svg.append("circle")
            .attr("cx", xScale(+nominees[paramX]))
            .attr("cy", yScale(+nominees[paramY]))
            .attr("r", 10)
            .style("fill", colAvg)
            .style("opacity", 0.7)

        circle.on("mouseover", function() {
            var group = svg.append("g").attr("id", "tooltip")

            group.append("rect")
                .attr({
                    x: xScale(nominees[paramX]) + 10,
                    y: yScale(nominees[paramY]) - 35,
                    height: 25,
                    width: 75,
                })
                .style({
                    fill: "#dddfd4",
                    stroke: "black",
                    "stroke-width": 0,
                    opacity: 0.9
                });

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11,
                    "font-weight": "bold"
                })
                .attr({
                    x: xScale(nominees[paramX]) + 15,
                    y: yScale(nominees[paramY]) - 12.5,
                })
                .text(nominees["year"] + " Average");

            group.append("text")
                .style({
                    "text-anchor": "start",
                    "font-size": 11
                })
                .attr({
                    x: xScale(nominees[paramX]) + 15,
                    y: yScale(nominees[paramY]),
                })
                .text(paramY + ": " + d3.format(".2f")(nominees[paramY]));

            group.style("opacity", 0);
            group.transition()
                .ease("sin")
                .duration(150)
                .style("opacity", 1)
        })

        circle.on("mouseout", function() {
            svg.select("#tooltip").transition()
                .ease("sin")
                .duration(75)
                .style("opacity", 0)
                .each('end', function() {
                    svg.selectAll("#tooltip").remove()
                });
        })
    });

    //Generate linear regression of all points
    var model = linReg(scatterPts);

    var trendline = svg.append("line")
        .attr({
            x1: xScale(minX),
            y1: yScale(model.m * minX + model.b),
            x2: xScale(maxX),
            y2: yScale(model.m * maxX + model.b)
        })
        .style("stroke", colAvg)
        .style("stroke-width", 3)
        .style("opacity", 0.33);

    //Create linear regression of just winners
    var model = linReg(winnerPts);

    var trendline = svg.append("line")
        .attr({
            x1: xScale(minX),
            y1: yScale(model.m * minX + model.b),
            x2: xScale(maxX),
            y2: yScale(model.m * maxX + model.b)
        })
        .style("stroke", colHighlight)
        .style("stroke-width", 3)
        .style("opacity", 0.75);

    function linReg(array) {
        /*Generates linear regression model from data*/
        var lineModel = {
            "m": null,
            "b": null,
            "rSquared": null
        };
        var l = array.length;
        var xSum = 0,
            ySum = 0,
            xySum = 0,
            xxSum = 0,
            yySum = 0;
        array.forEach(function(pt) {
            xSum += +pt.x;
            ySum += +pt.y;
            xySum += +(+pt.x * +pt.y);
            xxSum += +(+pt.x * +pt.x);
            yySum += +(+pt.y * +pt.y);

        });

        lineModel.m = (l * xySum - xSum * ySum) / (l * xxSum - xSum * xSum);
        lineModel.b = (ySum - lineModel.m * xSum) / l;
        lineModel.rSquared = Math.pow((l * xySum - xSum * ySum) / Math.sqrt((l * xxSum - xSum * xSum) * (l * yySum - ySum * ySum)), 2);

        return lineModel
    };
};