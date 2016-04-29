//credit to http://bl.ocks.org/mbostock/1846692
var dou = function() {

var bleed = 50,
    width = 500,
    height = 500,
    height1 = 600,
    width1 = 1000;

var matches = {};
var csvData;

var pack = d3.layout.pack()
    .sort(null)
    .size([width, height + bleed * 2])
    .padding(2);

var svg1 = d3.select("#dou").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(0," + -bleed + ")");

//read two data files
queue()
  .defer(d3.json, 'README.json')
  .defer(d3.csv, 'images.csv')
  .await(drawCircles);

//tooltip
function drawCircles(error, json, images) {
  //console.log(images);
  csvData = images;

  var chars = {};
  images.forEach(function(d) {
    chars[d.name] = {};
    chars[d.name].url = d.url;
    chars[d.name].personal = d.personal;
  });
  if (error) throw error;

  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>FILM SYNOPSIS:</strong> <span style='color:white'>" + chars[d.name].personal + "</span>" +"<img src="+ chars[d.name].url+">" + "</img>";
  })
//assign different classes to each movie. So that based on user input, different option(e.g. A, B, C, D) would trigger associated movies to increase font size 
  var node = svg1.selectAll(".node")
      .data(pack.nodes(flatten(json))
        .filter(function(d) { return !d.children; }))
    .enter().append("g")
      // .attr("id", function(d,i) { console.log(d); return "circle-"+i; })
      .attr("id", function(d,i) { 
        var movieName = d.name.replace(/[^a-z0-9]/gi,'').toLowerCase(); 
        matches[movieName] = 0;
        return movieName;
        // return "circle-"+i; 
      })
      .attr("class", function(d) {
        if (["Room"].indexOf(d.name) != -1) {
          return "q1d q2b q3d q4b q5a font";
        }
        else if(["The Revenant"].indexOf(d.name) != -1) {
          return "q1a q2a q3b q4a q4b q5c font";
        }
        else if(["Mad Max: Fury Road"].indexOf(d.name) != -1) {
          return "q1a q2a q3a q4a q5c font";
        }
        else if(["The Martian"].indexOf(d.name) != -1) {
          return "q1a q2d q3a q4a q5c font";
        }
        else if(["The Big Short"].indexOf(d.name) != -1) {
          return "q1c q2d q3c q4c q5d font";
        }
        else if(["Brooklyn"].indexOf(d.name) != -1) {
          return "q1b q2c q3b q4b q5b font";
        }
        else if(["Spotlight"].indexOf(d.name) != -1) {
          return "q1c q2d q3d q4d q5d font";
        }
        else if(["Bridge of Spies"].indexOf(d.name) != -1) {
          return "q1c q2b q3c q4d q5d font";
        };

      })

      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.call(tip);


  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill","#4d0000")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  node.append("text")
      .text(function(d) { return d.name; })
      //.style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 14); })
      .attr("dy", ".35em")
      .attr("fill","#dddfd4");

};  
   
function flatten(root) {
  var nodes = [];

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    else nodes.push({name: node.name, value: node.size});
  }

  recurse(root);
  return {children: nodes};
}

var svg1 = d3.select("#ques").append("svg")
    .attr("width", width1)
    .attr("height", height1)
    .attr("x","1000")
    .attr("y","30");

finalresult = [0,0,0,0,0,0,0,0];
var movies = ["Room", "The Revenant", "Mad Max: Fury Road", "The Martian", "The Big Short", "Brooklyn", "Spotlight", "Bridge of Spies"]
//Q1
//the text part of Q1
svg1.append("text").attr("class","q1").attr("x","65%").attr("y",30).style("fill","white").text("Question 1: Your life is");
svg1.append("text").attr("class","q1").attr("x","65%").attr("y",50).style("fill","white").text("A: a constant struggle against a harsh world.").attr("alignment-baseline", "central");
svg1.append("text").attr("class","q1").attr("x","65%").attr("y",70).style("fill","white").text("B: a gorgeous journey towards self-acceptance.").attr("alignment-baseline", "central");
svg1.append("text").attr("class","q1").attr("x","65%").attr("y",90).style("fill","white").text("C: a quest to succeed against a system trying to tear you down.").attr("alignment-baseline", "central");
svg1.append("text").attr("class","q1").attr("x","65%").attr("y",110).style("fill","white").text("D: real real small.").attr("alignment-baseline", "central");
// the options (a,b,c,d) part of Q1
svg1.append("circle").attr("class","q1").attr("cx","95%").attr("cy",50).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q1a text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q1a text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q1").remove();
    d3.selectAll(".q2").style("opacity",1);

    finalresult[2]++;
    finalresult[1]++;
    finalresult[3]++;
  })
  .on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q1").attr("cx","95%").attr("cy",70).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q1b text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q1b text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q1").remove();
    d3.selectAll(".q2").style("opacity",1);
    finalresult[5]++; 
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q1").attr("cx","95%").attr("cy",90).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q1c text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q1c text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q1").remove();
    d3.selectAll(".q2").style("opacity",1);
    finalresult[4]++;
    finalresult[7]++;
    finalresult[6]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q1").attr("cx","95%").attr("cy",110).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q1d text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q1d text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q1").remove();
    d3.selectAll(".q2").style("opacity",1);
    finalresult[0]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

