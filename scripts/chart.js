google.charts.setOnLoadCallback(drawBasic);

const bufferSize=100;
var index=0;

function updateUI (){
}

function setColumns(fields) {
	var ncols=fields.length;
	
	fields[0]='Time';
	for (var i=0; i<ncols; i++) {
		data.addColumn('number', fields[i]);
	}
	
	document.getElementById("btn1").disabled=false;
	document.getElementById("btn2").disabled=false;
}

function updateRows(values) {
	if (index>bufferSize) {data.removeRow(0);}
	values[0]=index;
	data.addRow(values.map(Number));
	index++;
}

function uartCallback (event) {
	if (event.detail.length>=20) {
		document.getElementById("msg").innerHTML="<b>Command string might be truncated</b> - 20 characters maximum";
	}
	
	response=event.detail.split(":");
	if (chart) {
		switch(response[0]) {
			case "cL":
				setColumns(response);
				break;
			case "cV":
				updateRows(response);
				chart.draw(data, options);
				break;
			case "cT":
				document.getElementById(response[0]).innerHTML=response[1];
				break;
			default:
				document.getElementById("msg").innerHTML="<b>Unknown id</b> - "+response[0];
		}
	}
}

function drawBasic() {
	data = new google.visualization.DataTable();

	options = {
		height: 500,
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 	{ title: 'Time', maxValue: bufferSize}
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
}