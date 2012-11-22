var numHouses = 30, 
	numChanges = 15, 
	changeInterval = 500,
	timeStep = 0,
	boxSize = 400,
	changes = [],
	houses = [],
 	vacAreas = 0,
	numFlags = 0,
	frameRate = 1500,
	clearFunction;

var timeScale = 10.0,
	cascadeLength = 5,
	lambda_0 = .5;

var test = [];

//unbind all button click events after flag is placed
var unbindAll = function() {
	$("#area").unbind('click');
	var id;
	for (i = 0; i < numHouses; i++) {
		id = "#house" + i;
		$(id).unbind('click');
	} for (i = 0; i < vacAreas; i++) {
		id = "#vaccine" + i;
		$(id).unbind('click');
	} for (i = 0; i < numFlags; i++) {
		id = "#flag" + i;
		$(id).unbind('click');
	}
};

//basic button setup
$(function() {
    $( "#flag" ).button({
        text: false,
        icons: {
            primary: 'ui-icon-flag'
        }
    }).click(function() {
    	if ($("#flag").attr("checked")) {
        	$("#flag").buttonset();
        	//fix delete button
        	$("#delete").removeAttr("checked")
	        	.button("refresh");   
        	unbindAll();
        	//make the box flaggable
        	$("#area").click(function (e) {
        		var flagId = "flag" + numFlags.toString();
        		$("#area").append("<div id=" + flagId +"><img src='icons/59-flag.png'</div>" )
        		$("#" + flagId).css({position:'absolute', top: e.pageY - 26, left: e.pageX});
        		numFlags++;
        		unbindAll();
        		$("#flag").removeAttr("checked")
        			.button("refresh");
        		$("#help").text('Help Box');
        	})
        	var houseId;
        	var flagId
        	//make sure all the houses can be clicked on to flag
        	for (i = 0; i < numHouses; i++) {
        		houseId = "house" + i;
        		$("#" + houseId).click(function (e) {
	        		flagId = "flag" + numFlags.toString();
	        		$("#area").append("<div id=" + flagId +"><img src='icons/59-flag.png'</div>" )
	        		$("#" + flagId).css({position:'absolute', top: e.pageY - 26, left: e.pageX});
	        		numFlags++;
	        		unbindAll();
	        		$("#flag").removeAttr("checked")
	        			.button("refresh");
	        		$("#help").text('Help Box');
	        	})
        	}
        	//make the vaccine boxes flaggable
        	var vaccineId;
        	for (i = 0; i < vacAreas; i++) {
        		vaccineId = "vaccine" + i;
        		$("#" + vaccineId).click(function (e) {
	        		flagId = "flag" + numFlags.toString();
	        		$("#area").append("<div id=" + flagId +"><img src='icons/59-flag.png'</div>" )
	        		$("#" + flagId).css({position:'absolute', top: e.pageY - 26, left: e.pageX});
	        		numFlags++;
	        		unbindAll();
	        		$("#flag").removeAttr("checked")
	        			.button("refresh");
	        		$("#help").text('Help Box');
	        	})
        	}
        	$("#help").text("Click within the box to place a flag on a area to mark it as contaminated. Click on the flag icon again to cancel.");
        } else {
        	unbindAll();
        	$("#flag").removeAttr("checked")
        		.button("refresh");
        	$("#help").text('Help Box');
        }
    });
	//vaccine button
    $( "#vaccinate" ).button({
        text: false,
        icons: {
            primary: "ui-icon-alert"
        }
    }).click(function () {
    	var id = 'vaccine' + vacAreas.toString();
    	$("<div class='draggable' id=" + id + ">vaccine</div>").appendTo("#area");
    	$( "#" + id )
        	.draggable({containment : '#area'})
        	.resizable({containment : '#area'})
        	.css({"background": 'rgb('+ (255 - (vacAreas*50)) +',255,0)'});
    	vacAreas++;
    	$("#help").text("You've created a vaccination area! Drag and resize the box over the area you wish to vaccinate.");
    	$("#delete").removeAttr("checked")
	        .button("refresh");   
        unbindAll();
    });
    //delete button
    $( "#delete").button({
    	text: false,
    	icons: {
    		primary: "ui-icon-trash"
    	}
    }).click(function() {
    	unbindAll();
    	if ($("#delete").attr("checked")) {
			$("#help").text("Click a flag or vaccine to delete it. Click the delete button again to cancel.")
			$("#delete").buttonset();
    		$("#flag").removeAttr("checked")
    			.button("refresh");
    		var id;
    		//make all the flags deletable
    		for (i = 0; i < numFlags; i++) {
    			id = "#flag" + i;
    			$(id).click(function () {
	        		unbindAll();
	        		$(this).effect('explode', 500)
    				.remove();
    				$("#delete").removeAttr("checked")
	        			.button("refresh")
	        		//numFlags--;
	        			.removeAttr("checked")
	        			.button("refresh");
	        		$("#help").text("Help Box")
    			})
    		//make all the vaccine areas deletable
    		} for (j = 0; j < vacAreas; j++) {
    			id = "#vaccine" + j;
    			$(id).click(function () {
	        		unbindAll();
	        		$(this).effect('explode', 500)
    				.remove();
    				$("#delete").removeAttr("checked")
	        			.button("refresh")
	        		//vacAreas--;
	        			.removeAttr("checked")
	        			.button("refresh");
	        		$("#help").text("Help Box");
    			})
    		}
    	} else {
    		unbindAll();
    		$("#delete").removeAttr("checked")
    			.button("refresh");
    		$("#help").text("Help Box");
    	}
    });
	//start simulation button
	$("#start").button({
		text: false,
		icons: {
			primary: "ui-icon-play"
		}
	}).click(function () {start();});
});

