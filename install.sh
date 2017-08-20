#!/bin/bash
set -e

# run using:
# curl -sL https://raw.githubusercontent.com/mrkno/InternetMonitor/master/install.sh | sudo -E bash -

if [[ $EUID -ne 0 ]]; then
	echo "This script can only be executed as root." 2>&1
	exit 1
fi

git clone https://github.com/mrkno/InternetMonitor.git /opt/InternetMonitor
chown -R $USER:$USER /opt/InternetMonitor
cd /opt/InternetMonitor
npm install
cp /opt/InternetMonitor/deploy/internet-monitor.service /etc/systemd/system/internet-monitor.service
sed -i "s/REPLACEUSER/$USER/g" /etc/systemd/system/internet-monitor.service
systemctl daemon-reload
systemctl enable internet-monitor.service
systemctl start internet-monitor.service