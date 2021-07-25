var TeachableMachine = (function(container) {

	var objContainer = document.getElementById(container);
	var webcamContainer = document.getElementById('webcam');
	var infoContainer = document.getElementById('tminfo');
	var tmURL = "https://teachablemachine.withgoogle.com/models/"+document.getElementById('tmCode').value+"/";

	
	if (!webcamContainer) {
		webcamContainer = document.createElement('webcam');
		objContainer.appendChild(webcamContainer);
	}
	if (!infoContainer) {
		infoContainer = document.createElement('div');
		objContainer.appendChild(infoContainer);
	}

    let model, webcam, labelContainer, maxPredictions;
	let currentClass = "None";
	init();

	/******************************************************
	 * Private methods
	 *****************************************************/
	
    // Load the image model and setup the webcam
    async function init() {
        const modelURL = tmURL + "model.json";
        const metadataURL = tmURL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        webcamContainer.appendChild(webcam.canvas);
		
		// Show link to model
		infoContainer.innerHTML="<a href="+tmURL+">Neural Network</a>";
    }

    async function loop() {
        webcam.update(); // update the webcam frame
		await predict();
        window.requestAnimationFrame(loop);
    }
	
    async function predict() {
        const prediction = await model.predict(webcam.canvas);

		let bestClass = 0;;
		let threshhold = 0.75;
		currentClass = "None";
		
        for (let i = 0; i < maxPredictions; i++) {
			if(prediction[i].probability > threshhold && prediction[i].probability > bestClass) {
				bestClass = prediction[i].probability;
				currentClass = prediction[i].className;
			}
        }
    }

	/****************************************************
	* Public methods
	*****************************************************/
	
	this.GetClass = function ()
	{
		return currentClass;
	};	
});