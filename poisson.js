var timeScale = 100.0
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

//how to make continuous?
//		strecth maxTime towards infinity, keep lambda proportional to amound of timestamps by dividing by timescale factor
//generalize it to more variables?

console.log("lambda = .4, t = 10");
console.log(generatePoisson(.4, 10));
console.log("lambda = .25, t = 20");
console.log(generatePoisson(.25, 20));
console.log("lambdaEven = .2, lambdaOdd = .5, t = 20");
console.log(generatePoisson2(.2, .5, 20));
console.log("piecewise linear decay");
console.log(generatePoisson3(20));