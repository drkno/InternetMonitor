const monitorApp = angular.module("monitorApp", ['chart.js']);
monitorApp.controller("MonitorCtrl", function($scope, $http) {
    $scope.speedData = [[],[]];
    $scope.speedSeries = ['Download', 'Upload'];
    $scope.speedLabels = [];
    $scope.speedColours = ['#FF9933', '#FF0000'];
    $scope.pingData = [[]];

    $scope.avDownload = 0;
    $scope.avUpload = 0;
    $scope.avPing = 0;
    $scope.maxDownload = 0;
    $scope.maxUpload = 0;
    $scope.maxPing = 0;
    $scope.minDownload = 0;
    $scope.minUpload = 0;
    $scope.minPing = 0;

    $scope.onlineData = [];
    $scope.onlineWindow = {
        max: {
            start: new Date(),
            end: new Date(),
            count: 0
        },
        averageCount: 0
    };

    $scope.options = {
        // maintainAspectRatio: false,
        scales: {
            xAxes: [
                {
                    ticks: {
                        autoSkipPadding: 60,
                        maxRotation: 90
                    }
                }
            ]
        }
    };

    const average = data => {
        const total = data.reduce((sum, x) => sum + x);
        return total / data.length;
    };

    const calc24HourSlidingWindow = data => {
        const res = {
            max: {
                start: new Date(),
                end: new Date(),
                count: 0
            },
            averageCount: 0
        };
        if (data.length === 0) {
            return res;
        }

        let k = 0;
        let j = 0;
        for (let i = 0; i < data.length; i++) {
            const start = new Date(data[i].end.getTime() - 5000);
            const end = new Date(start.getTime() + 86400000);
            while (j + 1 < data.length && data[j + 1].start < end) {
                j++;
            }
            const count = j - i + 1;
            k++;
            res.averageCount += count;

            if (res.max.count < count) {
                res.max.count = count;
                res.max.start = start;
                res.max.end = end;
            }

            if (j === data.length - 1) {
                break;
            }
        }

        res.averageCount /= k;
        return res;
    };

    $scope.reloadData = () => {
        $http.get('/api/v1/speed').then(function(response) {
            $scope.speedData = [
                response.data.data.map(d => d.download),
                response.data.data.map(d => d.upload)
            ];
            $scope.pingData = [response.data.data.map(d => d.ping)];
            $scope.speedLabels = response.data.data.map(d => `${$scope.formatDateTime(d.recorded)} (Server ${d.serverId})`);

            // remove internet disconnects from stats
            const downf = response.data.data.filter(d => d.serverId != -1).map(d => d.download);
            const upf = response.data.data.filter(d => d.serverId != -1).map(d => d.upload);
            const pingf = response.data.data.filter(d => d.serverId != -1).map(d => d.ping);

            $scope.avDownload = average(downf).toFixed(2);
            $scope.avUpload = average(upf).toFixed(2);
            $scope.avPing = average(pingf).toFixed(2);
            $scope.maxDownload = Math.max.apply(null, downf).toFixed(2);
            $scope.maxUpload = Math.max.apply(null, upf).toFixed(2);
            $scope.maxPing = Math.max.apply(null, pingf).toFixed(2);
            $scope.minDownload = Math.min.apply(null, downf).toFixed(2);
            $scope.minUpload = Math.min.apply(null, upf).toFixed(2);
            $scope.minPing = Math.min.apply(null, pingf).toFixed(2);
        });

        $http.get('/api/v1/online').then(function(response) {
            $scope.onlineData = response.data.data;
            for (let o of $scope.onlineData) {
                o.start = new Date(o.start);
                o.end = new Date(o.end);
            }
            $scope.onlineWindow = calc24HourSlidingWindow($scope.onlineData);
        });
    };

    const padLeft = num => {
        if (num.toString().length === 1) {
            return '0' + num.toString();
        }
        return num;
    };

    const strinfigyMillis = (millis) => {
        while (millis > 100) {
            millis /= 10.0;
        }
        millis = Math.round(millis);
        return padLeft(millis).toString();
    };

    $scope.toDuration = (start, end) => {
        start = new Date(start);
        end = new Date(end);
        let diff = end - start;
        const results = [];

        const hours = Math.floor(diff / 3600000);
        if (hours > 0) {
            results.push(hours + 'h');
            diff = diff % 3600000;
        }

        const mins = Math.floor(diff / 60000);
        if (mins > 0) {
            results.push(mins + 'm');
            diff = diff % 60000;
        }

        const seconds = Math.floor(diff / 1000);
        if (seconds > 0) {
            results.push(seconds + 's');
            diff = diff % 1000;
        }

        if (diff > 0) {
            results.push(strinfigyMillis(diff) + 'ms');
        }
        return results.join(' ');
    };

    $scope.formatDateTime = dt => {
        let d = dt;
        if (typeof(d) === 'string') {
            d = new Date(d);
        }
        return `${d.getFullYear()}-${padLeft(d.getMonth() + 1)}-${padLeft(d.getDate())} ${padLeft(d.getHours())}:${padLeft(d.getMinutes())}.${strinfigyMillis(d.getMilliseconds())}`;
    };

    $scope.reloadData();
});
