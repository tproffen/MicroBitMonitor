google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawBasic);

var data, chart, options;
var device, services;

function onResize() {
	if (chart) { chart.draw(data, options);	}
}

function onDisconnected(event) {
	document.getElementById("connect").innerHTML="<input type=\"submit\" value=\"Connect to MicroBit\" id=\"find\" class=\"btn btn-primary\">";
}

function uartSend() {
	if (services.uartService) {
		services.uartService.sendText(document.getElementById("send").value+"\n");
	}
}

function uartCallback (event) {
	response=event.detail.split(":");
	document.getElementById(response[0]).innerHTML=response[1];
	
	if (chart) {
		if (response[0]=="A") {data.setCell(0,1, response[1]);}
		if (response[0]=="B") {data.setCell(1,1, response[1]);}
		chart.draw(data, options);
	}
}

async function bleConnect() {
	device = await microbit.requestMicrobit(window.navigator.bluetooth);
	document.getElementById("connect").innerHTML="<b>Please wait - connecting to MicroBit</b>";

	if (device) {
		device.addEventListener('gattserverdisconnected', onDisconnected);
		
		services = await microbit.getServices(device);
				
		if (services.uartService) {
			services.uartService.addEventListener("receiveText", uartCallback);
			document.getElementById("connect").innerHTML="<b>Ready</b> (Reload page to disconnect)";

		}
	}
}

function drawBasic() {
      data = google.visualization.arrayToDataTable([['Value', 'Count'],['A', 0],['B', 0]]);
	  options = {height: 350,hAxis: {minValue: 0}};

      chart = new google.visualization.BarChart(document.getElementById('chart_div'));
      chart.draw(data, options);
}