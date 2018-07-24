#!/bin/bash
set -e

# run using:
# curl -sL https://raw.githubusercontent.com/mrkno/InternetMonitor/master/install.sh | sudo -E bash -

git clone https://github.com/mrkno/InternetMonitor.git /opt/InternetMonitor
chown -R $USER:$USER /opt/InternetMonitor
cd /opt/InternetMonitor
npm install
cp /opt/InternetMonitor/internet-monitor.service /etc/systemd/system/internet-monitor.service
sed -i "s/REPLACEUSER/$USER/g" /etc/systemd/system/internet-monitor.service
systemctl daemon-reload
systemctl enable internet-monitor.service
systemctl start internet-monitor.service
