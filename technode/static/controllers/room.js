angular.module('techNodeApp').controller('RoomCtrl', function ($scope, socket) {
    socket.on('messages.read', function (messages) {
        $scope.messages = messages
    })
    socket.on('messages.add', function (message) {
        $scope.messages.push(message)
    })
    socket.emit('messages.read')

    socket.on('roomData', function(room){
        $scope.room = room
    })
    socket.emit('getRoom')
    socket.on('online', function(user){
        $scope.room.users.push(user)
    })
    socket.on('offline', function(user){
        var _userId = user._id
        $scope.room.users = $scope.room.users.filter(function(user){
            return user._id != _userId
        })
    })
})