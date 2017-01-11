(function() {
    'use strict';

    angular
        .module('logger')
        .controller('AppController', Controller);

    Controller.$inject = ['$scope', '$firebaseArray', '$timeout', '$http'];

    /* @ngInject */
    function Controller($scope, $firebaseArray, $timeout, $http) {
      var self = this;
      $scope.service = {};
      var currentRef = firebase.database().ref('track').on("value", function(values){
        $timeout(function(){
          $scope.current = values.val() ? values.val().currentAmount : 0;
          $scope.final = values.val() ? values.val().finalAmount : 0;
        });
      });

      var locationRef = firebase.database().ref('users')
      $scope.locations = $firebaseArray(locationRef);
 


      this.addHours = function(name, body, newAmount) {
        console.log(name, body, newAmount);
        if(name && body && newAmount > 0){
          var hoursRef = firebase.database().ref('track').child('currentAmount');
            hoursRef.transaction(function(hours) {
              if(hours >= 0) {
                 hours += newAmount;
                 self.saveUser(name, body, newAmount);
              }
              else hours = newAmount;
              return hours;
            });    
        }
      }

      this.saveUser = function(name, body, hours) {

        $http.get('http://sau-geoiplookup.herokuapp.com/json/').then(function(response){
          var data = response.data;
          var location = data.city + data.region_name;
          var cleanLoc = location.replace(/[.-]/g, "");
          console.log(location, cleanLoc);
          var userRef = firebase.database().ref().child('users/' + cleanLoc);
          var locHoursRef = firebase.database().ref('users/' + cleanLoc).child('totalHours');       
          $firebaseArray(userRef).$add({
            hours: hours,
            reason: body,
            name: name,
            ip: data.ip,
            gaID: Cookies._ga
          });
          userRef.update({
            city: data.city,
            state: data.region_name,
            lat: data.latitude,
            long: data.longitude,
          });
          locHoursRef.transaction(function(time) {
            if(time >= 0) time += hours;
            else time = hours;
            return time;
          });   
        });
      }

      $scope.showDirections = function(event, data){
        var infowindow = new google.maps.InfoWindow();
        console.log(data);
        var center = new google.maps.LatLng(data.lat + 2, data.long);
        var loc = data.city + data.state;
        var cleanLoc = loc.replace(/[.-]/g, "");

        firebase.database().ref('users/' + cleanLoc).child('totalHours').on("value", function(values){
          infowindow.setContent(
            values.val() + ' hours from ' + data.city + ', ' + data.state
          ); 
        });  



        infowindow.setPosition(center);
        infowindow.open($scope.map);
      }

    }
})();