//Q2
svg1.append("text").attr("class","q2").attr("x","65%").attr("y",130).style("fill","white").text("Question 2: Right now your outfit is").style("opacity",0);
svg1.append("text").attr("class","q2").attr("x","65%").attr("y",150).style("fill","white").text("A: at least 50% blood and dirt.").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("class","q2").attr("x","65%").attr("y",170).style("fill","white").text("B: one of the few means of self-expression available to you.").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("class","q2").attr("x","65%").attr("y",190).style("fill","white").text("C: the uniform expected of you.").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("class","q2").attr("x","65%").attr("y",210).style("fill","white").text("D: not what you would have picked out for yourself.").style("opacity",0).attr("alignment-baseline", "central");

svg1.append("circle").attr("class","q2").attr("cx","95%").attr("cy",150).style("fill","white").attr("r",7).style("opacity",0)
  .on("click", function() { 
    var currSize = d3.selectAll(".q2a text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q2a text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q2").remove();
    d3.selectAll(".q3").style("opacity",1);
    finalresult[1]++;
    finalresult[2]++; 
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q2").attr("cx","95%").attr("cy",170).style("fill","white").attr("r",7).style("opacity",0).on("click", function() {
    var currSize = d3.selectAll(".q2b text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q2b text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q2").remove();
    d3.selectAll(".q3").style("opacity",1);
    finalresult[0]++;
    finalresult[7]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q2").attr("cx","95%").attr("cy",190).style("fill","white").attr("r",7).style("opacity",0)
  .on("click", function() { 
    var currSize = d3.selectAll(".q2c text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q2c text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q2").remove();
    d3.selectAll(".q3").style("opacity",1);
    finalresult[5]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q2").attr("cx","95%").attr("cy",210).style("fill","white").attr("r",7).style("opacity",0).on("click", function() {
    var currSize = d3.selectAll(".q2d text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q2d text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q2").remove();
    d3.selectAll(".q3").style("opacity",1);
    finalresult[6]++;
    finalresult[3]++;
    finalresult[4]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

//Q3
svg1.append("text").attr("x","65%").attr("y",230).style("fill","white").text("Question 3: Happiness is").attr("class","q3").style("opacity",0);
svg1.append("text").attr("x","65%").attr("y",250).style("fill","white").text("A: a warm gun.").attr("class","q3").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",270).style("fill","white").text("B: the arms of your beloved.").attr("class","q3").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",290).style("fill","white").text("C: large, comforting stacks of money.").attr("class","q3").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",310).style("fill","white").text("D: freedom.").attr("class","q3").style("opacity",0).attr("alignment-baseline", "central");

svg1.append("circle").attr("class","q3").style("opacity",0).attr("cx","95%").attr("cy",250).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q3a text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q3a text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q3").remove();
    d3.selectAll(".q4").style("opacity",1);
    finalresult[2]++;
    finalresult[3]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q3").style("opacity",0).attr("cx","95%").attr("cy",270).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q3b text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q3b text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q3").remove();
    d3.selectAll(".q4").style("opacity",1);
    finalresult[1]++;
    finalresult[5]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q3").style("opacity",0).attr("cx","95%").attr("cy",290).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q3c text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q3c text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q3").remove();
    d3.selectAll(".q4").style("opacity",1);
    finalresult[4]++;
    finalresult[7]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q3").style("opacity",0).attr("cx","95%").attr("cy",310).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q3d text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q3d text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q3").remove();
    d3.selectAll(".q4").style("opacity",1);
    finalresult[0]++;
    finalresult[6]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

//Q4
svg1.append("text").attr("x","65%").attr("y",330).style("fill","white").text("Question 4: Your favorite subject is").attr("class","q4").style("opacity",0);
svg1.append("text").attr("x","65%").attr("y",350).style("fill","white").text("A: physics.").attr("class","q4").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",370).style("fill","white").text("B: art.").attr("class","q4").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",390).style("fill","white").text("C: math.").attr("class","q4").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",410).style("fill","white").text("D: politics.").attr("class","q4").style("opacity",0).attr("alignment-baseline", "central");

