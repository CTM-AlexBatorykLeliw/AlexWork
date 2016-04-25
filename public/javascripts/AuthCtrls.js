var app = angular.module('auth', []);

app.directive('pw', function()
{
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, model){
            if(!attrs.pw)
                return;
            scope.$watch(attrs.pw, function(value){
                if(model.$viewValue !== undefined && model.$viewValue !== '')
                    model.$setValidity('pw', value === model.$viewValue);
            });
            model.$parsers.push(function(value){
                if (value === undefined || value === '')
                {
                    model.$setValidity('pw', true);
                    return value;
                }
                var isValid = value === scope.$eval(attrs.pw);
                model.$setValidity('pw', isValid);
                return isValid ? value : undefined;
            });
        }
    };
});