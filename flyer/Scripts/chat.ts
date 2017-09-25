var app = angular.module("ChatTest", []).controller("ChatController", function ($scope, $timeout) {
    $scope.messages = [];

    function url() {
        var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
        new_uri += "//" + loc.host;
        new_uri += "/api/Test";
        return new_uri;
    }
    var ws = new WebSocket(url());
    var yourId = null;
    ws.onmessage = function (evt) {
        var msg = JSON.parse(evt.data);

        if (msg.controller == "ChatController") {
            $timeout(function () {
                if (msg.payload.yourId) {
                    yourId = msg.payload.yourId;
                }
                $scope.messages.push(msg.payload);
            });
        }
        else if (msg.controller == "PlayerPositionController") {
            if ((<any>window).setPlayerPosition) {
                (<any>window).setPlayerPosition(msg.payload.clientId, msg.payload);
            }
        } else if (msg.controller == "CatchmeController") {
            $timeout(function () {
                console.log("a", yourId);
                if (msg.payload.clientId == yourId) {
                    $scope.yourTurn = true;
                    $scope.messages.push({ clientId: "", text: "Du bist dran!" });
                } else {
                    $scope.yourTurn = false;
                    $scope.messages.push({ clientId: "", text: msg.payload.clientId + " ist dran!" });
                }
                
            });
        }
    }
    var _pos = null;
    var lastPos = null;

    (<any>window).setPosition = function (pos) {
        if (!lastPos || (lastPos.x != pos.x || lastPos.y != pos.y || lastPos.z != pos.z || lastPos.yaw != pos.yaw)) {
            _pos = pos;
        }
        lastPos = pos;
    }

    ws.onopen = function () {
        setInterval(function () {
            if (_pos) {
                ws.send(JSON.stringify({ controller: "PlayerPositionController", action: "SendPosition", payload: _pos }));
                _pos = null;
            }
        }, 100);
    }

    $scope.send = function (e) {
        if (e.keyCode === 13) {
            ws.send(JSON.stringify({ controller: "ChatController", action: "Chat", payload: { text: $scope.text } }));
            $scope.text = "";
        }
    }
}).directive("scroll", function () {
    return {
        link(scope, element, attrs: any) {
            scope.$watch(attrs.scroll, () =>
                element[0].scrollTop = element[0].scrollHeight, true);
        }
    };
}).directive("clickunfocus", function ($window) {
    return {
        link(scope, element) {
            element.on("click", () =>
                angular.element(document.activeElement)[0].blur());
        }
    };
});