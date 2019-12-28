# hm-iobroker - A Plugin to install ioBroker on your Homematic Gateway (CCU3, RaspberryMatic) 
ioBroker packaged as a CCU-Addon for RaspberryMatic and the HomeMatic CCU3.

## About this plugin
This plugin contains a full installation of the SmartHome solution "ioBroker" (see also: https://www.iobroker.net/) as an addon on your CCU3/RaspberryMatic on Raspi or Tinkerboard. (https://github.com/jens-maus/RaspberryMatic)
The homematic adapters are already installed and ready to use. (Configured with ip 127.0.0.1)

The usage is like a common ioBroker installation, with one difference: The update of the js-controller (see below)

## How to install hm-iobroker?
Like any other plugin hm-iobroker can be installed directly from WebUI of your Homematic CCU.

Steps to install the plugin:
* Download the latest version of the plugin here: https://github.com/zautrix/hm-iobroker/releases/latest (a .tar.gz file)
* On your CCU WebUI go to "Settings > Control Panel"
* Select "Additional software"
* Now under "Install / update additional software" press "Browse" to upload the plugin (.tar.gz file you downloaded in the first step)
* To upload the plugin press "Install"
* The CCU will let you know when the upload is complete and ask you to install the plugin
* Once you acknowledged the installation, ioBroker will be installed on your CCU.

## How to configure your CCU to ensure ioBroker is reachable from your device?
Depending on your CCU firewall settings, all ports that are not used by WebUI are blocked.
As hm-iobroker runs on port 8081, the port has to be whitelisted to be able to access it.

Steps to whitelist the ioBroker Port:
* On your CCU WebUI go to "Settings > Control Panel"
* Select "Configure firewall"
* Under "Port opening" add the port number 8081 - if there is one or more already, don't forget to add a ';' as a separator.
* Select "Ok" to save the firewall changes.
* Now the hm-iobroker port is available for external access and you are ready to go.

## How to open ioBroker?
As ioBroker is installed on your CCU, you can access it in two different ways:
1. On your CCU WebUI go to "Settings > Control Panel" and then select "ioBroker". This will open the ioBroker URL in a new browser tab.
2. Enter the URL in your browser as follows: `<homematic-CCU-URL>:8081` (e.g. http://homematic-raspi:8081)

**Caution:** If you have SSL enabled on your CCU, but not yet in ioBroker you might get an error message in your browser. Replace the "https://" with "http://" in the URL to open iobroker.

## How to update your js-controller?
Log on as root (via ssh) into console and run the following commands:
(ignore any "gyp ERR! ..." messages during upgrade)
(ignore "npm update check failed" message)

```
cd /usr/local/addons/hm-iobroker
./iobroker stop
export npm_config_cache=/usr/local/addons/hm-iobroker/npm_io/.npm
export npm_config_userconfig=/usr/local/addons/hm-iobroker/npm_io/.npmrc
./iobroker update
./iobroker upgrade self
./iobroker start
```

## Known issues
* Backitup adapter cannot install backup.
* It may be possible that zigbee adapter can not be updated.
* ping adapter may not work.
* Any adapter which needs something compiled (e.g. hardware specific drivers) may not be possible to install.

## hm-iobroker System requirements
ioBroker runs on node.js. hm-iobroker shipps with the Homematic adapters already installed and setup to connect to your CCU.
Right after the installation hm-iobroker requires ~500MB RAM.
RaspberryMatic requires ~400 MB RAM.

**If you install hm-iobroker on your RaspberryMatic on a Raspi with just 1GB RAM, you might take a look at the available RAM to avoid performance issues.**

**To reduce RAM usage of ioBroker, you can (temporarily) shutdown instances of the ioBroker adapters you don't need (e.g. info, zigbee)**
