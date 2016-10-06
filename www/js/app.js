// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var currentPosition;
var currentMap;
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}).config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('map', {
      url: '/',
      templateUrl: 'templates/map.html',
      controller: 'MapCtrl'
    });

  $urlRouterProvider.otherwise("/");

}).controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    currentPosition = position;
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);


    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    currentMap = $scope.map;
    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });
      var infoWindow = new google.maps.InfoWindow({
        content: "Here I am!"
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

    });

  }, function(error){
    console.log("Could not get location");

  });
}).controller('MyController', function($scope, $ionicModal, $http) {


  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });



  $scope.user = {};
  $scope.registerUser = function (user) {
    $scope.modal.hide();
    //console.log("1: " + user.userName);
    //console.log("2: " + user.distance);
    user.loc = {type: "Point", coordinates: []}; //GeoJSON point
    user.loc.coordinates.push(currentPosition.coords.longitude); //Observe that longitude comes first
    user.loc.coordinates.push(currentPosition.coords.latitude); //in GEoJSON
    //   console.log(JSON.stringify(user));
    $http({
      method: "POST",
      url: "https://node-magnuslarsen.rhcloud.com/friends/register/"+user.distance,
      data: user
    }).then(
      function(data){

        var infowindow = new google.maps.InfoWindow;

        var marker, i;

        for (i = 0; i < data.data.length; i++) {
          marker = new google.maps.Marker({
            map: currentMap,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(data.data[i].loc.coordinates[1], data.data[i].loc.coordinates[0])
          });

          google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
              infowindow.setContent(data.data[i].userName);
              infowindow.open(map, marker);
            }
          })(marker, i));
        }
      }
    )

  }



});
