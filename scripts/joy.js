/*!
 * Based on - https://github.com/bobboteck/JoyStick
 */
 
var JoyStick = (function(container) {
	var objContainer = document.getElementById(container);
	var canvas = document.createElement('canvas');

	size = 300;
	canvas.height=size;
	canvas.width=size;
	
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
		
	// Check if the device support the touch or not
	var touchable = 'createTouch' in document;
	if(touchable)
	{
		canvas.addEventListener('touchstart', onTouchStart, false);
		canvas.addEventListener('touchmove', onTouchMove, false);
		canvas.addEventListener('touchend', onTouchEnd, false);
	}
	else
	{
		canvas.addEventListener('touchstart', onTouchStart, false);
		canvas.addEventListener('touchmove', onTouchMove, false);
		canvas.addEventListener('touchend', onTouchEnd, false);
		canvas.addEventListener('mousedown', onMouseDown, false);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('mouseup', onMouseUp, false);
		canvas.addEventListener('mouseout', onMouseUp, false);
	}
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
		context.fillStyle = internalFillColor;
		context.lineWidth = internalLineWidth;
		context.strokeStyle = internalStrokeColor;
		context.beginPath();
		context.arc(movedX, movedY, 0.15*canvas.width, 0, 2.0*Math.PI, false);
		context.fill();
		context.stroke();
	}
	
	/**
	 * @desc Events for manage touch
	 */
	function onTouchStart(event) 
	{
		pressed=1;
	}
	function onTouchMove(event) {
		// Prevent the browser from doing its default thing (scroll, zoom)
		event.preventDefault();
		if(pressed==1)
		{
			movedX=event.touches[0].pageX;
			movedY=event.touches[0].pageY;
			// Manage offset
			movedX-=canvas.getBoundingClientRect().left;
			movedY-=canvas.getBoundingClientRect().top;
			// Delete canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			// Redraw object
			drawInternal();
		}
	} 
	function onTouchEnd(event) 
	{
		pressed=0;
		// Reset position store variable
		movedX=centerX;
		movedY=centerY;
		// Delete canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		// Redraw object
		drawInternal();
		//canvas.unbind('touchmove');
	}
	/**
	 * @desc Events for manage mouse
	 */
	function onMouseDown(event) 
	{
		pressed=1;
	}
	function onMouseMove(event) 
	{
		if(pressed==1)
		{
			movedX=event.pageX;
			movedY=event.pageY;
			// Manage offset
			movedX-=canvas.getBoundingClientRect().left;
			movedY-=canvas.getBoundingClientRect().top;
			// Delete canvas
			context.clearRect(0, 0, canvas.width, canvas.height);
			// Redraw object
			drawInternal();
		}
	}
	function onMouseUp(event) 
	{
		pressed=0;
		// Reset position store variable
		movedX=centerX;
		movedY=centerY;
		// Delete canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		// Redraw object
		drawInternal();
		//canvas.unbind('mousemove');
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
});
