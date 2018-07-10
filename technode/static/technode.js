
angular.module('techNodeApp', [])

angular.module('techNodeApp').factory('socket', function ($rootScope) {
    // var socket = io.connect('/')
    //为了避免跨域请求，需要将原来的var socket = io.connect('/')改成下面这一行
    // var socket = io.connect('http://localhost:3000/')
    //或者采用socket官方主页上面的方法 var socket = io()
    var socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments
                $rootScope.$apply(function () {
                    callback.apply(socket, args)
                })
            })
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args)
                    }
                })
            })
        }
    }
})

// textarea 改成通过 ctrl+enter 来换行, 而 enter 触发绑定的方法（ createMessage 方法）
angular.module('techNodeApp').directive('ctrlEnterBreakLine', function () {
    return function (scope, element, attrs) {
        var ctrlDown = false
        element.bind("keydown", function (evt) {
            if (evt.which === 17) {
                ctrlDown = true
                setTimeout(function () {
                    ctrlDown = false
                }, 1000)
            }
            if (evt.which === 13) {
                if (ctrlDown) {
                    element.val(element.val() + '\n')
                } else {
                    scope.$apply(function () {
                        scope.$eval(attrs.ctrlEnterBreakLine);
                    });
                    evt.preventDefault()
                }
            }
        });
    };
});

// 当用户按下回车时，将消息通过 socket 发送给服务端
angular.module('techNodeApp').controller('MessageCreatorCtrl', function ($scope, socket) {
    // $scope.newMessage 是通过 ng-model 与 textarea 直接绑定的
    // createMessage 是通过 ctrl-enter-break-line 与 textarea 直接绑定的
    $scope.createMessage = function () {
        socket.emit('messages.create', $scope.newMessage)
        $scope.newMessage = ''
    }
})

// 当消息出现滚动条时，该组件使得滚动条能随着消息的增加自动滚动到底部
angular.module('techNodeApp').directive('autoScrollToBottom', function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(
                function () {
                    return element.children().length;
                },
                function () {
                    element.animate({
                        scrollTop: element.prop('scrollHeight')
                    }, 1000);
                }
            );
        }
    };
});

angular.module('techNodeApp').controller('RoomCtrl', function ($scope, socket) {
    $scope.messages = []
    socket.on('messages.read', function (messages) {
        $scope.messages = messages
    })
    socket.on('messages.add', function (message) {
        $scope.messages.push(message)
    })
    socket.emit('messages.read')
})