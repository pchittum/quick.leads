/**
 * Describe Salesforce object to be used in the app. For example: Below AngularJS factory shows how to describe and
 * create an 'Contact' object. And then set its type, fields, where-clause etc.
 *
 *  PS: This module is injected into ListCtrl, EditCtrl etc. controllers to further consume the object.
 */
function HomeCtrl($scope, AngularForce, $location, $route) {

    $scope.authenticated = AngularForce.authenticated();
    if (!$scope.authenticated) {
        if (AngularForce.inVisualforce) {
            AngularForce.login();
        } else {    
            return $location.path('/login');
        }
    }

    $scope.viewContacts = function() {
        console.log("HomeCtrl go to contacts...");
        $location.path('/contacts');
    }
    
    $scope.logout = function () {
        AngularForce.logout();
        $location.path('/login');
    }
}

function LoginCtrl($scope, AngularForce, $location) {
    $scope.login = function () {
        AngularForce.login();
    }

    if (AngularForce.inVisualforce) {
        AngularForce.login();
        console.log("LoginCtrl just authenticated go to /");
        $location.path('/');
    }
}

function CallbackCtrl($scope, AngularForce, $location) {
    AngularForce.oauthCallback(document.location.href);
    $location.path('/contacts');
}

