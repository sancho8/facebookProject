'use strict'

var app = angular.module("app", []);

app.controller("mainController", function($scope, $http){

//http://localhost:3000/events?lat=40.710803&lng=-73.964040&distance=100&sort=venue&accessToken=YOUR_APP_ACCESS_TOKEN
$scope.accessToken = "";

$scope.eventsData = [];

$scope.executeSearch = function(){
	$http({
		method: "GET",
		url: "http://localhost:8080/events",
		params: {
			lat: 40.710803,
			lng: -73.964040,
			distance: 100,
			sort: "venue",
			accessToken: $scope.accessToken
		}
	}).then(function mySuccess(response) {
		console.log(response);
		$scope.eventsData = response.data.events;
	}, function myError(response) {
		console.log(response);
	});
}

$scope.myFacebookLogin = function() {
	FB.login(function(response) {
		if (response.authResponse) {
			var access_token =   FB.getAuthResponse()['accessToken'];
			console.log('Access Token = '+ access_token);
			$scope.accessToken = access_token;
			FB.api('/me', function(response) {
				console.log('Good to see you, ' + response.name + '.');
			});
		} else {
			console.log('User cancelled login or did not fully authorize.');
		}
	}, {scope: ''});
	  /*FB.login(function(){}, {scope: 'publish_actions'});
	  var login = FB.getAuthResponse();
	  console.log("Login", login);*/
	} 

})