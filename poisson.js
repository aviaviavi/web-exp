var timeScale = 100.0,
	distances,
	numHouses = 15;
//single variable, homogenous 
function generatePoisson(lambda, maxEvents) {
	var output = [],
	rand;
	for (i = 0; i < maxEvents; i++) {
		rand = Math.random();
		if (rand < lambda/timeScale) {
			output.push(i/timeScale);
		}
	} return output;
}

//single variable, nonhomogenous, oscillating piecewise
function generatePoisson2(lambdaEven, lambdaOdd, minTime) {
	var output = [],
	rand;
	for (i = 0; i < minTime; i++) {
		rand = Math.random();
		if (rand < (i % 2 === 0 ? lambdaEven : lambdaOdd)) {
			output.push(i);
		}
	} return output;
}

//single variable, nonhomogenous, piecewise linear decay
function generatePoisson3(minTime) {
	var lambda = function(t) {
		return 1 - (t/(minTime*timeScale));
	};
	var output = [],
	rand;
	for (i = 0; i < minTime*timeScale; i++) {
		rand = Math.random();
		if (rand < lambda(i)/timeScale) {
			output.push(i/timeScale);
		}
	} return output;
}

//single variable, general nonhomogenous, lambda must be a function
function poissonNH(lambda, maxEvents, t) {
	var output = [],
	rand;
	for (i = t; output.length < maxEvents; i++) {
		rand = Math.random();
		if (rand < lambda(i, 5)) {
			output.push(i);

		}
	} return output;
}

lambdaExpDecay = function(currentTime, length) {
		return length / currentTime;
}

function poissonCascade(maxEvents, lambda_0) {
	var T_lambda_n = [];
	//array with [t of Event, lambda_x]
	var nextEvent;
	//push to output for now, yield in python
	var output = [];
	var t = 0;
	var house;

	//generate lambda zero p.p., pick a random house for it to infect
	T_lambda_n[0] = generatePoisson(lambda_0, maxEvents);
	houseNum = Math.floor(Math.random() * numHouses);
	houses[houseNum].infect(t);

	while (output.length < maxEvents) {

		//add a new process to t_lambda_n
		T_lambda_n[houseNum] = poissonNH(lambdaExpDecay, maxEvents - output.length, t);

		//get the next event
		nextEvent = findEvent(T_lambda_n.map(min), t);
		// thinning check, have code to generate thinning perams
		// for (thinPeram in thinningPerams) {
		// 	thinningVal += thinningPeram
		// }
		// if (Math.random() > thinningVal )
		output.push(nextEvent[0]);
		//figure out which house will be infected

		for (i = 0; i < numHouses; i++) {
			distances = [];
			if (!houses[i].infected && i != houseNum) {
				distances[i] = houses[numHouses].distanceTo(houses[i]);
			}
		}

		for (index = 0; index < numHouses; index++) {
			if (Math.random() < 1/Math.pow(distances[index], 2)) {
				houseNum = index;
				houses[houseNum].infect();
				break;
			}
			//this is possible, which is why i feel like im doing it wrong
			console.log("no house selected for t = " + t);
		}
		
		t++;
	}

	return output;
}


function findEvent(array, t) {
	var low = array[0];
	var lowIndex;
	for (i = 1; i < array.length; i++) {
		if (array[i] < low && array[i] > t) low = array[i]; lowIndex = i
	} return [low, lowIndex];
}	

function min(array) {
	if (array.length === 0) {return [];}
	var low = array[0];
	for (i = 0; i < array.length; i++) {
		if (array[i] < low) low = array[i];
	} return low;
}

console.log("poisson casdcade 20 events, .1 base");
console.log(poissonCascade(20, .1).toString());













// //exponential decay poisson process, takes a baserate and minEvents.
// function poissonDecay(base, minEvents) {
// 	//takes in the events that have happened and the current timeStep, and how long an event will have an effect for
// 	var lambda = function(events, time, cascadeLength) {
// 		//keep the events that happened recently enough
// 		var cascadingEvents = events.filter(function(num, time, cascadeLength) {return time - num < cascadeLength;});
// 		var val = 0;
// 		//sum up the amount of time each event still effected the pp for. 
// 		//a even that just happened will add close to cascadeLength... One that is about to be outside the cascade Lenght
// 		//will add next to nothing
// 		for (i = 0; i < cascadingEvents.length; i++) {
// 			val += cascadeLength - (time - cascadingEvents[i]);
// 		} 
// 		//the second term will get very small as effects get larger, so it will subtract less probability
// 		return (1 + base) - (1/Math.exp(val));
// 	}
// 	var output = [],
// 	rand;
// 	for (t = 0; output.length < minEvents; t++) {
// 		rand = Math.random();
// 		//assuming a cascade length of 5, could just be an argument as well
// 		if (rand < lambda(output, t/timeScale, 5)/timeScale) {
// 			output.push(t/timeScale)
// 		}
// 	} return output;
// }