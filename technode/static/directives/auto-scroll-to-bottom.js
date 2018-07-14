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