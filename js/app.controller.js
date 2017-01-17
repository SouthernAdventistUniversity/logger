(function() {
    'use strict';

    angular
        .module('logger')
        .controller('AppController', Controller);

    Controller.$inject = ['$scope', '$firebaseArray', '$timeout', '$http', '$mdMedia', 'NgMap'];

    /* @ngInject */
    function Controller($scope, $firebaseArray, $timeout, $http, $mdMedia, NgMap) {
      var self = this;
      $scope.service = {};
      $scope.complete = false;
      $scope.windows = [];
      $scope.$watch(function() { return $mdMedia('max-width: 960px'); }, function(small) {
        $scope.screenIsSmall = small;
      });
      
      var currentRef = firebase.database().ref('track').on("value", function(values){
        $timeout(function(){
          $scope.current = values.val() ? values.val().currentAmount : 0;
          $scope.final = values.val() ? values.val().finalAmount : 0;
        });
      });

      var locationRef = firebase.database().ref('users')
      $scope.locations = $firebaseArray(locationRef);
 


      this.addHours = function(name, body, newAmount) {
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
          if(data.city){
            var location = data.city + data.region_name,
                cleanLoc = location.replace(/[.-]/g, ""),
                userRef = firebase.database().ref().child('users/' + cleanLoc),
                locHoursRef = firebase.database().ref('users/' + cleanLoc).child('totalHours');
          } else {
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + data.latitude + ',' + data.longitude).then(function(gResponse){
              var location = gResponse.results[0].address_components[2].long_name + data.region_name,
                  cleanLoc = location.replace(/[.-]/g, ""),
                  userRef = firebase.database().ref().child('users/' + cleanLoc),
                  locHoursRef = firebase.database().ref('users/' + cleanLoc).child('totalHours');
            });
          }  

          var infowindow = new google.maps.InfoWindow(),
              center = new google.maps.LatLng(data.latitude + 2, data.longitude); 

          userRef.update({
            city: data.city,
            state: data.region_name,
            lat: data.latitude,
            long: data.longitude,
          });
          $firebaseArray(userRef).$add({
            hours: hours,
            reason: body,
            name: name,
            ip: data.ip,
            gaID: Cookies._ga
          });
          locHoursRef.transaction(function(time){
            if(time >= 0) time += hours;
            else time = hours;
            $scope.complete = true;
            return time;
          });   

          firebase.database().ref('users/' + cleanLoc).child('totalHours').on("value", function(values){
            infowindow.setContent(
              values.val() + ' hours from ' + data.city + ', ' + data.region_name
            ); 
          });  
          infowindow.setPosition(center);
          infowindow.open($scope.map);
          });
      }

      $scope.infoWindow = function(event, data){
        
        var center = new google.maps.LatLng(data[0] + 2, data[1]),
            loc = data[2] + data[3],
            cleanLoc = loc.replace(/[.-]/g, "");

        NgMap.getMap().then(function(map){
          var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(data[0], data[1])
          });
          firebase.database().ref('users/' + cleanLoc).child('totalHours').on("value", function(values){
            var info = new SnazzyInfoWindow({
              marker: marker,
              content: values.val() + ' hours from ' + data[2] + ', ' + data[3],
            });
            $scope.windows.unshift(info);
            if($scope.windows[1]){
              $scope.windows[1].close();
              $scope.windows.pop();
            } 
            info.open();
          });  

          
        });
      }

    }
})();
