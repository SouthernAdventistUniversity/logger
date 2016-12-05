(function() {
    'use strict';

    angular
        .module('logger')
        .controller('AppController', Controller);

    Controller.$inject = ['$scope', '$firebaseArray'];

    /* @ngInject */
    function Controller($scope, $firebaseArray) {
      var self = this;





      this.addHours = function(name, body, newAmount) {
        var hoursRef = firebase.database().ref('track').child('currentAmount');
        if(newAmount > 0){
          hoursRef.transaction(function(hours) {
            if(hours) {
               hours += newAmount;
               self.saveUser(name, body, newAmount);
            }
            else hours = newAmount;
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
