
angular.module('techNodeApp', ['ngRoute']).run(function ($window, $rootScope, $http, $location) {
    $window.moment.lang('zh-cn')
    // 应用启动时验证 ‘/api/validate' 接口
    // 如果用户已登录 请求 ‘/’ url
    // 如果用户未登录 请求 ‘/login' url
    $http({
        url: '/api/validate',
        method: 'GET'
    }).success(function (user) { // 
        $rootScope.me = user
        $location.path('/')
    }).error(function (data) { // 
        $location.path('/login')
    })

    $rootScope.logout = function(){
        $http({
            url: '/api/logout',
            method: 'GET'
        }).success(function (user) {
            $rootScope.me = null
            $location.path('/login')
        })
    }
    $rootScope.$on('login', function(evt, me){
        $rootScope.me = me
    })
})