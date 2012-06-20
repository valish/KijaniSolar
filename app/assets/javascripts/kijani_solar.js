kijani = {};
kijani.sensors = [
    {id: "heater", on: 1, color: "#0000ff", text: "H", current: 0},
    {id: "living_room", on: 1, color: "#0AFFC4", text: "LR", current: 0},
    {id: "washer", on: 1, color: "#14ff00", text: "W", current: 0},
    {id: "dryer", on: 1, color: "#CCFF00", text:"D", current: 0},
];

function kijani_solar() {

var currents = [ 0,0,0,0 ];
var datas = [ [],[],[],[] ];
var forecasts = [ [],[],[],[] ];

var consumption_data = [];
var consumption_forecast = [];

var production_data = [];
var production_forecast = [];

var bars_data = [];

var line_transform_duration = 1000;

//var now = 6;
/////////////////////////////////////////////////////////////
//testing
var heater = [
1,1,1,1,10,9,1,1,1,1,1,1,1,1,2,1,1,5,10,15,14,1,1,1
];
var living_room = [
0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,5,4,7,7,7,2,0,0
];
var washer = [
0,0,0,0,0,13,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];
var dryer = [
0,0,0,0,0,0,14,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
];

var production = [
0,0,0,0,0,0,200,300,500,700,1000,1200,1200,1200,1100,1000,700,700,600,500,10,0,0,0
];
var production_domain = _.map(d3.range(24), function(d) {
    return d;
});
var production_scale = d3.scale.linear()
    .domain(production_domain)
    .range(production);


var production_color = "#00ff00";
var consumption_color = "#FF0000";
var stroke_width = 3;

var arc = d3.svg.arc();
var donut = d3.layout.pie();

kijani.update_lines = function(g) {
    //need the element to get style
    var sw = parseInt(g.style("width"), 10);
    var sh = parseInt(g.style("height"), 10);
    //var sw = 500;
    //var sh = 100; 
    
    d3.select("#line_clip")
        .select("rect")
        //.attr("x", 50)
        //.attr("width", sw)
        .attr("width", sw-60)
        .attr("height", sh*2);

    var y_max = d3.max([d3.max(consumption_data), d3.max(production_data)]);
    //var y_max = 40;

    var y_range = sh;
    var x_range = sw;
    var y_scale = d3.scale.linear()
        .domain([0, y_max])
        .range([y_range, 10]);
    var bar_y_scale = d3.scale.linear()
        .domain([0, y_max])
        .range([0, y_range]);
        
    var x_scale = d3.scale.linear()
        .domain([0,24])
        .range([0, x_range]);

    var line = d3.svg.line()
        .x(function(d, i) {
            return x_scale(i);
        })
        .y(function(d, i) {
            return y_scale(d);
        })
        .interpolate("basis");
     
    //process_data();
    var lines = g.select(".lines");


    line_transform_x = x_range - 100;
    //line_transform_y = y_range - 10;
    line_transform_y = 0;
    var x = line_transform_x - x_scale(consumption_data.length);
    var y = line_transform_y - 5;
    lines.transition()
        .duration(line_transform_duration)
        .attr("transform", "translate(" + [x, y] + ")");

/*    lines.select("#consumption_forecast")
        .data([consumption_forecast])
        .attr("d", line)*/
            //.attr("transform", null)
            //.transition()
            //.ease("linear")
            //.attr("transform", "translate(" + x_scale(-1) + ")");
    //consumption_forecast.shift();

    lines.select("#consumption_data")
        .data([consumption_data])
        .attr("d", line)
        .attr("stroke-linecap", "round")
            //.attr("transform", null)
            //.transition()
            //.ease("linear")
            //.attr("transform", "translate(" + x_scale(-1) + ")");
    //console.log(consumption_data)
    //consumption_data.shift();

/*    lines.select("#production_forecast")
        .data([production_forecast])
        .attr("d", line);*/
    lines.select("#production_data")
        .data([production_data])
        .attr("d", line)
        .attr("stroke-linecap", "round");


    //add a new bar
    var bars = g.select(".lines")
        .selectAll("rect.bar")
        .data(bars_data);
    bars.enter()
        .append("rect")
        .classed("bar", true);

    var colors = ["#ff0000", "#00ff00"];
    bars.attr("width", x_scale(1))
        .attr("height", function(d,i) {
            return bar_y_scale(d.val);
        })
        .attr("y", function(d,i) {
            return y_scale(d.y);
        })
        .attr("x", function(d,i) {
            return x_scale(i) - x_scale(1.25);
        })
        .style("fill", function(d,i) {
            return colors[d.good];
        })
        .style("fill-opacity", 0.5)
        .attr("rx", function(d,i) {
            return Math.abs(d.good - 1) * x_scale(1)/2;
        })
        .attr("ry", function(d,i) {
            return Math.abs(d.good - 1) * x_scale(1)/2;
        })
    bars.exit().remove();

};

kijani.update_text = function() {
    //update the status indicator
    //#status_producing  
    //#status_consuming
    var d = bars_data[bars_data.length-num_forecast];
    var dm1 = bars_data[bars_data.length-num_forecast-1];
    if(d.good) {
        d3.select("#status_producing").style("display", "")
        d3.select("#status_consuming").style("display", "none")
    } else {
        d3.select("#status_consuming").style("display", "")
        d3.select("#status_producing").style("display", "none")
    }

    if(!dm1.good && d.good) {
        console.log("changed from bad to good!");
        var amount = Math.abs(kijani.saving - kijani.cost);
        amount = d3.format(".2g")(amount);
        var msg = "I just went net energy positive! That is an energy surplus worth $" + amount + "/kWh #cleanweb";
        console.log(msg);
        $.get("http://localhost:8000/tweet?msg=" + msg, function(data) {
            console.log("tweet response", data);
        });
    }
    //
};


kijani.update_pie = function(g) {
    var sw = parseInt(g.style("width"), 10);
    var sh = parseInt(g.style("height"), 10);
    var r = Math.min(sw, sh)/2;
    //var consumption_max = d3.max(consumption_data);
    //var r = 30 + 120 * (consumption_data[now-1] / consumption_max);
    //var r = 120;
    
    arc.outerRadius(r);
    var pie_data = _.map(kijani.sensors, function(d,i) {
        //console.log(d.current, d.on)
        return d.current * d.on;
    });

    var pies = g.selectAll("g.pies")
        .data([pie_data]);
    pies.enter()
        .append("g")
        .classed("pies", true)
        .attr("transform", "translate(" + [0, 0] + ")");

    var pie_arcs = pies.selectAll("g.pie_arc")
        .data(donut);

    pie_arcs.enter()
        .append("g")
        .classed("pie_arc", true)
        .attr("transform", "translate(" + [r, r] + ")")
        .append("path");


    pie_paths = pies.selectAll("g.pie_arc")
        .select("path")
        .attr("d", arc)
        .attr("class", function(d,i) {
            return kijani.sensors[i].id;
        })
        .attr("fill", function(d,i) {
            return kijani.sensors[i].color;
        });

};


var make_ui = function(g) {
    //UI skeleton
    var ui = g.append("g")
        .classed("ui", true)
        .attr("transform", "translate(" + [40, 400] + ")");

    var button_width = 50;
    var button_height = button_width;
    var button_color = "#e3e3e3";
    var button_colors = ["#e3e3e3", "#cc2222"];

    var buttons = ui.selectAll("g.button")
        .data(kijani.sensors)
        .enter()
        .append("g")
        .classed("button", true)
        .attr("transform", function(d,i) {
            return "translate(" + [i * 70, 0] + ")";
        });

    buttons.append("rect")
        .attr("width", button_width)
        .attr("height", button_height)
        .style("fill", function(d,i) {
            return button_colors[d.on];
        })
        .style("fill-opacity", 0.5)
        .style("stroke", function(d,i) {
            return d.color;
        })
        .style("stroke-width", stroke_width)
        .on("click", function(d,i) {
            d.on = !d.on;
            kijani.forecast();
            kijani.update_lines(g);
            //update_pie(g);
            d3.select(this)
                .style("fill", button_colors[d.on * 1]);
        });
    buttons.append("text")
        .text(function(d,i) {
            return d.text;
        })
        .attr("pointer-events", "none")
        .style("font-size", 40)
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .attr("transform", "translate(" + [button_width/2, button_height/2 + 5] + ")");
       
};

/*
var k = 0;
for(k;k<now;k++) {
    new_data([heater[k], living_room[k], washer[k], dryer[k]]);
}
*/
/////////////////////////////////////////////////////////////

var num_forecast = 4;

kijani.new_production = function(np) {
    production_data.push(np);

    production_forecast = production_forecast.slice(0, production_data.length-1);
    var j = 0;
    for(j=0;j<num_forecast+1;j++) {
        production_forecast.push(np);
    }
};

kijani.new_data = function(nd) {
    currents = nd;
    var j = 0;
    var consume = 0;
    _.each(datas, function(data,i) {
        kijani.sensors[i].current = currents[i];
        var cd = currents[i];
        //add the current data to the existing data
        data.push(cd);
        consume += cd;
    });
    consumption_data.push(consume);

    kijani.forecast();
};

kijani.forecast = function() {
    var j = 0;
    var consume = 0;
    var consumeoo = 0;
    _.each(datas, function(data,i) {
        //figure out the value we want to forecast with 
        var cd = data[data.length - 1];
        var cdonoff = cd * kijani.sensors[i].on;
        //cut the forecast back to the current data
        forecasts[i] = forecasts[i].slice(0, data.length-1);
        forecasts[i].push(cd);
        //add the same value num_forecast times to forecast usage
        for(j=0;j<num_forecast;j++) {
            forecasts[i].push(cdonoff);
        }
        consume += cd;
        consumeoo += cdonoff;
    });

    consumption_forecast = consumption_forecast.slice(0, consumption_data.length-1);
    consumption_forecast.push(consume);
    for(j=0;j<num_forecast;j++) {
        consumption_forecast.push(consumeoo);
    }

    bars_data = _.map(production_forecast, function(d,i) {
        var pd = production_forecast[i-1];
        var cd = consumption_forecast[i-1];
        var dat = {};
        if(pd > cd) {
            dat.val = pd - cd;
            dat.y = pd;
            dat.good = 1;
        } else {
            dat.val = cd - pd;
            dat.y = cd;
            dat.good = 0;
        }
        return dat;
    });
    bars_data = bars_data.slice(0, bars_data.length-1);


};


kijani.init = function(g) {
    var init_lines = function() {
        var cp = g.selectAll("defs")
            .data([0])
            .enter()
            .append("defs")
            .append("clipPath")
            .attr("id", "line_clip")
            .append("rect");

        var line_group = g.append("g")
            .attr("clip-path", "url(#line_clip)");
        var lines = line_group.append("g")
            .classed("lines", true)
            //.attr("transform", "translate(" + [50, 164] + ")");

        lines.append("path")
            .attr("id", "consumption_forecast")
            .attr("fill", "none")
            .attr("stroke", consumption_color)
            .attr("stroke-width", stroke_width)
            .attr("stroke-dasharray",5,3,2);
        lines.append("path")
            .attr("id", "consumption_data")
            .attr("fill", "none")
            .attr("stroke", consumption_color)
            .attr("stroke-width", stroke_width);

        lines.append("path")
            .attr("id", "production_forecast")
            .attr("fill", "none")
            .attr("stroke", production_color)
            .attr("stroke-width", stroke_width)
            .attr("stroke-dasharray",5,3,2);
        lines.append("path")
            .attr("id", "production_data")
            .attr("fill", "none")
            .attr("stroke", production_color)
            .attr("stroke-width", stroke_width);

    };

    init_lines();
    kijani.update_lines(g);

    //update_pie(g);

    //make_ui(g);
};

//tributary.dt = 1;
var myt = 0;
var k = 0;
var sim_t = 60 * 8;
var dt = 6; //6 minutes every reading (we do 1 reading per second)

kijani.run = function(g,t) {
    //every 1 second lets let 6 minutes pass
    //seems to be every 2 seconds
    //if(myt%60 === 0 && k < 24) {
    kijani.get_data(g);
    kijani.get_price();

        //console.log(myt%60, k);
   //new_data([heater[k], living_room[k], washer[k], dryer[k]]);
    //k++;

    //}
    //myt++;

};

//get_data(d3.select("#line_svg"))

kijani.get_data = function(g) {
    $.get("http://localhost:8000/read", function(data) {
        var json = JSON.parse(data);
        //console.log(json);
        sim_t += dt; //number of simulation minutes to advance
        kijani.new_production(production_scale(sim_t/60));

        var h = parseInt(json.report.heater.measured_power);
        var lr = parseInt(json.report.living_room.measured_power);
        var w = parseInt(json.report.washer.measured_power);
        var d = parseInt(json.report.dryer.measured_power);

        console.log("new data:", h, lr, w,d);

        kijani.new_data([h, lr, w, d]);
        kijani.update_lines(g);
        //update the text
        kijani.update_text();
    });


}

kijani.get_price = function() {
    var date = new Date("2012-06-09T11:25:00.0-0700");
    date.setHours(sim_t / 60);
    date.setMinutes(sim_t % 60); 
    console.log("DATE", date.toJSON());
    $.get("http://api.genability.com/rest/public/prices/522?appId=4101b793-c033-4732-8ce1-e196f2ddf450&appKey=e9925810-6812-4719-bff0-71d9109dd951&fromDateTime=" + date.toJSON(), function(data) {
        //console.log("price data", data);
        var results = data.results;
        var tarrif = _.find(results, function(d) {
            return d.chargeType === "CONSUMPTION_BASED";
        })
        var rate = tarrif.rateAmount; //rate in kWh / minutes
        //console.log("rate",rate);
        //current consumption
        var consuming = consumption_data[consumption_data.length-1] * 10 / 1000; //6 minutes means
        kijani.cost = consuming * rate;
        //console.log("cost kwh:", cost)
        
        var producing = production_data[production_data.length-1] * 10 / 1000; //6 minutes means
        kijani.saving = producing * rate;
        //console.log("saving:", saving);

        var format = d3.format(".3g");
        var money_text = d3.select("#money_text")
        .html("I'm paying <span class='losing_money'>$" + 
            format(kijani.cost) + "/kWh</span> right now. <br/>My Solar panels are saving me <span class='saving_money'>$" + 
            format(kijani.saving) + "/kWh</span>");
    })
}

    
kijani.flip = function(id) {
    var sensor = _.find(kijani.sensors, function(d) {
        return d.id === id;
    });
    sensor.on = !sensor.on;
};

}
