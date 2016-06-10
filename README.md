# rtu
IoT - Remote Terminal Unit (RTU) - Telemetery

Updated:      2016-06-10
Description:  We are nearing a release version. We are currently in development.
              ETA is the end of July 2016.

Ideal for:
- Beagle
- Rasberry Pi
Works perfectly on Ubuntu Snappy

IO Tested:
- MMTCP8DIO – 8 Digital Input/Output Module
- MMTCP8AI/I – 8 Current Input Module http://www.proconel.com/Industrial-Data-Acquisition-Products/MODBUS-TCP-I-O-Modules.aspx

SCADA Tested:
- Adroit (ModbusTCP Driver)

Enable any device that can run nodejs to become an IoT - Telemetry controller/PLC. 

The following drivers have been written:
- ModbusTCP Master and Slave
- ModbusSerial Master and Slave
- RS232 Module

Take a look at the following block diagram: 
https://docs.google.com/presentation/d/13lV7XXzajUMlGG2DshTNIJIniDUSplBrLKYsqnzIoz8/edit#slide=id.p

The device logs change of states (COFS) in IO and can either send the status to a Webserver or via other devices connected on TCP or RS232 serial comm port such as a telemetry radio.
The device listens for any other devices and stores other rtus statuses in its memory making any device on a network able to show the entire network status.
SCADA can connect to any device to get network status.

