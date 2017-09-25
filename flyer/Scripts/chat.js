var app = angular.module("ChatTest", []).controller("ChatController", function ($scope, $timeout) {
    $scope.messages = [];
    var ws = new WebSocket("ws://localhost:62396/api/Test");
    ws.onmessage = function (evt) {
        $timeout(function () {
            $scope.messages.push(JSON.parse(evt.data).payload);
        });
    };
    $scope.send = function (e) {
        if (e.keyCode === 13) {
            ws.send(JSON.stringify({ controller: "ChatController", action: "Chat", payload: { text: $scope.text } }));
            $scope.text = "";
        }
    };
}).directive("scroll", function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.scroll, function () {
                return element[0].scrollTop = element[0].scrollHeight;
            }, true);
        }
    };
}).directive("clickunfocus", function ($window) {
    return {
        link: function (scope, element) {
            element.on("click", function () {
                return angular.element(document.activeElement)[0].blur();
            });
        }
    };
});