svg1.append("circle").attr("class","q4").style("opacity",0).attr("cx","95%").attr("cy",350).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q4a text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q4a text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q4").remove();
    d3.selectAll(".q5").style("opacity",1);
    finalresult[2]++;
    finalresult[1]++;
    finalresult[3]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q4").style("opacity",0).attr("cx","95%").attr("cy",370).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q4b text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q4b text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q4").remove();
    d3.selectAll(".q5").style("opacity",1);
    finalresult[0]++;
    finalresult[1]++;
    finalresult[5]++; 
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q4").style("opacity",0).attr("cx","95%").attr("cy",390).style("fill","white").attr("r",7)
  .on("click", function() { 
    var currSize = d3.selectAll(".q4c text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q4c text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q4").remove();
    d3.selectAll(".q5").style("opacity",1);
    finalresult[4]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q4").style("opacity",0).attr("cx","95%").attr("cy",410).style("fill","white").attr("r",7).on("click", function() {
    var currSize = d3.selectAll(".q4d text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q4d text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q4").remove();
    d3.selectAll(".q5").style("opacity",1);
    finalresult[7]++;
    finalresult[6]++;
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

//Q5
svg1.append("text").attr("x","65%").attr("y",430).style("fill","white").text("Question 5: Your ideal vacation would be").attr("class","q5").style("opacity",0);
svg1.append("text").attr("x","65%").attr("y",450).style("fill","white").text("A: someplace safe. Like a cave, maybe.").attr("class","q5").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",470).style("fill","white").text("B: Paris and only Paris.").attr("class","q5").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",490).style("fill","white").text("C: vacations are for quitters.").attr("class","q5").style("opacity",0).attr("alignment-baseline", "central");
svg1.append("text").attr("x","65%").attr("y",510).style("fill","white").text("D: Any fancy hotel would be enough.").attr("class","q5").style("opacity",0).attr("alignment-baseline", "central");

svg1.append("circle").attr("class","q5").style("opacity",0).attr("cx","95%").attr("cy",450).style("fill","white").attr("r",7)
  .on("click", function() { 
    displayResult();

    var currSize = d3.selectAll(".q5a text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q5a text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q5").remove();
    d3.selectAll(".q6").style("opacity",1);
    finalresult[0]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q5").style("opacity",0).attr("cx","95%").attr("cy",470).style("fill","white").attr("r",7).on("click", function() {
    displayResult();

    var currSize = d3.selectAll(".q5b text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q5b text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q5").remove();
    d3.selectAll(".q6").style("opacity",1);
    finalresult[5]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q5").style("opacity",0).attr("cx","95%").attr("cy",490).style("fill","white").attr("r",7)
  .on("click", function() { 
    displayResult();

    var currSize = d3.selectAll(".q5c text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q5c text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q5").remove();
    d3.selectAll(".q6").style("opacity",1);
    finalresult[2]++;
    finalresult[1]++;
    finalresult[3]++;  
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });

svg1.append("circle").attr("class","q5").style("opacity",0).attr("cx","95%").attr("cy",510).style("fill","white").attr("r",7).on("click", function() {
    displayResult();

    var currSize = d3.selectAll(".q5d text").style("font-size");
    currSize = parseInt(currSize.substring(0,currSize.length-2));
    d3.selectAll(".q5d text").style("font-size", function() { return currSize + 10; });
    d3.selectAll(".q5").remove();
    d3.selectAll(".q6").style("opacity",1);
    finalresult[4]++;
    finalresult[6]++;
    finalresult[7]++; 
  }).on("mouseover", function(d) {
  d3.select(this).style("fill", "blue");
  })                  
  .on("mouseout", function(d) {
    d3.select(this).style("fill", "#fff8ee");
  });
//display the result
svg1.append("text").attr("x","65%").attr("y",530).style("fill","white").text("(Hover over bubbles to see the descriptions) Result:You got").attr("class","q6").style("opacity",0);

  function displayResult() {
    //console.log(finalresult);
    var winCount = d3.max(finalresult);
    var res = [];
    var descRes = [];
    movies.forEach(function(d,i) {
      console.log(d); console.log(i);
      if (finalresult[i] == winCount) res.push(d);
    })
    //get data from the csv file
    _.each(res, function(d) {
      descRes.push(_.findWhere(csvData, {name: d}));
    })

    descRes.forEach(function(d, i) {
      svg1.append("text").attr("x","65%")
        .attr("y", 550)
        .attr("dy", i * 20)
        .style("fill","white").text(d.name).attr("class","q6").style("opacity",0);
    })
  }
}