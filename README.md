# raspberry-beacons

The intent of this is to provide a quick, simple, fun and inexpensive alerting beacon that can be connected to any type of service and be used as a visual notification that "something" is happening.

Ok, so the more concrete use is for when you have a need for a visual queue, like your latest build has hit production, your site goes down and you've turned your devices to "silent", or you want to know when a specific application crosses some threshold.  The big boys use huge LED monitors to do the same but you and I know that it can all be done with just one LED.

# Hardware

Most likely you'll already have some of these components, but if not you can click on the links below and grab them.

* Raspberry Pi (The A+ is ideal for this project) - [Buy from adafruit](https://www.adafruit.com/products/2266): $24.95
* Ledborg add on board - [Buy from piborg](https://www.piborg.org/ledborg): $5.20
* 8gb SD with NOOBS 1.4 already loaded - [Buy from adafruit](https://www.adafruit.com/products/1583): $11.95
* Miniature WiFi (802.11b/g/n) Module: For Raspberry Pi - [Buy from adafruit](https://www.adafruit.com/product/814): $11.95
* 5V 2A Switching Power Supply w/ 20AWG 6' MicroUSB Cable - [Buy from adafruit](https://www.adafruit.com/products/1995): $7.95
* Adafruit Pi Box Plus - Enclosure for Raspberry Pi Model A+ - [Buy from adafruit](https://www.adafruit.com/products/2280): $12:50 (optional)

# Software

You have a handful of options that you can go with. For instance I chose to go with [node.js](https://nodejs.org/), I could've just as easily built the beacon in [python](https://www.python.org/) especially since PiBorg seems to have the majority of their samples and code in the form of python.  

Also, in the build that I describe below I used [NOOBs bootloader](http://www.raspberrypi.org/introducing-noobs/).  You can usually buy an SD with it already on it and it makes it dead simple to get a Raspbian environment up in no time.  You can alternatively [grab the latest Raspbian distribution](http://www.raspberrypi.org/downloads/) and prep your own SD card. There are several great [tutorials](http://www.raspberrypi.org/documentation/installation/installing-images/) out there on how to get that done.

* [NOOBs 1.4](http://www.raspberrypi.org/documentation/installation/noobs.md)
* [Node.js 0.12.0](https://nodejs.org/)
* [pi-gpio](https://www.npmjs.com/package/pi-gpio)
* [quick2wire-gpio-admin](https://github.com/quick2wire/quick2wire-gpio-admin)

# Setup

**Put the hardware together**

* Place your LedBorg board on the Pi. The easiest way to know you're seating the board correctly is to make sure that the piborg icon looks like it's almost standing on top of the raspberry.  Have a look at the [piborg site](https://www.piborg.org/ledborg) if you are still unsure.
* Make sure to add your USB wifi adapter before turning your Pi on
* Insert your SD card in the underside of the Pi and you'll be good to go.

**Setup the RaspberryPi/Raspbian environment**

The second thing you are going to want to do is setup your RaspberryPi/Raspbian environment. Adafruit has an amazing [walk-through](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-2-first-time-configuration/overview) on this (some of the screen shots are out of date with recent distros).

**Setup the Wifi**

Again the folks at Adafruit have a great [walk-through](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-3-network-setup/setting-up-wifi-with-raspbian) on how to setup wifi.  Anyone who was running older versions of Raspbian probably remember how painful getting wifi working on your Pi was - not so anymore!

**Setup Node.js**

This is amazingly simple to do as well. Just open a Terminal window and use the following commands below provided from the Adafruit [walk-through](https://learn.adafruit.com/node-embedded-development/installing-node-dot-js).

Update the package index

```
sudo apt-get update
```

Install the newest versions of all of the packages

```
sudo apt-get upgrade
```

Pull down the latest version of Node

```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
```

Install it...

```
sudo dpkg -i node_latest_armhf.deb
```

Verify

```
pi@raspberrypi ~ $ node -v
```

**Enable GPIO **

So this is where it get a bit choppy.  There have been several updates to Raspbian which is fantastic, however the two tools we are going to use to access and use GPIO have a few bugs as a result of those updates. But **don't fret** these changes are fairly straight forward and can be made as we go. 

As a side note this complexity is added here because the Raspberry Pi GPIO pins require you to have *ROOT* to use them. So to keep us safe and secure we are going to use gpio-admin to help us out.

**Installing gpio-admin**

```
git clone git://github.com/quick2wire/quick2wire-gpio-admin.git
cd quick2wire-gpio-admin
make
sudo make install
sudo adduser $USER gpio
```

Then simply logout and log back in.

**Installing pi-gpio**

```
npm install pi-gpio -g
```

You now have enough of an environment to run the ledborg test harness I have. This is going to help you know if you are going to need to modify gpio-admin and pi-gpio for your given environment.

Before proceeding you can go down to the troubleshooting steps and go through 

** Getting the beacon setup **

From the terminal:

```
git clone https://github.com/nickfloyd/raspberry-beacons.git

cd raspberry-beacons/test_harness/

node ledborg.js
```

If all is well you'll see the led on the ledborg board shine blue.  If not go through the troubleshooting steps below - you'll have it glowing blue in no time.

# Running the beacon

Currently there is only one beacon avaiable right now.  Hopefully I'll make more or others will want to do the same.

To run the New Relic Insights beacon against your own data simply:

* Open / edit the newrelic_insights_beacon.js
* Modify the "query" to something that will retun a count.  Make sure the query is url encoded.  There is currently one in there as an example.
* Then execute the script via terminal

newrelic_insights_beacon.js [your query api key] [your account id]

ex. 
```
node newrelic_insights_beacon.js HrurPdQHISZ4ESs8iydk34u7tKHv1zXU 429813
```

# Running the beacon headless

Thanks to [weworkweplay](http://weworkweplay.com/play/raspberry-pi-nodejs/) we have an amazingly simple approach to this:

Modify your ```/etc/rc.local``` file adding the following to it:

```
su pi -c 'node /home/pi/raspberry-beacons/newrelic_insights_beacon.js [your query api key] [your account id] < /dev/null &'
```



# Troubleshooting

**gpio-admin: failed to change group ownership of /sys/devices/virtual/gpio/gpio22/direction: No such file or directory**

This is a know issue and there is currently a [PR on the quick2wire-gpio-admin](https://github.com/quick2wire/quick2wire-gpio-admin/pull/6) repo that addresses it. While we are waiting for that to get pulled in we can fix it ourselves.

On your Pi navigate to:

```
/home/pi/gpio-admin/src
```

Open and modify the ```gpio-admin.c``` file:

Change this:

```
int size = snprintf(path, PATH_MAX, "/sys/devices/virtual/gpio/gpio%u/%s", pin, filename);
```

To this:

```
int size = snprintf(path, PATH_MAX, "/sys/class/gpio/gpio%u/%s", pin, filename);
```

Once you are done you will have to rebuid and install gpio-admin. Navigate to /home/pi/gpio-admin and execute the following:

```
make
sudo make install 
```

In addition to this change the same type of [issue](https://github.com/rakeshpai/pi-gpio/pull/34) exists in the pi-gpio package.  Simply navigate to:

```
 /home/pi/node_modules/pi-gpio
```   

Open and modify the ```pi-gpio.js``` file:

Change this:

```
sysFsPath = "/sys/devices/virtual/gpio";
```

To this:

```
sysFsPath = "/sys/class/gpio";
```

Save the file and try the harness again.
