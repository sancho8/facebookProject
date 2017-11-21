'use strict'

var app = angular.module("app", ['ngSanitize', 'ngCookies']);

app.controller("mainController", function($scope, $http, $cookieStore){

//http://localhost:3000/events?lat=40.710803&lng=-73.964040&distance=100&sort=venue&accessToken=YOUR_APP_ACCESS_TOKEN
$scope.accessToken = "";

$scope.eventsData = [];

$scope.isLoggedIn = false;

$scope.addressComponents = "adddress";

$scope.locationDetails = {};

$scope.isLoading = false;

$scope.checkLogin = function(){
	var token = $cookieStore.get('token');
	if(token != undefined){
		$scope.accessToken = token;
		$scope.isLoggedIn = true;
	}
}

$scope.executeSearch = function(){
	$scope.isLoading=true;
	$http({
		method: "GET",
		url: "http://localhost:8080/events",
		params: {
			lat: $scope.locationDetails[$scope.locationDetails.length-2],
			lng: $scope.locationDetails[$scope.locationDetails.length-1],
			distance: 100,
			sort: "venue",
			accessToken: $scope.accessToken
		}
	}).then(function mySuccess(response) {
		console.log(response);
		$scope.isLoading = false;
		$scope.eventsData = response.data.events;
	}, function myError(response) {
		$scope.isLoading = false;
		console.log(response);
	});
}

$scope.urlify = function(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

$scope.getDet = function(det){
	if(det != null){
	det = det.replace(/(\r\n|\n|\r)/gm, '<br>');

	det = $scope.urlify(det);

  	return det;

	}else{
		return '';
	}

}

$scope.logout = function(){
	 $cookieStore.remove('token');
	 $scope.accessToken = undefined;
	 window.location.reload();
}

$scope.myFacebookLogin = function() {
	FB.login(function(response) {
		if (response.authResponse) {
			var access_token =   FB.getAuthResponse()['accessToken'];
			console.log('Access Token = '+ access_token);
			debugger;
			$scope.isLoggedIn = true;
			$scope.accessToken = access_token;
			$cookieStore.put('token', access_token);
			$('#loginBtn').click();
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
.directive('googleplace', [ function() {
		return {
			require: 'ngModel',
			scope: {
				ngModel: '=',
				details: '=?'
			},
			link: function($scope, element, attrs, model) {
				var options = {
					types: [],
					componentRestrictions: {country: "ua"}
				};

				$scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

				google.maps.event.addListener($scope.gPlace, 'place_changed', function() {
					var geoComponents = $scope.gPlace.getPlace();
					var latitude = geoComponents.geometry.location.lat();
					var longitude = geoComponents.geometry.location.lng();
					var addressComponents = geoComponents.address_components;

					addressComponents = addressComponents.filter(function(component){
						switch (component.types[0]) {
                        case "locality": // city
                        return true;
                        case "administrative_area_level_1": // state
                        return true;
                        case "country": // country
                        return true;
                        default:
                        	return false;
                        }
                    }).map(function(obj) {
                    	return obj.long_name;
                    });

                    addressComponents.push(latitude, longitude);

                    $scope.$apply(function() {
                    $scope.details = addressComponents; // array containing each location component
					console.log(addressComponents);
					$scope.addressComponents = addressComponents;
                    model.$setViewValue(element.val());
                });
                });
			}
		};
	}]);