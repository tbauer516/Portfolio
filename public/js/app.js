'use strict';

angular.module('Portfolio', ['ui.router', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics', 'duScroll', 'firebase'])

.value('duScrollOffset', 50)

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        })
        .state('edit', {
            url: '/edit',
            templateUrl: 'partials/edit.html',
            controller: 'EditCtrl'
        })
        .state('itemEdit', {
            url: '/edit/{id}',
            templateUrl: 'partials/edit.html',
            controller: 'EditCtrl'
        })
        .state('infoEdit', {
            url: '/infoEdit/{id}',
            templateUrl: 'partials/infoEdit.html',
            controller: 'InfoEditCtrl'
        })
        .state('email', {
            url: '/email',
            templateUrl: 'partials/email.html',
            controller: 'EmailControl'
        });

    // $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/#');
}])

// parent controller that houses all the ui-views
// put all global functions and variables here to access them from
// the other ui-views
.controller('PortfolioCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$firebaseAuth', function($scope, $firebaseArray, $firebaseObject, $firebaseAuth) {

    //reference to the app
    var ref = new Firebase("https://bauerportfolio.firebaseio.com");

    //make the Auth service for this app
    var Auth = $firebaseAuth(ref);

    //reference to a value in the JSON in the Sky
    var valueRef = ref.child('projects').orderByChild('date');
    if (valueRef === undefined) {
        ref.push().set({
            'projects': []
        });
        valueRef = ref.child('projects').orderByChild('date');
    }

    var valueRef2 = ref.child('info');
    if (valueRef2 === undefined) {
        ref.push().set({
            'info': {}
        });
        valueRef2 = ref.child('info');
    }

    $scope.projects = $firebaseArray(valueRef);
    $scope.info = $firebaseObject(valueRef2);

    // signUp function that chains and calls signIn afterwards
    // $scope.signUp = function(email, password) {
    //     console.log("creating user " + email + ', ' + password);
    //     //pass in an object with the new 'email' and 'password'
    //     var promise = Auth.$createUser({
    //             'email': email,
    //             'password': password
    //         })
    //         .then($scope.signIn)
    //         .catch(function(error) {
    //             return error;
    //         })
    //     return promise;
    // };

    $scope.delete = function(item) {
        var approve = confirm("Are you sure you want to delete?");
        if (approve) {
            $scope.projects.$remove(item);
        }
    };

    //separate signIn function
    $scope.signIn = function(email, password) {
        console.log(email + ', ' + password);
        var promise = Auth.$authWithPassword({
                'email': email,
                'password': password
            })
            .catch(function(error) {
                return error;
            });
        return promise;
    };

    //Make LogOut function available to views
    $scope.logOut = function() {
        Auth.$unauth(); //"unauthorize" to log out
    };

    //Any time auth status updates, set the userId so we know
    Auth.$onAuth(function(authData) {
        if (authData) { //if we are authorized
            $scope.userId = authData.uid;
            $scope.userName = authData.password.email;
        } else {
            $scope.userId = undefined;
            $scope.userName = undefined;
        }
    });

    //Test if already logged in (when page load)
    var authData = Auth.$getAuth(); //get if we're authorized
    $scope.loggedIn = authData; // easy variable to test if logged in
    if (authData) {
        $scope.userId = authData.uid;
        $scope.userName = authData.password.email;
    }

}])

.controller('HomeCtrl', ['$scope', '$element', function($scope, $element) {

    $scope.getDemoSite = function(project) {
        if (project.type == "github") {
            var githubArray = project.link.split("/");
            var index = githubArray.length - 1;
            var projectName = githubArray[index];
            return "http://bauer-demo.herokuapp.com/" + projectName
        } else {
            return project.demo;
        }
    }

    var height = window.innerHeight;
    var sections = document.querySelectorAll('.section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].style.minHeight = (height - 50) + 'px';
    }

    $scope.logOut = $scope.$parent.logOut;

    $scope.getDate = function(date) {
        return new Date(date);
    }

    var clipboard = new Clipboard('#myEmail');

    $scope.isOpen = false;

}])

.controller('LoginCtrl', ['$scope', function($scope) {

    $scope.signIn = $scope.$parent.signIn;

}])

.controller('EditCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {

    $scope.projects = $scope.$parent.projects;
    $scope.id = $stateParams.id;

    $scope.gitorvid = "github";

    if ($scope.id != undefined) {
        $scope.demo = $scope.projects[$scope.id].demo;
        $scope.gitorvid = $scope.projects[$scope.id].type;
        $scope.title = $scope.projects[$scope.id].title;
        $scope.description = $scope.projects[$scope.id].description;
        $scope.image = $scope.projects[$scope.id].image;
        $scope.link = $scope.projects[$scope.id].link;
        $scope.date = new Date($scope.projects[$scope.id].date * -1);
    }

    $scope.save = function() {
        // var newDate = ($scope.date.getMonth() + 1) + '-' + $scope.date.getDate() + '-' + $scope.date.getFullYear();
        var newDate = $scope.date.getTime() * -1;
        var newProject = {
            type : $scope.gitorvid,
            title : $scope.title,
            description : $scope.description,
            image: $scope.image,
            link : $scope.link,
            demo : $scope.demo,
            date : newDate
        }
        $scope.$parent.projects.$add(newProject);
    }

    $scope.edit = function() {
        // var newDate = ($scope.date.getMonth() + 1) + '-' + $scope.date.getDate() + '-' + $scope.date.getFullYear();
        var newDate = $scope.date.getTime() * -1;
        $scope.projects[$scope.id].type = $scope.gitorvid;
        $scope.projects[$scope.id].title = $scope.title;
        $scope.projects[$scope.id].description = $scope.description;
        $scope.projects[$scope.id].image = $scope.image;
        $scope.projects[$scope.id].link = $scope.link;
        $scope.projects[$scope.id].demo = $scope.demo;
        $scope.projects[$scope.id].date = newDate;
        $scope.$parent.projects.$save($scope.$parent.projects[$scope.id]);
    }

    $scope.clearImg = function() {
        $scope.image = '';
    }

}])

.controller('InfoEditCtrl', ['$scope', function($scope) {

    if ($scope.$parent.info.dob) {
    $scope.dob = $scope.$parent.info.dob;
    $scope.school = $scope.$parent.info.school;
    $scope.degree = $scope.$parent.info.degree;
    $scope.skills = $scope.$parent.info.skills.join(", ");
    $scope.languages = $scope.$parent.info.languages.join(", ");
    $scope.image = $scope.$parent.info.image;
    $scope.description = $scope.$parent.info.description;
    }

    $scope.saveInfo = function() {
        $scope.$parent.info.dob = $scope.dob;
        $scope.$parent.info.school = $scope.school;
        $scope.$parent.info.degree = $scope.degree;
        $scope.$parent.info.skills = $scope.skills.split(", ");
        $scope.$parent.info.languages = $scope.languages.split(", ");
        $scope.$parent.info.image = $scope.image;
        $scope.$parent.info.description = $scope.description;
        $scope.$parent.info.$save();
    }

}])

.controller('EmailControl', ['$scope', function($scope) {



}])

.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})

.filter('encodeURI', function() {
    return window.encodeURI;
})

.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return {
                    'height': (newValue.h - 100) + 'px',
                        'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
});