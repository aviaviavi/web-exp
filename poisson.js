var timeScale = 1000000000.0
//single variable, homogenous 
function generatePoisson(lambda, maxTime) {
	var output = [],
	rand;
	for (i = 0; i < maxTime; i++) {
		rand = Math.random();
		if (rand < lambda) {
			output.push(i);
		}
	} return output;
}

//single variable, nonhomogenous, oscillating piecewise
function generatePoisson2(lambdaEven, lambdaOdd, maxTime) {
	var output = [],
	rand;
	for (i = 0; i < maxTime; i++) {
		rand = Math.random();
		if (rand < (i % 2 === 0 ? lambdaEven : lambdaOdd)) {
			output.push(i);
		}
	} return output;
}

//single variable, nonhomogenous, piecewise linear decay
function generatePoisson3(maxTime) {
	var lambda = function(t) {
		return 1 - (t/(maxTime*timeScale));
	};
	var output = [],
	rand;
	for (i = 0; i < maxTime*timeScale; i++) {
		rand = Math.random();
		if (rand < lambda(i)/timeScale) {
			output.push(i/timeScale);
		}
	} return output;
}

//single variable, general nonhomogenous, lambda must be a function
function generatePoisson4(labmda, maxTime) {
	var output = [],
	rand;
	for (i = 0; i < maxTime; i++) {
		rand = Math.random();
		if (rand < lambda(i)) {
			output.push(i);
		}
	} return output;
}

//exponential decay poisson process, takes a baserate and maxEvents.
function poissonDecay(base, maxEvents) {
	//takes in the events that have happened and the current timeStep, and how long an event will have an effect for
	var lambda = function(events, time, cascadeLength) {
		//keep the events that happened recently enough
		var cascadingEvents = events.filter(function(num, time, cascadeLength) {return time - num < cascadeLength;});
		var val = 0;
		//sum up the amount of time each event still effected the pp for. 
		//a even that just happened will add close to cascadeLength... One that is about to be outside the cascade Lenght
		//will add next to nothing
		for (i = 0; i < cascadingEvents.length; i++) {
			val += cascadeLength - (time - cascadingEvents[i]);
		} 
		//the second term will get very small as effects get larger, so it will subtract less probability
		return (1 + base) - (1/Math.exp(val));
	}
	var output = [],
	rand;
	for (t = 0; output.length < maxEvents; t++) {
		rand = Math.random();
		//assuming a cascade length of 5, could just be an argument as well
		if (rand < lambda(output, t/timeScale, 5)/timeScale) {
			output.push(t/timeScale)
		}
	} return output;
}

//how to make continuous?
//strecth maxTime towards infinity, keep lambda proportional to amound of timestamps by dividing by timescale factor
//generalize it to more variables?

console.log("lambda = .4, t = 10");
console.log(generatePoisson(.4, 10));
console.log("lambda = .25, t = 20");
console.log(generatePoisson(.25, 20));
console.log("lambdaEven = .2, lambdaOdd = .5, t = 20");
console.log(generatePoisson2(.2, .5, 20));
console.log("piecewise linear decay");
console.log(generatePoisson3(20));
console.log("exponential decay");
console.log(poissonDecay(.3, 20));