//main house data structure
var House = function (houseNum) {
	this.houseNum = houseNum;
	this.htmlId = 'house' + houseNum;
	this.x = Math.floor(Math.random()*(boxSize - 22) + 21);
	this.y = Math.floor(Math.random()*(boxSize - 22) + 21);
	this.infected = false;

	//add the house to the html
	this.display = function () {
		var style = $("#display_all").attr("checked") ? "" : " style='display: none'";
		$("body").append("<div class='house' id=" + this.htmlId + "><img id=" + this.htmlId + "img src=icons/53-house.png" + style + "></div>");
		$("#"+this.htmlId).css({top: this.y - 11, left: this.x - 11});
		houses.push(this);
	};

	this.infect = function() {
		if (!this.infected) {
			$('#' + this.htmlId + "img").fadeOut(function() { 
			  $(this).load(function() { $(this).fadeIn(); }); 
			  $(this).attr("src", "icons/53-house-infected.png"); 
			});
			changes.push(this.houseNum);
			this.infected = true;
			//console.log('infected')
		}
	};

	//how many pixels between this house and some other one?
	this.distanceTo = function(otherHouse) {
		xDiff = Math.abs(this.x - otherHouse.x);
		yDiff = Math.abs(this.y - otherHouse.y);
		distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
		return distance;
	};
};

//infect a random house
function infectRandom () {
	var rand;
	do{
		rand = Math.floor(Math.random() * numHouses)
	} while (changes.lastIndexOf(rand) != -1);
	house = houses[rand];
	house.infect(timeStep);
	timeStep++;
};

//infect houses at specified times intervals
function infectInterval (times) {
	console.log('infectInterval');
	for (i = 0; i < times.length; i++) {
		setTimeout(infectRandom, times[i]*100)
	}
}

function infectIntervalProb (times) {
	var distances = [],
		infections = [],
		houseOrder = [],
		index = 0,
		sortedDistances,
		distance,
		rand,
		next,
		lastInfected;

	//first just infect a random house
	next = lastInfected = houses[Math.floor(Math.random()*numHouses)];
	setTimeout(function() {lastInfected.infect();}, times[0]*frameRate);
	houseOrder.push(next.houseNum)
	infections.push(lastInfected.houseNum);

	//then just walk through the houses in order and infect them w p = 1/d^2
	for (i = 0; i < times.length; i++) {
		//find all house distances
		for (houseNum = 0; houseNum < numHouses; houseNum++) {
			//console.log(houseNum);
			distance = lastInfected.distanceTo(houses[houseNum])
			distances[houseNum] = parseFloat(distance.toFixed(2));
		} 
		sortedDistances = distances;
		console.log(sortedDistances);
		//quick_sort(sortedDistances);
		sortedDistances.sort();
		console.log(sortedDistances);
		while (next === lastInfected) {
			for (d = 1; d < sortedDistances.length; d++) {
				rand = Math.random()
				if (rand < 1/Math.pow(sortedDistances[d], 2)) {
					rand = distances.indexOf(sortedDistances[d]);
					if (infections.indexOf(rand) === -1) {
						next = houses[rand];
						houseOrder.push(next);
						setTimeout(function() {index++; houseOrder[index].infect();}, times[i]*frameRate)
						infections.push(next.houseNum);
						//console.log('timeout set', next.houseNum, times[i]*frameRate);
					}
				}
			} 
		}
		lastInfected = next;
		test = distances;
		distances = [];
	}



}

