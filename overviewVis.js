var overviewVis = function overviewVis() {

    var circleIDArray = []; //Relates movie IDs to curYear
    var scatterPts = []; //array of points in scatterplot

    //Svg initialization
    var width = 1.75 * height, //params
        radius = height / 3.15,
        padding = (90 / 550) * height;

    var stdDur = 250;

    var svg = d3.select("#container").append("svg")
        .attr("height", height)
        .attr("width", width)
        .attr("id", "overview");

    var yPos = height / 2, //for center circle
        xPos = (0.26) * width,
        start = (0.475) * width; //starting edge of scatterplot area;

    //Color scheme
    var colCenter = "#4d0000",
        colBckgrd = "#dddfd4",
        colText = "#dddfd4",
        colMovie = "#173e43";

    d3.select("body").style("background", colBckgrd); //assignments and scaling
    d3.select("body").style("font-size", 0.031 * height);
    d3.select("#header").style("background", colMovie);
    d3.select("#headerText").style("color", colBckgrd);

    var curData = allOscars[0].data;

    //Interactivity function to be populated
    var interactivityScatter = null; //Should be amended in the future
    var trendlineGen = null;
    var yScatter, xScatter, xLow, xHigh, yLow, yHigh; //scatter parameters
    var checkbox;

    //Sorting Parameters
    var sortParamTitles = {
        "Runtimes (min)": "runtimes",
        "Domestic Gross ($)": "grossDom",
        "International Gross ($)": "grossWorld",
        "Rotten Tomatoes Score": "rt"
    };
    var sortParams = ["runtimes", "grossDom", "grossWorld", "rt"];

    // Intialize visualization;
    init(curData);

    function init(curYear) {

        //scaling based off curve fit of tested circle radii
        var cirScale = curYear.length * (0.3705 + ((661389 - 0.3705) / (1 + Math.pow((curYear.length / 0.00135), 1.756))));

        var cirR = radius / (cirScale); //data circle radii
        var centerR = 0.65 * radius; //center circle radius
        var yScale = d3.scale.linear().domain([-1, 1]).range([(yPos + centerR), (yPos - centerR)]);

        var sortParam = sortParams[0]; //default sorting parameter

        //Sorts studio data based on rating
        function compare(a, b) {
            if (+a.data[sortParam].text < +b.data[sortParam].text) {
                return -1
            } else if (+a.data[sortParam].text > +b.data[sortParam].text) {
                return 1
            } else {
                return 0
            };
        }

        curYear.sort(compare)

        //Determines path points for startup animation of overview circle
        function circlePath(radius) {
            var points = [],
                n = 1000;
            for (var i = 0; i < n; i++) {
                var x = xPos + radius * Math.cos(i * Math.PI / (n / 2)),
                    y = yPos - radius * Math.sin(i * Math.PI / (n / 2));
                points.push([x, y]);
            };

            return points
        };

        pathPoints = circlePath(radius); //scaled to radius

        //Selects points for data circles
        var specPoints = [],
            step = pathPoints.length / curYear.length;
        for (var i = 0; i < curYear.length; i++) {
            specPoints.push(pathPoints[Math.floor(i * step)]);
        };

        //Array manipulation for data circle generation
        specPoints.push(specPoints[0]); //places first point last
        specPoints.shift(); //eliminates first point (i.e. spawn circle)
        var extraPts = specPoints.slice();

        //Create transition path
        var path = svg.append("path")
            .data([pathPoints])
            .attr("d", d3.svg.line()
                .tension(0) //Catmull-Rom interpolation
                .interpolate("cardinal-closed"))
            .style("opacity", 0);

        var c = 65; //Movie ID counter (65 ==> 'A')

        //Begin Transitions
        svg.append("circle")
            .attr({
                cx: xPos,
                cy: yPos,
                r: 0,
                class: "reel"
            })
            .style("fill", colMovie)
            .style("stroke", "black")
            .style("stroke-width", 5)
            .transition()
            .ease("bounce")
            .duration(1.75 * stdDur)
            .attr("r", 1.325 * radius)
            .each('end', function() {

                //Initialize spawning circle
                var circle = svg.append("circle")
                    .attr("r", 0)
                    .attr("id", "spwn")
                    .style("fill", colCenter)
                    .attr("transform", "translate(" + pathPoints[0] + ")")
                    .transition()
                    .duration(0.5 * stdDur)
                    .attr("r", cirR);

                circleTransition(circle); //overview circle initialization
                scatter(curYear); //scatterplot initialization
            });

        function circleTransition(circle) { //Transition 1 : Loading Animation
            /*Handles animation of overview interface*/
            circle.transition() //Initialized T#1
                .duration(2.0 * stdDur)
                .attrTween("transform", translateAlong(path.node())) //transition function
                .each('end', function() { //End of Transition 1
                    svg.select("#spwn").remove(); //remove spawning circle
                    svg.select("path").remove();
                    svg.selectAll("#tmp").remove();
                    for (var i = 0; i < curYear.length; i++) { //replaces placeholders with data circles (fixes animation bug)
                        svg.append("circle") //data circle in place of spawn
                            .attr({
                                r: cirR,
                                cx: extraPts[i][0],
                                cy: extraPts[i][1],
                                id: String.fromCharCode(c)
                            })
                            .style("fill", colCenter);

                        circleIDArray.push({
                            "id": String.fromCharCode(c),
                            "ref": null
                        }); //create map of IDs to dataset
                        c++;
                    };
                    fillChange(); //Init Transiton 2
                });
        }

        function translateAlong(path) {
            /*Translates spawn circle along specified path and initializes placeholders for new data circles*/
            var pathL = path.getTotalLength();

            return function(d, i, a) {
                return function(t) {
                    var pt = path.getPointAtLength(t * pathL);
                    //spawn new data circle near specPoint
                    if ((specPoints.length != 0) &&
                        ((Math.abs(pt.x - specPoints[0][0]) < 0.05 * pathL) && (Math.abs(pt.y - specPoints[0][1]) < 0.05 * pathL))) {
                        var circle = svg.append("circle") //temporary transition circles
                            .attr({
                                r: 0,
                                cx: specPoints[0][0],
                                cy: specPoints[0][1],
                                id: "tmp"
                            })
                            .style("fill", colCenter);

                        specPoints.shift(); //remove first specPoint

                        circle.transition()
                            .attr("r", cirR)
                            .delay(0.1 * stdDur)
                            .duration(0.5 * stdDur);
                    };
                    return "translate(" + pt.x + "," + pt.y + ")";
                };
            };
        };

        function fillChange() { //Transition 2 : Center Circle
            /*Alters fill of data circles to show respective movie posters */
            var centerCircle = svg.append("circle") //overview circle in center
                .attr("r", 0)
                .attr("cx", xPos)
                .attr("cy", yPos)
                .attr("id", "center")
                .style("fill", colCenter)
                .style("stroke", "black")
                .style("stroke-width", 5)
                .transition() //Initialize Center Circle Transition
                .ease("elastic")
                .duration(1.25 * stdDur)
                .attr("r", centerR)
                .each('end', function() { //Transition 3 : Fill Movie Images
                    var defs = svg.append('svg:defs'); //container for fill images
                    for (var i = 0; i < curYear.length; i++) {
                        var id = curYear[i].movie.replace(/[^A-Z0-9]+/ig, "_"), //poster id
                            w = curYear[i].data.cover.w, //poster width
                            h = curYear[i].data.cover.h; //poster height

                        var scale = 2 * cirR / w; //Scaling factor for images 

                        var curCircle = svg.select("#" + circleIDArray[i].id); //select current circle

                        circleIDArray[i].ref = curYear[i]; //link reference ID of circle to dataset

                        defs.append("svg:pattern") //reference pattern for specific image
                            .attr("id", id)
                            .attr("width", 1)
                            .attr("height", 1)
                            .attr("x", "0")
                            .attr("y", "0")
                            .append("svg:image") //reference image & sizing
                            .attr("xlink:href", curYear[i].data.cover.url)
                            .attr("width", w * scale)
                            .attr("height", h * scale)
                            .attr("x", 0)
                            .attr("y", -h / 8); //slight image centering

                        curCircle.transition() //Image Loading
                            .duration(0.5 * stdDur)
                            .style("opacity", 0)
                            .transition()
                            .style("fill", "url(#" + id + ")")
                            .transition()
                            .duration(0.5 * stdDur)
                            .style("opacity", 1)
                            .each('end', interactivity(id));

                        if (!!winners) {
                        winners.forEach(function(winner) { //winner array in global scope
                            if (curYear[i].movie == winner) {
                                curCircle.transition()
                                    .delay(500)
                                    .duration(1000)
                                    .style({
                                        stroke: "yellow",
                                        "stroke-width": 3
                                    })
                            }
                        })
                    };

                    };
                    sortFunc(); //Load sorting function in dropdown menu
                    dataFilterButtons(); //Load Data filter buttons
                });
        };

        function interactivity(id) {
            /*Interactivity function for all data circles*/
            circleIDArray.forEach(function(obj) {
                var curCircle = svg.select("#" + obj.id);
                curCircle.on("mouseover", function(d, i) {

                        //Opacity Changes
                        circleIDArray.forEach(function(c) { //data circle lower
                            svg.select("#" + c.id).transition()
                                .duration(250)
                                .style("opacity", 0.25);
                        });

                        curCircle.transition() //current circle maintain
                            .duration(250)
                            .style("opacity", 1.0);

                        scatterPts.forEach(function(c) { //scatter points lower
                            svg.select("#" + c.graphic[0][0].id).transition()
                                .duration(250)
                                .style("opacity", 0.25);
                        });

                        circleIDArray.forEach(function(film) { //find film reference for point
                            if (film.ref.movie == obj.ref.movie) {
                                console.log(id)
                                svg.select("#" + film.ref.movie.replace(/[^A-Z0-9]+/ig, "_") + "pt").transition() //current point maintain
                                    .duration(250)
                                    .style("opacity", 1.0);
                            };
                        });

                        var group = svg.append("g");

                        //Text Data
                        var p = [0.475, 0.275, 0.1, -0.075, -0.25, -0.425]; //placement array

                        group.append("text") //title
                            .attr("x", xPos)
                            .attr("y", yScale(p[0]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .style("font-weight", "bold")
                            .text(function(d, i) {
                                return obj.ref.movie;
                            });

                        group.append("text") //Rating
                            .attr("x", xPos)
                            .attr("y", yScale(p[4]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .text(function(d, i) {
                                return "IMDb Rating: " + obj.ref.data.rating.text;
                            })

                        group.append("text") //Runtime
                            .attr("x", xPos)
                            .attr("y", yScale(p[5]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .text(function(d, i) {
                                return "Runtime: " + obj.ref.data.runtimes.text;
                            });

                        group.append("text") //Domestic Gross
                            .attr("x", xPos)
                            .attr("y", yScale(p[1]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .text(function(d, i) {
                                return "Domestic Gross: " + d3.format("$,")(obj.ref.data.grossDom.text);
                            });

                        group.append("text") //International Gross
                            .attr("x", xPos)
                            .attr("y", yScale(p[2]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .text(function(d, i) {
                                return "International Gross: " + d3.format("$,")(obj.ref.data.grossWorld.text);
                            });

                        group.append("text") //Rotten Tomatoes
                            .attr("x", xPos)
                            .attr("y", yScale(p[3]))
                            .attr("id", id + "text")
                            .style("text-anchor", "middle")
                            .style("font-size", 0.025 * height)
                            .style("fill", colText)
                            .text(function(d, i) {
                                return "Rotten Tomatoes Score: " + obj.ref.data.rt.text;
                            });

                        group.style("opacity", 0)
                            .transition()
                            .duration(0.5 * stdDur)
                            .style("opacity", 1)

                    })
                    .on("mouseout", function() {
                        circleIDArray.forEach(function(c) {
                            svg.select("#" + c.id).transition()
                                .duration(250)
                                .style("opacity", 1.0);
                        });

                        scatterPts.forEach(function(c) {
                            svg.select("#" + c.graphic[0][0].id).transition()
                                .duration(250)
                                .style("opacity", 1.0);
                        });

                        svg.selectAll("#" + id + "text").transition()
                            .duration(250)
                            .style("opacity", 0);

                        svg.selectAll("#" + id + "text").remove();
                    });
            });
        };

        function sortFunc() {
            var spacerBar = d3.select("#spacer"),
                group = spacerBar.append("g").attr("id", "controls");

            group.append("text").text("Parameters: ");
            group.append("select").attr("id", "slider");
            group.append("text").text(" Trendline:");
            checkbox = group.append("input").attr("type", "checkbox").attr("id", "trendlineBox");

            checkbox.on("click", function() {
                if (checkbox[0][0].checked) {
                    sortScatter();
                } else {
                    svg.select("#trendline")
                        .transition()
                        .duration(0.5 * stdDur)
                        .style("opacity", 0)
                        .each('end', function() {
                            this.remove()
                        });

                };
            });

            var dropdown = d3.select("#slider").on("change", function() {
                    sortMovies()
                    sortScatter()
                }),
                options = dropdown.selectAll('option').data(Object.keys(sortParamTitles));

            options.enter().append("option").text(function(d) {
                return d;
            });

            function sortMovies() {

                var idx = dropdown.property('selectedIndex'),
                    selection = sortParamTitles[dropdown[0][0][idx].innerText];

                function compare(a, b) {
                    if (+a.ref.data[selection].text < +b.ref.data[selection].text) {
                        return -1
                    } else if (+a.ref.data[selection].text > +b.ref.data[selection].text) {
                        return 1
                    } else {
                        return 0
                    };
                };

                unsortedArray = circleIDArray.slice();
                circleIDArray.sort(compare);
                newArray = [];
                for (var i = 0; i < unsortedArray.length; i++) {
                    newArray.push({
                        "id": unsortedArray[i].id,
                        "ref": circleIDArray[i].ref
                    });
                }

                for (var i = 0; i < circleIDArray.length; i++) {

                    //Rearranging overview circles
                    var curCircle = svg.select("#" + unsortedArray[i].id),
                        idNew = circleIDArray[i].ref.movie.replace(/[^A-Z0-9]+/ig, "_");

                    curCircle.transition() //Image Loading
                        .duration(stdDur)
                        .style("opacity", 0)
                        .transition()
                        .style("opacity", 1)
                        .style("fill", "url(#" + idNew + ")")
                        .style("stroke", colMovie)
                        .each('end', interactivity(idNew));

                }
                circleIDArray = newArray;
            }
        };

        function reset() {
            svg.selectAll("circle")
                .transition()
                .ease("circle")
                .duration(stdDur)
                .style("opacity", 0)
                .each('end', function() {
                    this.remove();
                });

            svg.selectAll(["rect", ".text", "#scatter", "#scatterY", "g", "#controls", "#trendline"])
                .transition()
                .ease("circle")
                .duration(stdDur)
                .style("opacity", 0)
                .each('end', function() {
                    this.remove();
                });

            d3.select("#spacer").selectAll('*')
                .transition()
                .duration(stdDur)
                .style("opacity", 0)
                .each('end', function() {
                    this.remove()
                });

            circleIDArray = [];
            init(curData);
        };

        function dataFilterButtons() {
            //Generate dataset buttons
            var buttons = [];

            for (var i = 0; i < allOscars.length; i++) {
                var button = svg.append("g").attr("id", (allOscars[i].name.replace(/[^A-Z0-9]+/ig, "_") + "bttn"));

                button.append("rect")
                    .attr({
                        x: (xPos * (Math.floor(allOscars.length / 2) + i + 1) / allOscars.length - width / 12 + 30 * (i + 1) - 55), //position + padding + spacing
                        y: 0,
                        height: height / 16,
                        width: width / 12,
                    })
                    .style("fill", colMovie);

                button.append("text")
                    .attr("x", (xPos * (Math.floor(allOscars.length / 2) + i + 1) / allOscars.length - width / 12 + 30 * (i + 1) - 55) + width / 24)
                    .attr("y", height / 32 + 5)
                    .text(function(d) {
                        return allOscars[i].name
                    })
                    .style("text-anchor", "middle")
                    .style("font-size", 11)
                    .style("font-weight", "bold")
                    .style("fill", colBckgrd);

                buttons.push({
                    "id": (allOscars[i].name.replace(/[^A-Z0-9]+/ig, "_") + "bttn"),
                    "studio": allOscars[i]
                })
            };

            //Add low opacity to current button, interactivity to others
            buttons.forEach(function(obj) {
                var bttn = svg.select("#" + obj.id);
                if (obj.studio.data == curData) {
                    bttn.style("opacity", 0.5);
                } else {
                    bttn.on("mouseover", function() {
                        bttn.style("opacity", 0.5);
                        d3.select('body').style('cursor', 'pointer');
                    });

                    bttn.on("mouseout", function() {
                        bttn.style("opacity", 1);
                        d3.select('body').style('cursor', 'default');
                    });

                    bttn.on("click", function(d) {
                        //new dataset
                        curData = obj.studio.data;
                        //Animate out and remove
                        reset();
                    });
                };
            });
        };


        function scatter(curYear) {

            var svg = d3.select("#overview");

            var points = [],
                maxY = 0,
                minY = Infinity,
                minX = Infinity,
                maxX = 0;

            var selection = sortParams[0]

            var xParam = "rating";

            curYear.forEach(function(obj) {
                points.push({
                    "x": +obj.data[xParam].text,
                    "y": +obj.data[selection].text,
                    "id": obj.movie
                });

                if (+points[points.length - 1].y > maxY) {
                    maxY = points[points.length - 1].y;
                };
                if (+points[points.length - 1].x > maxX) {
                    maxX = points[points.length - 1].x;
                };
                if (+points[points.length - 1].y < minY) {
                    minY = points[points.length - 1].y;
                };
                if (+points[points.length - 1].x < minX) {
                    minX = points[points.length - 1].x;
                };
            });

            xLow = 0.85 * minX,
                xHigh = maxX,
                yLow = 0.9 * minY,
                yHigh = 1.1 * maxY,
                xScatter = d3.scale.linear().domain([xLow, xHigh]).range([start + 1.25 * padding, width - padding]),
                yScatter = d3.scale.linear().domain([yLow, yHigh]).range([(0.85 * padding) + (height - 1.75 * padding) + 1, 0.375 * padding]);

            var xAxis = d3.svg.axis().orient("bottom").scale(xScatter).ticks(6);

            var yAxis = d3.svg.axis().orient("left").scale(yScatter);

            //Parameter specific formatting
            if (minY > 3e4) {
                yxis.tickFormat(d3.format(",.1e"))
            } else if (selection == "year") {
                yAxis.tickFormat(d3.format("d"))
            };

            var yLine = svg.append("line")
                .attr({
                    x1: xScatter(xLow),
                    y1: yScatter(yHigh),
                    x2: xScatter(xLow),
                    y2: yScatter(yHigh),
                    id: "scatter"
                })
                .style({
                    "stroke": colMovie,
                    "stroke-width": 3,
                });

            yLine.transition()
                .duration(2 * stdDur)
                .ease("linear")
                .attr({
                    y2: yScatter(yLow)
                })
                .each('end', function() {
                    var xLine = svg.append("line")
                        .attr({
                            x1: xScatter(xLow),
                            y1: yScatter(yLow),
                            x2: xScatter(xLow),
                            y2: yScatter(yLow),
                            id: "scatter"
                        })
                        .style({
                            "stroke": colMovie,
                            "stroke-width": 3,
                        });

                    xLine.transition()
                        .duration(2 * stdDur)
                        .ease("linear")
                        .attr({
                            x2: xScatter(xHigh)
                        })
                        .each('end', ticks)
                });

            function ticks() {
                var xTicks = svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (yScatter(yLow) + 5) + ")")
                    .attr("id", "scatter")
                    .style("opacity", 0)
                    .style("fill", colMovie)
                    .call(xAxis);

                var yTicks = svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + (xScatter(xLow) - 5) + ", 0)")
                    .attr("id", "scatterY")
                    .style("fill", colMovie)
                    .style("opacity", 0)
                    .call(yAxis);

                xTicks.transition()
                    .duration(0.3 * stdDur)
                    .style("opacity", 1);

                yTicks.transition()
                    .duration(0.3 * stdDur)
                    .style("opacity", 1)
                    .each('end', dataPoints);

                var xLabel = svg.append("text")
                    .style("text-anchor", "middle")
                    .style("opacity", 0)
                    .style("fill", colMovie)
                    .text(((xParam == "rt") ? "RT Critic Score" : "IMDb Rating"))
                    .attr({
                        x: xScatter((xHigh + xLow) / 2),
                        y: height - padding + 0.625 * padding,
                        id: "scatter",
                    })
                    .transition()
                    .duration(0.3 * stdDur)
                    .style("opacity", 1);

            };

            function dataPoints() {
                var dataPtArray = [];
                points.forEach(function(pt) {
                    var svgPt = svg.append("circle")
                        .attr({
                            r: 0,
                            cx: xScatter(pt.x),
                            cy: yScatter(pt.y),
                            id: (pt.id).replace(/[^A-Z0-9]+/ig, "_") + "pt"
                        })
                        .style({
                            fill: colCenter,
                            stroke: colText,
                            "stroke-width": 1
                        });

                    var dataPt = {
                        "data": {
                            "x": xScatter(pt.x),
                            "y": yScatter(pt.y)
                        },
                        "id": ((pt.id).replace(/[^A-Z0-9]+/ig, "_") + "pt_data"),
                        "graphic": svgPt
                    };

                    dataPtArray.push(dataPt);
                });

                dataPtArray.forEach(function(dataPt) {
                    var svgPt = dataPt.graphic;
                    svgPt.transition()
                        .duration(0.25 * stdDur)
                        .ease("exp")
                        .attr("r", 5)
                        .each('end', interactivityScatter(dataPtArray, dataPt.id));
                });

                scatterPts = dataPtArray;
            };

            interactivityScatter = function interactivityScatter(array, id) {
                //Interactivity
                array.forEach(function(obj) {

                    var id = obj.graphic[0][0].id;
                    var curCircle = svg.select("#" + id);
                    var refMovie = null; //relevant movie data

                    curCircle.on("mouseover", function(d, i) {

                            //Opacity Changes
                            array.forEach(function(c) {
                                svg.select("#" + c.graphic[0][0].id).transition()
                                    .duration(250)
                                    .style("opacity", 0.25);
                            });
                            curCircle.transition()
                                .duration(250)
                                .style("opacity", 1.0);

                            circleIDArray.forEach(function(film) {
                                if ((film.ref.movie.replace(/[^A-Z0-9]+/ig, "_") + "pt") == id) {
                                    refMovie = film;
                                };
                            });

                            circleIDArray.forEach(function(c) {
                                svg.select("#" + c.id).transition()
                                    .duration(250)
                                    .style("opacity", 0.25);
                            });

                            svg.select("#" + refMovie.id).transition()
                                .duration(250)
                                .style("opacity", 1.0);

                            //Text Data
                            var p = [0.5, 0.275, 0.1, -0.075, -0.25, -0.425];
                            //placement array

                            var group = svg.append("g");

                            group.append("text") //title
                                .attr("x", xPos)
                                .attr("y", yScale(p[0]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.03 * height)
                                .style("fill", colText)
                                .style("font-weight", "bold")
                                .text(function(d, i) {
                                    return refMovie.ref.movie;
                                });

                            group.append("text") //Rating
                                .attr("x", xPos)
                                .attr("y", yScale(p[4]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.025 * height)
                                .style("fill", colText)
                                .text(function(d, i) {
                                    return "IMDb Rating: " + refMovie.ref.data.rating.text;
                                })

                            group.append("text") //Domestic Gross
                                .attr("x", xPos)
                                .attr("y", yScale(p[1]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.025 * height)
                                .style("fill", colText)
                                .text(function(d, i) {
                                    return "Domestic Gross: " + d3.format("$,")(refMovie.ref.data.grossDom.text);
                                });

                            group.append("text") //Domestic Gross
                                .attr("x", xPos)
                                .attr("y", yScale(p[2]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.025 * height)
                                .style("fill", colText)
                                .text(function(d, i) {
                                    return "International Gross: " + d3.format("$,")(refMovie.ref.data.grossWorld.text);
                                });

                            group.append("text") //Runtime
                                .attr("x", xPos)
                                .attr("y", yScale(p[5]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.025 * height)
                                .style("fill", colText)
                                .text(function(d, i) {
                                    return "Runtime: " + refMovie.ref.data.runtimes.text;
                                });

                            group.append("text") //Rotten Tomatoes
                                .attr("x", xPos)
                                .attr("y", yScale(p[3]))
                                .attr("id", refMovie.id + "text")
                                .style("text-anchor", "middle")
                                .style("font-size", 0.025 * height)
                                .style("fill", colText)
                                .text(function(d, i) {
                                    return "Rotten Tomatoes Score: " + refMovie.ref.data.rt.text;
                                });

                            group.style("opacity", 0)
                                .transition()
                                .duration(0.3 * stdDur)
                                .style("opacity", 1)

                        })
                        .on("mouseout", function() {
                            array.forEach(function(c) {
                                svg.select("#" + c.graphic[0][0].id).transition()
                                    .duration(250)
                                    .style("opacity", 1.0);
                            });

                            circleIDArray.forEach(function(c) {
                                svg.select("#" + c.id).transition()
                                    .duration(250)
                                    .style("opacity", 1.0);
                            });

                            svg.selectAll("#" + refMovie.id + "text").transition()
                                .duration(250)
                                .style("opacity", 0);

                            svg.selectAll("#" + refMovie.id + "text").remove();
                        });
                });
            };
        };

        function sortScatter() {
            /*Assigns sorting functionality to dropdown menu when change is detected*/

            //Obtain new sort selection
            var idx = d3.select("#slider").property('selectedIndex'),
                selection = sortParamTitles[d3.select("#slider")[0][0][idx].innerText];

            //Remove old yAxis
            var yAxis = d3.selectAll("#scatterY");
            yAxis.transition().style("opacity", 0);
            yAxis.remove();

            //Reformat yScale based on new parameter
            var minY = Infinity,
                maxY = null;
            circleIDArray.forEach(function(obj) {
                if (+obj.ref.data[selection].text > maxY) {
                    maxY = +obj.ref.data[selection].text
                };
                if (+obj.ref.data[selection].text < minY) {
                    minY = +obj.ref.data[selection].text
                };
            });

            if (selection == "year") {
                var yLow = minY - 1,
                    yHigh = maxY + 1;
            } else {
                var yLow = 0.9 * minY,
                    yHigh = 1.1 * maxY;
            };

            yScatter = d3.scale.linear().domain([yLow, yHigh]).range([(0.85 * padding) + (height - 1.75 * padding) + 1, 0.375 * padding]);

            var newAxis = d3.svg.axis().orient("left").scale(yScatter);

            if (selection == "grossDom" || selection == "grossWorld") {
                newAxis.tickFormat(d3.format("$2e"))
            } else if (minY > 3e4) {
                newAxis.tickFormat(d3.format(",.1e"))
            } else if (selection == "year") {
                newAxis.tickFormat(d3.format("d"))
            };

            //Initialize new yAxis
            var yTicks = svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + (xScatter(xLow)) + ", 0)")
                .attr("id", "scatterY")
                .style("opacity", 0)
                .style("text-anchor", "end")
                .call(newAxis);

            yTicks.transition()
                .duration(0.3 * stdDur)
                .style("fill", colMovie)
                .style("opacity", 1);

            //Reorganize scatter points and generate trendline
            for (var i = 0; i < circleIDArray.length; i++) {

                //Rearrange scatter points
                var id = "#" + circleIDArray[i].ref.movie.replace(/[^A-Z0-9]+/ig, "_") + "pt",
                    curCircle = svg.select(id);

                curCircle.transition()
                    .ease("sin")
                    .duration(0.5 * stdDur)
                    .attr("cy", yScatter(circleIDArray[i].ref.data[selection].text))
                    .each('end', function() {
                        interactivityScatter(scatterPts, id)
                    });

                //Change data in scatterPts array to reflect change
                scatterPts.forEach(function(pt) {
                    if ((pt.id).replace(/[^A-Z0-9]+/ig, "_") == (circleIDArray[i].ref.movie.replace(/[^A-Z0-9]+/ig, "_") + "pt_data")) {
                        pt.data.y = yScatter(circleIDArray[i].ref.data[selection].text);
                    };
                });
            };

            //Optional trendline generation
            if (checkbox[0][0].checked) {
                trendlineGen();
            }

            function trendlineGen() {

                //Remove current trendline
                d3.select("#trendline").remove();

                //Extract relevant scatter data from dataset
                var trendPts = [];
                scatterPts.forEach(function(pt) {
                    trendPts.push({
                        "x": pt.data.x,
                        "y": pt.data.y
                    });
                });

                var model = linReg(trendPts);

                //Input values spaced away from axes//

                //x1 bound lower
                if (((model.m) * (xScatter(xLow)) + model.b) > (yScatter(yLow))) {
                    var i1 = (yScatter(yLow) - (1 / 32) * (yScatter(yLow) - yScatter(yHigh)) - model.b) / model.m;
                } else {
                    var i1 = xScatter(xLow) + padding * 0.25;
                };

                //x2 bound higher
                if (((model.m) * (xScatter(xHigh)) + model.b) < (yScatter(yHigh))) {
                    var i2 = (yScatter(yHigh) + (1 / 32) * (yScatter(yLow) - yScatter(yHigh)) - model.b) / model.m;
                } else {
                    var i2 = xScatter(xHigh) - padding * 0.25;
                };

                svg.append("line")
                    .attr({
                        x1: i1,
                        y1: ((model.m) * (i1) + model.b),
                        x2: i1,
                        y2: ((model.m) * (i1) + model.b),
                        id: "trendline"
                    })
                    .style({
                        "stroke": colMovie,
                        "stroke-width": 3.5,
                        "opacity": 0.5
                    });

                svg.select("#trendline").transition()
                    .duration(0.5 * stdDur)
                    .ease("linear")
                    .attr({
                        x2: i2,
                        y2: ((model.m) * (i2) + model.b),
                    });

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
        };
    };
};