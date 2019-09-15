const bufferSize=100;

var data, chart, options;
var clock, clocktimer, clockID;
var device, services, ctype;
var index=0;

//---------------------------------------------------------------------------------------------------------
// Setup and helpers
//---------------------------------------------------------------------------------------------------------

function setup() {
	var url = window.location.pathname;
	var filename = url.substring(url.lastIndexOf('/')+1);
	
	if (!filename || filename==="index.html") {
		document.getElementById("editBtn").innerHTML=saveEditButtons();

		if(localStorage.row1) {
			document.getElementById("row1").innerHTML=DOMPurify.sanitize(localStorage.row1);
			document.getElementById("row2").innerHTML=DOMPurify.sanitize(localStorage.row2);
			document.getElementById("row3").innerHTML=DOMPurify.sanitize(localStorage.row3);
			document.getElementById("style").innerHTML="<style>\n"+localStorage.style+"\n</style>\n";
			document.getElementById("msg").innerHTML="<b>Layout loaded</b>"
		}
	}
	
	document.getElementById("ble").innerHTML=connectButton();
	initializeChart();
	initializeTimer();
	buttonCallbacks();
	buttonStatusToggle(true);
}

function buttonCallbacks() {
	var btns = document.getElementsByClassName("btn-microbit");
	for (var i = 0; i < btns.length; i++) {
		btns[i].onclick = function() { uartSend(this.value); };
	}
}

function buttonStatusToggle(disabled) {
	var btns = document.getElementsByClassName("btn-microbit");
	for (var i = 0; i < btns.length; i++) {
		btns[i].disabled=disabled;
	}
}

function saveData() {
	if (document.getElementById("chartBar_div")) { document.getElementById("chartBar_div").innerHTML="";}
	if (document.getElementById("chartLine_div")) { document.getElementById("chartLine_div").innerHTML="";}
	document.getElementById("editBtn").innerHTML="";
	document.getElementById("msg").innerHTML="";
	expandLinks(true);

	var data=pageHeader()+"<body>"+document.getElementsByTagName("BODY")[0].innerHTML+"</body></html>";
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

	document.getElementById("editBtn").innerHTML=saveEditButtons();
	document.getElementById("msg").innerHTML="File saved.";
	expandLinks(false);	
	initializeChart();
}

function pageHeader() {
	return "<html><head><title>ORCS Girls - MicroBit Monitor</title><meta name='viewport' content='width=device-width, initial-scale=1'><script type='text/javascript' src='https://www.gstatic.com/charts/loader.js'></script><script>google.charts.load('current', {'packages':['corechart']});</script></head>";
}

function expandLinks(flag) {
	var prefix="";
	
	if (flag) {prefix="https://microbit.orcsgirls.org/";}
	document.getElementById("imglink").src=prefix+"images/orcsgirls.png";
	document.getElementById("helperslink").src=prefix+"scripts/helpers.js";
	document.getElementById("microbitlink").src=prefix+"dist/microbit.umd.js";
	document.getElementById("purifylink").src=prefix+"dist/purify.min.js";
	document.getElementById("stylelink").href=prefix+"styles/theme.css";
}
		
function connectButton() {
	return "<input type='submit' value='Connect' id='connect' class='btn btn-success btn-sm' onclick='bleConnect();'>";
}

function disconnectButton() {
	return "<input type='submit' value='Disconnect' id='connect' class='btn btn-danger btn-sm' onclick='bleDisconnect();'>";
}

function saveEditButtons() {
	return "<input type='submit' value='Edit' class='btn btn-primary btn-sm' onClick=\"onclick=window.open('edit.html','MicroBitMonitor Edit', 'width=800,height=900')\">&nbsp;<input type='submit' value='Save' class='btn btn-primary btn-sm' onClick='saveData();'>";
}

function editUpdate() {
	localStorage.row1=document.getElementById('row1Edit').value;
	localStorage.row2=document.getElementById('row2Edit').value;
	localStorage.row3=document.getElementById('row3Edit').value;
	
	localStorage.style=document.getElementById('styleEdit').value.replace(/<.style>/g, "");
	reloadMain();
}

function reloadMain() {
	try { 
		window.opener.location.reload(true); } catch (e) 
	{ 
		document.getElementById('msg').innerHTML="Reload monitor page manually.";
	}
}

//---------------------------------------------------------------------------------------------------------
// Panel configurations
//---------------------------------------------------------------------------------------------------------

