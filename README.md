# MicroBitMonitor
 
Collection of scripts and webpages to interface with the <a href="www.microbit.org">MicroBit</a> via BlueTooth. Developed for use in 
<a href="www.orcsgirls.org">ORCSGirls</a> classes. The original BLE implementation for the MicroBit used on these pages can be 
found <a href="https://github.com/thegecko/microbit-web-bluetooth">here</a>.

## Dashboard

You will need to download and load this <a href="https://tproffen.github.io/MicroBitMonitor/hexfiles/microbit-BLEDashboard.hex">hex file</a> to your MicroBit. The code can be viewed <a href="https://tproffen.github.io/MicroBitMonitor/images/dashboardScreenShot.png">here</a>. Once the MicroBit is ready, visit the <a href="https://tproffen.github.io/MicroBitMonitor/Dashboard.html">dashboard page</a> and connect to the MicroBit. The example is a competition how many situps someone can mane by sim0ly counting the times the MiroBits logo points down. Refer to the example how to communicate with the page.

## Chart

You will need to download and load this <a href="https://tproffen.github.io/MicroBitMonitor/hexfiles/microbit-BLEPlotter.hex">hex file</a> to your MicroBit. The code can be viewed <a href="https://tproffen.github.io/MicroBitMonitor/images/chartScreenShot.png">here</a>. Once the MicroBit is ready, visit the <a href="https://tproffen.github.io/MicroBitMonitor/Chart.html">chart plotting page</a> and connect to the MicroBit. Once it is connected, click on the Start button and you will see a chart of the accelerometer values in x, y and z directions. Refer to the example how to communicate with the page. Please note, the UART implementation only allows strings of up to 20 characters. Keep this in mind when modifying the examples.

Enjoy.

<a href="mailto:thomas@orcsgirls.org">Thomas</a>