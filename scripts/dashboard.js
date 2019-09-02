google.charts.setOnLoadCallback(drawBasic);

function updateUI (){
	document.getElementById("btn1").disabled=false;
}
function uartCallback (event) {
	if (event.detail.length>=20) {
		document.getElementById("msg").innerHTML="<b>Command string might be truncated</b> - 20 characters maximum";
	}
	response=event.detail.split(":");

	if (chart) {
		switch(response[0]) {
			case "A":
				document.getElementById(response[0]).innerHTML=response[1];
				data.setCell(0,1, response[1]);
				chart.draw(data, options);
				break;
			case "B":
				document.getElementById(response[0]).innerHTML=response[1];
				data.setCell(1,1, response[1]);
				chart.draw(data, options);
				break;	
			case "labA":
				document.getElementById(response[0]).innerHTML=response[1];
				data.setCell(0,0, response[1]);
				chart.draw(data, options);
				break;
			case "labB":
				document.getElementById(response[0]).innerHTML=response[1];
				data.setCell(1,0, response[1]);
				chart.draw(data, options);
				break;
			case "cMax":
				options.hAxis.maxValue=response[1];
				chart.draw(data, options);
				break;
			default:
				document.getElementById("msg").innerHTML="<b>Unknown id</b> - "+response[0];
		}
	}
}

function drawBasic() {
	data = google.visualization.arrayToDataTable([['Value', 'Count',{ role: 'style' }],['A', 0, 'color: #4285F4'],['B', 0, 'color: #DB4437']]);
	options = {
		chartArea: 	{width: '80%', height: '80%'},
		hAxis: 		{minValue: 0, maxValue: 10},
		legend: 	{position: 'none'}
	};

	chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}