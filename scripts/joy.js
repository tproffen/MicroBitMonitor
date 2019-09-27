/*!
 * Based on - https://github.com/bobboteck/JoyStick
 */
 
var JoyStick = (function(container) {
	var objContainer = document.getElementById(container);
	var canvas = document.createElement('canvas');

	canvas.height=objContainer.clientHeight;
	canvas.width=objContainer.clientWidth;
	
	objContainer.appendChild(canvas);
	var context=canvas.getContext('2d');
	
	var pressed = 0; // Bool - 1=Yes - 0=No
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var movedX=centerX;
	var movedY=centerY;
		
	var internalFillColor = '#00AA00';
	var internalStrokeColor = '#00FF00';
	var internalLineWidth = 1;
	
	var directionHorizontalLimitPos = canvas.width / 10;
	var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
	var directionVerticalLimitPos = canvas.height / 10;
	var directionVerticalLimitNeg = directionVerticalLimitPos * -1;

		
	// Register event handlers
	canvas.addEventListener('touchstart', onStart, false);
	canvas.addEventListener('touchmove', onTouchMove, false);
	canvas.addEventListener('touchend', onEnd, false);
	canvas.addEventListener('mousedown', onStart, false);
	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('mouseup', onEnd, false);
	canvas.addEventListener('mouseout', onEnd, false);
	
	// Dummy element to get CSS style for joystick button on canvas
	var div = document.createElement("div");
    div.style = "display: none";
	div.className='joystickButton';
	document.body.appendChild(div);
	const joyStyle = getComputedStyle(div);

	// Draw the object
	drawInternal(centerX, centerY);
	
	/******************************************************
	 * Private methods
	 *****************************************************/
	 /**
	 * @desc Draw the internal stick in the current position the user have moved it
	 */
	function drawInternal()
	{
		var radius = parseInt(joyStyle.height, 10)/2;
		context.fillStyle = joyStyle.color;
		context.lineWidth = joyStyle.borderWidth;
		context.strokeStyle = joyStyle.borderColor;
		context.beginPath();
		context.arc(movedX, movedY, radius, 0, 2.0*Math.PI, false);
		context.fill();
		context.stroke();
	}
	
	/**
	 * @desc Events for manage input in canvas (mouse or touch)
	 */
	function onStart(event) 
	{
		pressed=1;
	}
	function onEnd(event) 
	{
		pressed=0;
		movedX=centerX;
		movedY=centerY;
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawInternal();
	}
	function onTouchMove(event) {
		event.preventDefault();
		if(pressed==1)
		{
			movedX=event.touches[0].pageX;
			movedY=event.touches[0].pageY;
			updateStick();
		}
	}
	function onMouseMove(event) 
	{
		if(pressed==1)
		{
			movedX=event.pageX;
			movedY=event.pageY;
			updateStick();
		}
	}
	function updateStick() {
		movedX-=canvas.getBoundingClientRect().left;
		movedY-=canvas.getBoundingClientRect().top;
		if(movedX<0 || movedX>canvas.width ||
		   movedY<0 || movedY>canvas.height) {
			pressed=0;
			movedX=centerX;
			movedY=centerY;
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawInternal();
	}
	/******************************************************
	 * Public methods
	 *****************************************************/
	/**
	 * @desc The width of canvas
	 * @return Number of pixel width 
	 */
	this.GetWidth = function () 
	{
		return canvas.width;
	};
	
	/**
	 * @desc The height of canvas
	 * @return Number of pixel height
	 */
	this.GetHeight = function () 
	{
		return canvas.height;
	};
	
	/**
	 * @desc The X position of the cursor relative to the canvas that contains it and to its dimensions
	 * @return Number that indicate relative position
	 */
	this.GetPosX = function ()
	{
		return movedX;
	};
	
	/**
	 * @desc The Y position of the cursor relative to the canvas that contains it and to its dimensions
	 * @return Number that indicate relative position
	 */
	this.GetPosY = function ()
	{
		return movedY;
	};
	
	/**
	 * @desc Normalized value of X move of stick
	 * @return Integer from -100 to +100
	 */
	this.GetX = function ()
	{
		return (200*((movedX - centerX)/canvas.width)).toFixed();
	};

	/**
	 * @desc Normalized value of Y move of stick
	 * @return Integer from -100 to +100
	 */
	this.GetY = function ()
	{
		return ((200*((movedY - centerY)/canvas.height))*-1).toFixed();
	};
	
	/**
	 * @desc Status of mouse/touch
	 * @return Boolean indicating if canvas is pressed
	 */
	this.isPressed = function ()
	{
		return (pressed==1);
	};
		/**
	 * @desc Get the direction of the cursor as a string that indicates the cardinal points where this is oriented
	 * @return String of cardinal point N, NE, E, SE, S, SW, W, NW and C when it is placed in the center
	 */
	this.GetDir = function()
	{
		var result = "";
		var orizontal = movedX - centerX;
		var vertical = movedY - centerY;
		
		if(vertical>=directionVerticalLimitNeg && vertical<=directionVerticalLimitPos)
		{
			result = "C";
		}
		if(vertical<directionVerticalLimitNeg)
		{
			result = "N";
		}
		if(vertical>directionVerticalLimitPos)
		{
			result = "S";
		}
		
		if(orizontal<directionHorizontalLimitNeg)
		{
			if(result=="C")
			{ 
				result = "W";
			}
			else
			{
				result += "W";
			}
		}
		if(orizontal>directionHorizontalLimitPos)
		{
			if(result=="C")
			{ 
				result = "W";
			}
			else
			{
				result += "E";
			}
		}
		
		return result;
	};
});
