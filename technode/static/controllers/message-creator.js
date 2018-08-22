// 将消息通过 socket 发送给服务端
angular.module('techNodeApp').controller('MessageCreatorCtrl', function ($scope, socket) {
    // $scope.newMessage 是通过 ng-model 与 textarea 直接绑定的
    // createMessage 是通过 ctrl-enter-break-line 与 textarea 直接绑定的
    $scope.createMessage = function () {
        socket.emit('messages.create', {
            content: $scope.newMessage,
            creator: $scope.me,
            _roomId: $scope.room._id
        })
        $scope.newMessage = ''
    }
})