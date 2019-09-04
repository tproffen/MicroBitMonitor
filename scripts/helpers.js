const bufferSize=100;

var data, chart, options;
var device, services, ctype;
var index=0;

//---------------------------------------------------------------------------------------------------------
// Setup and helpers
//---------------------------------------------------------------------------------------------------------

function setup() {
	window.addEventListener("resize", onResize);
	document.getElementById("ble").innerHTML=connectButton();
}

function connectButton() {
	return "<input type='submit' value='Connect to MicroBit' id='connect' class='btn btn-primary' onclick='bleConnect();'>";
}

function disconnectButton() {
	return "<input type='submit' value='Disconnect from MicroBit' id='connect' class='btn btn-danger' onclick='bleDisconnect();'>";
}

function onResize() {
	if (chart) { chart.draw(data, options);	}
}

//---------------------------------------------------------------------------------------------------------
// Panel configurations
//---------------------------------------------------------------------------------------------------------

function configPanels(command) {
	for (var i=1; i<command.length; i++) {
		configPanelsRow(command[i],i);
	}
}

function configPanelsRow(what, index) {
	var row="row"+index;
	
	switch(what) {
		case "t1":
			document.getElementById(row).innerHTML=textPanel();
			break;
		case "v1":
			document.getElementById(row).innerHTML=oneValuesPanel();
			break;
		case "v2":
			document.getElementById(row).innerHTML=twoValuesPanel();
			break;
		case "cb":
			document.getElementById(row).innerHTML=graphBar();
			break;
		case "cl":
			document.getElementById(row).innerHTML=graphLine();
			break;
		case "bctl":
			document.getElementById(row).innerHTML=startStopButtons();
			break;
		case "brst":
			document.getElementById(row).innerHTML=resetButton();
			break;
		default:
			document.getElementById("msg").innerHTML="<b>Unknown configuration</b> - "+what;
	}
}

function startStopButtons(){
	return "<td colspan='2' class='text-center bg-light'><input type='submit' value='Start' class='btn btn-success' onClick='uartSend(this.value);'><input type='submit' value='Stop' class='btn btn-danger m-2' onClick='uartSend(this.value);'></td>";
}

function resetButton(){
	return "<td colspan='2' class='text-center bg-light'><input type='submit' value='Reset' class='btn btn-primary' onClick='uartSend(this.value);'></td>";
}

function twoValuesPanel() {
	return "<td class='text-center w-50'><h4 id='lA'>&nbsp;</h4><h4 class='display-4'><b><span id='A'>&nbsp;</span></b></h4></td><td class='text-center w-50'><h4 id='lB'>&nbsp;</h4><h4 class='display-4'><b><span id='B'>&nbsp;</span></b></h4></td>";
}

function oneValuesPanel() {
	return "<td colspan='2' class='text-center'><h4 id='lA'>&nbsp;</h4><h4 class='display-4'><b><span id='A'>&nbsp;</span></b></h4></td>";
}

function textPanel() {
	return "<td colspan='2' class='text-center bg-light p-4'><h1 id='tA'></h1></td>";
}

function graphLine() {
	google.charts.setOnLoadCallback(drawBasicLine);
	ctype='line';

	return "<td colspan='2' class='text-center' height='400px'><h4 id='cT'>&nbsp;</h4><div id='chart_div'></div></td></tr>";
}

function graphBar() {
	google.charts.setOnLoadCallback(drawBasicBar);
	ctype='bar';
	return "<td colspan='2' class='text-center' height='400px'><h4 id='cT'>&nbsp;</h4><div id='chart_div'></div></td></tr>";
}

//---------------------------------------------------------------------------------------------------------
// BLE related
//---------------------------------------------------------------------------------------------------------

function onDisconnected(event) {
	document.getElementById("msg").innerHTML="<b>Bluetooth disconnected</b>";
	document.getElementById("ble").innerHTML=connectButton();
	document.getElementById("row1").innerHTML="<td colspan='2' class='text-center'><h4>Waiting for MicroBit ..</h4></td>";
	document.getElementById("row2").innerHTML="";
	document.getElementById("row3").innerHTML="";
}

