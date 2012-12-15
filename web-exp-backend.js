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

var timeScale = 200.0,
	cascadeLength = 50,
	lambda_0 = .2;

var events = [];
var times;
var infectOrder;
//the fact that this is necessary is a huge flaw in js
var iterator = 0;

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

	this.infect = function(time) {
		if (!this.infected) {
			$('#' + this.htmlId + "img").fadeOut(function() { 
			  $(this).load(function() { $(this).fadeIn(); }); 
			  $(this).attr("src", "icons/53-house-infected.png"); 
			});
			changes.push(this.houseNum);
			this.infected = true;
			console.log("infecting");
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

//i hate javascript for this to be necessary
function sortFunction(a, b){
	return (a - b) //causes an array to be sorted numerically and ascending
}

function epidemic() {
	// console.log(times.length === infectOrder.length);
	// console.log("times = " + times);
	// console.log("order = " + infectOrder);
	for (i = 0 ; i < times.length; i++) {
		setTimeout(function() {houses[infectOrder[iterator]].infect(times[iterator]); iterator++;}, timeScale * (times[i] - times[0]));
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
	events = poissonCascade(numChanges, lambda_0);
	times = events[0];
	infectOrder = events[1];
	console.log("times = " + times);
	epidemic();
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
	for (i = t; (output.length < maxEvents && i - t < cascadeLength) ; i+=1) {
		rand = Math.random();
		if (rand < (lambda(i-t, cascadeLength))) {
			output.push(i/timeScale);

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
	var infectionOrderOutput = [];
	var infectionOrders = [[]]; //first index left blank, so it lines up indices with t_lambda_n
	var t = 0;
	var house;
	var t_lambda_p = [];
	var t_lambda_n = [];
	var lastInfected;
	var index;
	var rand;

	//generate lambda zero p.p.
	t_lambda_n.push(generatePoisson(lambda_0, maxEvents));

	//generate order of infections for base process
	for (i = 0; i < t_lambda_n[0].length; i++) {
		do {
			rand =  Math.floor(Math.random() * numHouses);
		} while (infectionOrders[0].indexOf(rand) != -1);
		infectionOrders[0].push(rand);
	}

	while (output.length < maxEvents) {
		//get the next event, push it, update t
		eventFound = false;
		do {
			nextEvent = findEvent(t_lambda_n, t);
			t = nextEvent[0];
			//assign lastInfected, push it to orderOutput
			index = t_lambda_n[nextEvent[1]].indexOf(t)
			lastInfected = infectionOrders[nextEvent[1]][index];
			if (infectionOrderOutput.indexOf(lastInfected) === -1) eventFound = true;
		} while (!eventFound); //while the next event picked isn't infecting an already infected house
		//thinning stuff would probably take place here
		//just dont push the event unless it passes some random thinning check
		output.push(t);
		infectionOrderOutput.push(lastInfected);
		//add a new process to t_lambda_n
		t_lambda_p = poissonNH(lambdaExpDecay, numChanges, t);
		t_lambda_n.push(t_lambda_p);
		//for (b = 0; b < t_lambda_n.length; b++) {console.log(t_lambda_n[b])}
		//figure out house infection orders for this t_lambda_p
		house = houses[lastInfected];
		order = [];
		for (houseNum = 0; order.length < numChanges; houseNum = (houseNum + 1) % numHouses) {
			if (houseNum != lastInfected && Math.random() < 1/Math.pow(house.distanceTo(houses[houseNum]), 2) && order.indexOf(houseNum) === -1) {
				order.push(houseNum);
			}
		} infectionOrders.push(order);
	}
	return [output, infectionOrderOutput];
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
	var index = 0;
	for (i = 1; i < array.length; i++) {
		next = min(array[i], t);
		if (low > next) {
			low = next;
			index = i;
		} 
	}
	return [low, index]
}


function checkTime(){
  var l = eTimes[eTimesIndex].length;
  var s = eTimes[eTimesIndex];
  if(elapsed===dTimes[dTimesIndex]){
  document.getElementById('indicator').src=onFigVal;
  setTimeout("document.getElementById('indicator').src='indOff.jpg';",300);
  dTimesIndex++;
  }
  for (var i=0;i<l;i++){
  if(elapsed===s[i]){
  indexHolder.push(lightOrderIndex);
  light(lightOrder[lightOrderIndex]);
  setTimeout("lightOff()",80);
  if (i===0){eTimesIndex++;}
  lightOrderIndex++;
  }
  }
  if(elapsed>=max_time){
  goTo('exp','interim1');
  dsc.push(Math.round(100*tracker.sum()/tracker.length)/100);
// alert(dsc);
  }
}