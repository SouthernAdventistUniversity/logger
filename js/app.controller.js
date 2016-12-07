(function() {
    'use strict';

    angular
        .module('logger')
        .controller('AppController', Controller);

    Controller.$inject = ['$scope', '$firebaseArray', '$timeout'];

    /* @ngInject */
    function Controller($scope, $firebaseArray) {
      var self = this;
      var currentRef = firebase.database().ref('track').on("value", function(values){
        $scope.current = values.val().currentAmount;
        $scope.final = values.val().finalAmount;
      ///  $scope.$apply();
      });

      $scope.words = [];
      var reasonRef = firebase.database().ref('users').orderByChild('reason').once("value", function(reasonList){
        reasonList.forEach(function(reasons){
          var newReason = {}
          newReason.word = reasons.val().reason;
          newReason.size = 5;
          $scope.words.push(newReason)
        });
        console.log($scope.words);
        $scope.$apply();
      });

      this.addHours = function(name, body, newAmount) {
        var hoursRef = firebase.database().ref('track').child('currentAmount');
        if(newAmount > 0){
          hoursRef.transaction(function(hours) {
            if(hours) {
               hours += newAmount;
               self.saveUser(name, body, newAmount);
            }
            else hours = newAmount;
            $scope.name = "";
            $scope.body = "";
            $scope.amount = "";
            return hours;
          });
        }
      }
      this.saveUser = function(name, body, hours) {
        var userRef = firebase.database().ref().child('users');
        $firebaseArray(userRef).$add({
          name: name,
          reason: body,
          hours: hours
        });
        console.log(name, body, hours);
      }
    }
})();
