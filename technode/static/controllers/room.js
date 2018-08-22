angular.module('techNodeApp').controller('RoomCtrl', function ($scope, $routeParams, socket) {
    socket.emit('getRoom', {
        _roomId: $routeParams._roomId
    })
    socket.on('messages.add', function (message) {
        $scope.messages.push(message)
    })

    socket.on('roomData', function (room) {
        $scope.room = room
        $scope.messages = room.messages
    })
    socket.on('online', function (user) {
        $scope.room.users.push(user)
    })
    socket.on('offline', function (user) {
        var _userId = user._id
        $scope.room.users = $scope.room.users.filter(function (user) {
            return user._id != _userId
        })
    })

    socket.on('$routeChangeStart', function () {
        socket.emit('leaveRoom', {
            user: $scope.me,
            room: $scope.room
        })
    })
    socket.on('leaveRoom', function (leave) {
        var _userId = leave.user._id
        $scope.room.users = $scope.room.users.filter(function (user) {
            return user._id != _userId
        })
    })
})