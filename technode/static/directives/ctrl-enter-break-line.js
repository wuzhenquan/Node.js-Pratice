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