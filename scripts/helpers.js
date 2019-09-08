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
	document.getElementById("editBtn").innerHTML=saveEditButtons();

	if(!localStorage.row1) {localStorage.row1=defaultPanel(1)};
	if(!localStorage.row2) {localStorage.row2=defaultPanel(2)};
	if(!localStorage.row3) {localStorage.row3=defaultPanel(3)};
	if(!localStorage.style) {localStorage.style=defaultStyle()};

	document.getElementById("row1").innerHTML=localStorage.row1;
	document.getElementById("row2").innerHTML=localStorage.row2;
	document.getElementById("row3").innerHTML=localStorage.row3;
	document.getElementById("style").innerHTML=localStorage.style;

	initializeChart();
}

function saveData() {
	if (document.getElementById("chartBar_div")) { document.getElementById("chartBar_div").innerHTML="";}
	if (document.getElementById("chartLine_div")) { document.getElementById("chartLine_div").innerHTML="";}
	document.getElementById("editBtn").innerHTML="";

	var data=document.documentElement.innerHTML;
	var fileName="MicroBitMonitor.html";
	
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var json = JSON.stringify(data),
        blob = new Blob([data], {type: "text/plain;charset=utf-8"}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
	
	initializeChart();
	document.getElementById("editBtn").innerHTML=saveEditButtons();
}

function connectButton() {
	return "<input type='submit' value='Connect to MicroBit' id='connect' class='btn btn-success' onclick='bleConnect();'>";
}

function disconnectButton() {
	return "<input type='submit' value='Disconnect from MicroBit' id='connect' class='btn btn-danger' onclick='bleDisconnect();'>";
}

function saveEditButtons() {
	return "<input type='submit' value='Edit' class='btn btn-primary' onClick=\"onclick=window.open('edit.html','MicroBitMonitor Edit', 'width=800,height=900')\">&nbsp;<input type='submit' value='Save' class='btn btn-primary' onClick='saveData();'>";
}

function onResize() {
	if (chart) { chart.draw(data, options);	}
}

function editUpdate() {
	localStorage.row1=document.getElementById('row1Edit').value;
	localStorage.row2=document.getElementById('row2Edit').value;
	localStorage.row3=document.getElementById('row3Edit').value;
	localStorage.style=document.getElementById('styleEdit').value;
	window.opener.location.reload(true);
}

//---------------------------------------------------------------------------------------------------------
// Panel configurations
//---------------------------------------------------------------------------------------------------------

function editField(row,val) {
	document.write("<div class='editHeader'><b>Row "+row+"</b> - Select template</b>\n");
	document.write("<select id='select"+row+"' onchange='fillTemplate("+row+");'>>\n");
	document.write("<option value='' selected></option>\n");
	
	document.write("<option value='1'>Text field</option>\n");
	document.write("<option value='2'>Value display</option>\n");
	document.write("<option value='3'>Line graph</option>\n");
	document.write("<option value='4'>Bar Graph</option>\n");
	document.write("<option value='5'>Start/Stop buttons</option>\n");
	document.write("<option value='6'>Reset button</option>\n");

	document.write("</select></div>\n");
	document.write("<textarea id='row"+row+"Edit' name='row"+row+"' rows='3' class='form-control'>"+val+"</textarea>");
}

function editStyle() {
	document.write("<b>Style</b> - <a href='#' onclick='document.getElementById(\"styleEdit\").value=defaultStyle();'>Reset</a>\n<textarea id='styleEdit' name='styleEdit' rows='8' class='form-control'>"+localStorage.style+"</textarea>\n");
}

function fillTemplate(row) {
	switch (document.getElementById('select'+row).selectedIndex) {
		case 1:
			document.getElementById('row'+row+'Edit').value=textPanel();
			break;
		case 2:
			document.getElementById('row'+row+'Edit').value=valuePanel();
			break;
		case 3:
			document.getElementById('row'+row+'Edit').value=graphLine();
			break;
		case 4:
			document.getElementById('row'+row+'Edit').value=graphBar();
			break;
		case 5:
			document.getElementById('row'+row+'Edit').value=startStopButtons();
			break;
		case 6:
			document.getElementById('row'+row+'Edit').value=resetButton();
			break;
		default:
			document.getElementById('row'+row+'Edit').value="Error";
	}
}

function defaultStyle() {
	return "<style>\n#row1 {\n\tbackground-color: #EEEEEE;\n text-align: center;\n padding: 10px;\n}\n#row2 {\n text-align: center;\n padding: 10px;\n}\n\n#row3 {\n text-align: center;\n padding: 10px;\n}\n</style>\n";
}

function defaultPanel(row) {
	switch (row) {
		case 1:
			return textPanel();
			break;
		case 2:
			return graphBar();
			break;
		case 3:
			return resetButton();
			break;
		default:
			return "Error";
	}
}

function startStopButtons(){
	return "<input type='submit' value='Start' class='btn btn-success' onClick='uartSend(this.value);'>\n<input type='submit' value='Stop' class='btn btn-danger' onClick='uartSend(this.value);'>";
}

function resetButton(){
	return "<input type='submit' value='Reset' class='btn btn-primary' onClick='uartSend(this.value);'>";
}

function valuePanel() {
	return "<h4 id='lab'>Value</h4>\n<h4 class='display-4' id='val'>0</h4>";
}

function textPanel() {
	return "<h1 id='txt'>Title</h1>";
}

function graphLine() {
	return "<h4 id='cT'>Title</h4>\n<div id='chartLine_div'>Graph shows here</div>";
}

function graphBar() {
	return "<h4 id='cT'>Title</h4>\n<div id='chartBar_div'>Graph shows here</div>";
}

//---------------------------------------------------------------------------------------------------------
// BLE related
//---------------------------------------------------------------------------------------------------------

function onDisconnected(event) {
	document.getElementById("msg").innerHTML="<b>Bluetooth disconnected</b>";
	document.getElementById("ble").innerHTML=connectButton();
}

function uartCallback (event) {
	response=event.detail.replace(/(\r\n|\n|\r)/gm, "").split(":");
	
	switch(response[0]) {
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

function initializeChart() {
	
	if(document.getElementById("chartLine_div")) {
		google.charts.setOnLoadCallback(drawBasicLine);
		ctype='line';
	}
	
	if(document.getElementById("chartBar_div")) {
		google.charts.setOnLoadCallback(drawBasicBar);
		ctype='bar';
	}
}

function setColumns(fields) {
	const colors=['color: #4285F4','color: #DB4437','color: #F4B400','color: #0F9D58'];
	
	if (data) {
		switch (ctype) {
			case "line":
				for (var i=2; i<fields.length; i++) {
					data.addColumn('number', fields[i]);
				}
				break;
			case "bar":
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
	data.addColumn('number', 'Time');
	data.addColumn('number', 'x');

	options = {
		height: 350,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{title: 'Time', maxValue: bufferSize}
	};

	chart = new google.visualization.LineChart(document.getElementById('chartLine_div'));
	chart.draw(data, options);
}

function drawBasicBar() {
	data = new google.visualization.DataTable();
	data.addColumn('string', 'Value');
	data.addColumn('number', '0');	
	data.addColumn({type:'string',role:'style'});
	
	options = {
		height: 350,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{minValue: 0, maxValue: 10},
		legend: 	{position: 'none'}
	};

	chart = new google.visualization.BarChart(document.getElementById('chartBar_div'));
	chart.draw(data, options);
}