function uartCallback (event) {
	response=event.detail.replace(/(\r\n|\n|\r)/gm, "").split(":");
	
	switch(response[0]) {
		case "config":
			configPanels(response);
			break;
		case "cL":
			setColumns(response);
			break;
		case "cV":
			if(chart) {
				updateRows(response);
				chart.draw(data, options);
			}
			break;
		case "cMax":
			if(chart) {
				options.hAxis.maxValue=response[1];
				chart.draw(data, options);
			}
			break;
		case "cMin":
			if(chart) {
				options.hAxis.minValue=response[1];
				chart.draw(data, options);
			}
			break;
		default:
			try {
				document.getElementById(response[0]).innerHTML=response[1];
			} catch (err) {
				document.getElementById("msg").innerHTML="<b>Error processing event</b> - "+event.detail;
			}
	}
}

function uartSend(line) {
	if (services.uartService) {
		services.uartService.sendText(line+"\n");
	}
}

function bleDisconnect() {
	document.getElementById("connect").disabled=true;
	document.getElementById("msg").innerHTML="<b>Disconnecting from MicroBit</b> - Please wait.";

	device.gatt.disconnect();
}

async function bleConnect() {
	try {
		device = await microbit.requestMicrobit(window.navigator.bluetooth);
		document.getElementById("connect").disabled=true;
		document.getElementById("msg").innerHTML="<b>Connecting to MicroBit</b> - Please wait.";
	
		if (device) {
			device.addEventListener('gattserverdisconnected', onDisconnected);
		
			services = await microbit.getServices(device);
				
			if (services.uartService) {
				services.uartService.addEventListener("receiveText", uartCallback);
				document.getElementById("msg").innerHTML="<b>Connected to MicroBit</b>";
				document.getElementById("ble").innerHTML=disconnectButton();
				uartSend("Ready");
			}
		}	
	} catch (err) {
		document.getElementById("msg").innerHTML="<b>Bluetooth not available.</b> - "+err;
	}
}

//---------------------------------------------------------------------------------------------------------
// Google chart related routines
//---------------------------------------------------------------------------------------------------------

function setColumns(fields) {
	const colors=['color: #4285F4','color: #DB4437','color: #F4B400','color: #0F9D58'];
	
	if (data) {
		switch (ctype) {
			case "line":
				fields[0]='Time';
				for (var i=0; i<fields.length; i++) {
					data.addColumn('number', fields[i]);
				}
				break;
			case "bar":
				data.addColumn('string', 'Value');
				data.addColumn('number', '0');	
				data.addColumn({type:'string',role:'style'});
				for (var i=1; i<fields.length; i++) {
					data.addRow([fields[i],0,colors[i-1]]);
				}
				break;
			default:
				document.getElementById("msg").innerHTML="<b>Unknown chart type.</b> - "+ctype;
		}
		chart.draw(data, options);
	}
}

function updateRows(values) {
	if (data) {
		switch (ctype) {
			case "line":
				if (index>bufferSize) {data.removeRow(0);}
				values[0]=index;
				data.addRow(values.map(Number));
				index++;
				break;
			case "bar":
				for (var i=1; i<values.length; i++) {
					data.setCell(i-1,1, values[i]);
				}
				break;
			default:
				document.getElementById("msg").innerHTML="<b>Unknown chart type.</b> - "+ctype;
		}
		chart.draw(data, options);
	}
	
}

function drawBasicLine() {
	data = new google.visualization.DataTable();

	options = {
		height: 350,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{ title: 'Time', maxValue: bufferSize}
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
}

function drawBasicBar() {
	data = new google.visualization.DataTable();
	
	options = {
		height: 350,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{minValue: 0, maxValue: 10},
		legend: 	{position: 'none'}
	};

	chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}