function editField(row,val) {
	document.write("<div class='editHeader'><b>Row "+row+"</b> - Select template</b>\n");
	document.write("<a href='#' onclick='togglePanel(\"row"+row+"Edit\",\"img"+row+"\");'>");
	document.write("<img id='img"+row+"' src='https://microbit.orcsgirls.org/images/up.png' align='right' height='30'></a>\n");
	
	document.write("<select id='select"+row+"' onchange='fillTemplate("+row+");'>\n");
	document.write("<option value='' selected></option>\n");
	
	document.write("<option value='t'>Text field</option>\n");
	document.write("<option value='v'>Value display</option>\n");
	document.write("<option value='v2'>Value display - row of 2</option>\n");
	document.write("<option value='lc'>Line chart</option>\n");
	document.write("<option value='bc'>Bar chart</option>\n");
	document.write("<option value='vlc'>Value & Line chart</option>\n");
	document.write("<option value='vbc'>Value & Bar chart</option>\n");
	document.write("<option value='ti'>Timer display</option>\n");
	document.write("<option value='sb'>Start/Stop buttons</option>\n");
	document.write("<option value='rb'>Reset button</option>\n");

	document.write("</select></div>\n");
	
	if (val==undefined) {
		switch (row) {
			case 1:
				val=textPanel();
				break;
			case 2:
				val=graph('Bar');
				break;
			case 3:
				val=resetButton();
				break;				
		}
	}
	document.write("<textarea id='row"+row+"Edit' name='row"+row+"' rows='3' class='form-control'>"+val+"</textarea>");
}

function editStyle(val) {
	if (val==undefined) { val=defaultStyle(); }
	document.write("<div class='editHeader'><b>Style</b> - <a href='#' onclick='document.getElementById(\"styleEdit\").value=defaultStyle();'>Reset</a>\n");
	document.write("<a href='#' onclick='togglePanel(\"styleEdit\",\"imgStyle\");'>");
	document.write("<img id='imgStyle' src='https://microbit.orcsgirls.org/images/down.png' align='right' height='30'></a></div>\n");
	document.write("<textarea id='styleEdit' name='styleEdit' rows='10' class='form-control' style='display:none;'>"+val+"</textarea>\n");
}

function fillTemplate(row) {
	var choice=document.getElementById('select'+row)[document.getElementById('select'+row).selectedIndex].value;	
	switch (choice) {
		case 't':
			document.getElementById('row'+row+'Edit').value=textPanel();
			break;
		case 'v':
			document.getElementById('row'+row+'Edit').value=valuePanel();
			break;
		case 'v2':
			document.getElementById('row'+row+'Edit').value=valuePanelTwo();
			break;
		case 'lc':
			document.getElementById('row'+row+'Edit').value=graph('Line');
			break;
		case 'bc':
			document.getElementById('row'+row+'Edit').value=graph('Bar');
			break;
		case 'vlc':
			document.getElementById('row'+row+'Edit').value=valueGraph('Line');
			break;
		case 'vbc':
			document.getElementById('row'+row+'Edit').value=valueGraph('Bar');
			break;
		case 'sb':
			document.getElementById('row'+row+'Edit').value=startStopButtons();
			break;
		case 'rb':
			document.getElementById('row'+row+'Edit').value=resetButton();
			break;
		case 'ti':
			document.getElementById('row'+row+'Edit').value=timerPanel();
			break;
		default:
			document.getElementById('row'+row+'Edit').value="Error";
	}
}

function defaultStyle() {
	return "#row1 {\n background-color: #EEEEEE;\n text-align: center;\n padding: 10px;\n}\n#row2 {\n text-align: center;\n padding: 10px;\n}\n\n#row3 {\n background-color: #EEEEEE;\n text-align: center;\n padding: 10px;\n}";
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
	return "<input type='submit' value='Start' class='btn btn-success btn-microbit'>\n<input type='submit' value='Stop' class='btn btn-danger btn-microbit'>";
}

function resetButton(){
	return "<input type='submit' value='Reset' class='btn btn-primary btn-microbit'>";
}

function valuePanel() {
	return "<h4 id='lab'>Value</h4><hr>\n<h1 class='display-1' id='val'>0</h1>";
}

function valuePanelTwo() {
	return "<table><tr><td width='50%'><h4 id='lab1'>Value</h4><hr><h1 class='display-1' id='val1'>0</h1></td>\n<td width='50%'><h4 id='lab2'>Value</h4><hr><h1 class='display-1' id='val2'>0</h1></td></tr></table>";
}

function textPanel() {
	return "<h1 id='txt'>Title</h1>";
}

