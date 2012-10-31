var numHouses = 30, 
	numChanges = 15, 
	changeInterval = 500,
	timeStep = 0,
	boxSize = 400,
	changes = [],
	houses = [],
 	vacAreas = 0,
	numFlags = 0;

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
    })
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
		$("body").append("<div class='house' id=" + this.htmlId + "><img id=" + this.htmlId + "img src=icons/53-house.png></div>");
		$("#"+this.htmlId).css({top: this.y - 11, left: this.x - 11});
		houses.push(this);
	};

	this.infect = function(timeStep) {
		if (!this.infected) {
			$('#' + this.htmlId + "img").fadeOut(function() { 
			  $(this).load(function() { $(this).fadeIn(); }); 
			  $(this).attr("src", "icons/53-house-infected.png"); 
			});
			changes.push(this.houseNum);
			this.infected = true;
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

//make houses, display them
function generateHouses() {
	var house;
	for (i=0; i<numHouses; i++){
		house = new House(i);
		house.display();
	};
};

function clear() {
	clearInterval(r);
};