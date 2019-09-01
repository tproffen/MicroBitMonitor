google.charts.load('current', {packages: ['corechart', 'bar', 'line']});

var data, chart, options;
var device, services;

function onResize() {
	if (chart) { chart.draw(data, options);	}
}

function onDisconnected(event) {
	document.getElementById("connect").innerHTML="<b>Bluetooth disconnected</b> (Reload page to reconnect)";
}

function uartSend(line) {
	if (services.uartService) {
		services.uartService.sendText(line+"\n");
	}
}

async function bleConnect() {
	device = await microbit.requestMicrobit(window.navigator.bluetooth);
	document.getElementById("connect").disabled=true;
	document.getElementById("msg").innerHTML="<b>Connecting to MicroBit</b> - Please wait.";

	if (device) {
		device.addEventListener('gattserverdisconnected', onDisconnected);
		
		services = await microbit.getServices(device);
				
		if (services.uartService) {
			services.uartService.addEventListener("receiveText", uartCallback);
			document.getElementById("msg").innerHTML="<b>Connected to MicroBit</b> - Reload page to disconnect.";
			updateUI();
			uartSend("Ready");

		}
	}
}