function valueGraph(type) {
	return "<table><tr><td><h4 id='lab'>Label</h4><hr><h1 class='display-1' id='val'>0</h1></td><td width='75%'><div id='chart"+type+"_div'>Graph shows here</div></td></tr></table>";
}

function graph(type) {
	return "<h4 id='cT'>Title</h4>\n<div id='chart"+type+"_div'>Graph shows here</div>";
}

function timerPanel() {
	return "<h1><div id='timer_div'>-</div></h1>";
}

function togglePanel(name,icon) {
	var e=document.getElementById(name);
	var i=document.getElementById(icon);
	
	if (e.style.display === "none") {
		e.style.display = "block";
		i.src='https://microbit.orcsgirls.org/images/up.png';
	} else {
		e.style.display = "none";
		i.src='https://microbit.orcsgirls.org/images/down.png';
	}
}
//---------------------------------------------------------------------------------------------------------
// BLE related
//---------------------------------------------------------------------------------------------------------

function onDisconnected(event) {
	document.getElementById("msg").innerHTML="<b>Bluetooth disconnected</b>";
	document.getElementById("ble").innerHTML=connectButton();
	buttonStatusToggle(true);
}

function uartCallback (event) {
	response=event.detail.replace(/(\r\n|\n|\r)/gm, "").split(":");
	document.getElementById("msg").innerHTML="<b>Received command</b> - "+response[0];
	
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
			if(chart && (ctype=="bar")) {
				options.hAxis.maxValue=response[1];
				chart.draw(data, options);
			}
			break;
		case "cMin":
			if(chart && (ctype=="bar")) {
				options.hAxis.minValue=response[1];
				chart.draw(data, options);
			}
			break;
		case "cHeight":
			if(chart) {
				options.height=response[1];
				chart.draw(data, options);
			}
			break;
		case "tStart":
			if (clock) {
				clockStart();
			}
			break;
		case "tStop":
			if (clock) {
				clockStop();
			}
			break;
		case "tReset":
			if (clock) {
				clockReset();
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
		document.getElementById("msg").innerHTML="<b>Send command</b> - "+line;
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
				buttonStatusToggle(false);

				uartSend("Ready");
			}
		initializeChart();
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
		height:		400,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{title: 'Time'}
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
		height:		400,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{minValue: 0, maxValue: 10},
		legend: 	{position: 'none'}
	};

	chart = new google.visualization.BarChart(document.getElementById('chartBar_div'));
	chart.draw(data, options);
}

//---------------------------------------------------------------------------------------------------------
// Stop watch routines (from https://gist.github.com/electricg/4372563)
// Copyright (c) 2010-2015 Giulia Alfonsi <electric.g@gmail.com>
//---------------------------------------------------------------------------------------------------------

function initializeTimer() {
	if (document.getElementById("timer_div")) {
		clockID=document.getElementById("timer_div");
		clock = new clsStopwatch();
		clockUpdate();
	}
}

var	clsStopwatch = function() {
		// Private vars
		var	startAt	= 0;	// Time of last start / resume. (0 if not running)
		var	lapTime	= 0;	// Time on the clock when last stopped in milliseconds

		var	now	= function() {
				return (new Date()).getTime(); 
			}; 
 
		// Public methods
		// Start or resume
		this.start = function() {
				startAt	= startAt ? startAt : now();
			};
		// Stop or pause
		this.stop = function() {
				// If running, update elapsed time otherwise keep it
				lapTime	= startAt ? lapTime + now() - startAt : lapTime;
				startAt	= 0; // Paused
			};
		// Reset
		this.reset = function() {
				lapTime = startAt = 0;
			};
		// Duration
		this.time = function() {
				return lapTime + (startAt ? now() - startAt : 0); 
			};
	};
	
function pad(num, size) {
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) {
	var m = s = fs = 0;
	var newTime = '';

	time = time % (60 * 60 * 1000);
	m = Math.floor( time / (60 * 1000) );
	time = time % (60 * 1000);
	s = Math.floor( time / 1000 );
	time = time % 1000;
	fs = Math.floor( time / 10 );

	newTime = pad(m, 2) + ':' + pad(s, 2) + '.' + pad(fs, 2);
	return newTime;
}

function clockShow() {
	update();
}

function clockUpdate() {
	clockID.innerHTML = formatTime(clock.time());
}

function clockStart() {
	clocktimer = setInterval("clockUpdate()", 10);
	clock.start();
}

function clockStop() {
	clock.stop();
	clearInterval(clocktimer);
}

function clockReset() {
	clock.stop();
	clock.reset();
	clockUpdate();
}