//make houses, display them
function generateHouses() {
	var house;
	for (i = 0; i < numHouses; i++){
		house = new House(i);
		house.display();
	};
};

//simply clear the infect random function. feed in r to set interval in html, call clear()
//to clear it.
function clear() {
	clearInterval(clearFunction);
};

function start() {
	generateHouses();
	var events = poissonCascade(numChanges, lambda_0);
	console.log(events);
	infectIntervalProb(events);
	$("#start").unbind("click");
	$("#display_all").unbind("click");
	$("#help").text("Simulating... Mark areas as contaminated or deploy vaccines.")
};


function generatePoisson(lambda, maxEvents) {
	var output = [],
	rand;
	for (i = 0; output.length < maxEvents; i++) {
		rand = Math.random();
		if (rand < lambda/timeScale) {
			output.push(i/timeScale);
		}
	} return output;
}

//single variable, general nonhomogenous, lambda must be a function
function poissonNH(lambda, maxEvents, t) {
	var output = [],
	rand;
	for (i = t; (output.length < maxEvents && i - t < cascadeLength) ; i+=1/timeScale) {
		rand = Math.random();
		if (rand < (lambda(i-t, cascadeLength))) {
			output.push(i);

		}
	} return output;
}

function lambdaExpDecay(currentTime, length) {
	return lambda_0 * 1/Math.exp(currentTime);
}

function poissonCascade(maxEvents, lambda_0) {

	var nextEvent;
	//push to output for now, yield in python
	var output = [];
	var t = 0;
	var house;
	var t_lambda_p = [];
	var t_lambda_n = [];

	//generate lambda zero p.p., pick a random house for it to infect
	t_lambda_n.push(generatePoisson(lambda_0, maxEvents));

	while (output.length < maxEvents) {
		//get the next event, push it, update t
		nextEvent = findEvent(t_lambda_n, t);
		//thinning stuff would probably take place here
		//just dont push the event unless it passes some random thinning check
		output.push(nextEvent);
		t = output[output.length - 1];

		//add a new process to t_lambda_n
		t_lambda_p = poissonNH(lambdaExpDecay, 20, t);

		t_lambda_n.push(t_lambda_p);
		//t_lambda_n.map(function(x) {console.log(x)});
	}

	return output;
}

//find the smallest event in 1d array after t
function min(array, t) {
	if (array === undefined || array === []) {return array;}
	var i = 0;
	var low;
	do {
		if (array[i] > t) low = array[i]; 
		i++;
	} while (!low && i < array.length);
	for (; i < array.length; i++) {
		if (array[i] < low) low = array[i];
	} 
	//console.log(array, t, low);
	return low;
}

//findEvent just finds the next event after t in a 2d array
function findEvent(array, t) {
	var next = min(array[0], t);
	var low = next;
	for (i = 1; i < array.length; i++) {
		next = min(array[i], t);
		if (low > next) low = next;
	} return low
}


//built in sort not working for some reason... using quicksort

/* Copyright (c) 2012 the authors listed at the following URL, and/or
the authors of referenced articles or incorporated external code:
http://en.literateprograms.org/Quicksort_(JavaScript)?action=history&offset=20070102180347

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Retrieved from: http://en.literateprograms.org/Quicksort_(JavaScript)?oldid=8410
*/

Array.prototype.swap=function(a, b)
{
	var tmp=this[a];
	this[a]=this[b];
	this[b]=tmp;
}

function partition(array, begin, end, pivot)
{
	var piv=array[pivot];
	array.swap(pivot, end-1);
	var store=begin;
	var ix;
	for(ix=begin; ix<end-1; ++ix) {
		if(array[ix]<=piv) {
			array.swap(store, ix);
			++store;
		}
	}
	array.swap(end-1, store);

	return store;
}


function qsort(array, begin, end)
{
	if(end-1>begin) {
		var pivot=begin+Math.floor(Math.random()*(end-begin));

		pivot=partition(array, begin, end, pivot);

		qsort(array, begin, pivot);
		qsort(array, pivot+1, end);
	}
}

function quick_sort(array)
{
	qsort(array, 0, array.length);
}

function dosort(form)
{
	var array=form.unsorted.value.split(/ +/);

	quick_sort(array);

	form.sorted.value=array.join(' ');


}