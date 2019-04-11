sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/basicTemplate/model/models"
], function(BaseController, formatter, JSONModel, models) {
	"use strict";

	var gMap, dataLocation = [],
		count = 0,
		markers = [];

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.NearByLocation", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();
			var oRouter = this.getRouter();

			this.getView().byId("map_canvas").addStyleClass("myMap");
			oRouter.getRoute("nearByLocation").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.radius = 5;
			this.lat = oEvent.getParameter("arguments").lat;
			this.lng = oEvent.getParameter("arguments").lng;
			var latLong = new google.maps.LatLng(this.lat, this.lng);
			var currentPos = new google.maps.Marker({
				position: latLong,
				map: gMap,
				icon: {
					url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
				}
			});
			gMap.setZoom(15);
			gMap.setCenter(currentPos.getPosition());

			this.clearMarker();
			count = 0;
			this.getAllMarker(this.lat, this.lng);
		},

		clearMarker: function() {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		},

		getAllMarker: function(lat, lng, count) {
			var radius = this.radius;
			var titleModel = new JSONModel({
				title: ""
			});
			this.setModel(titleModel, "titleModel");
			var getData = models.getLocationNearBy(lat, lng, radius);
			if (getData) {
				for (var i = 0; i < getData.length; i++) {
					dataLocation.push(getData[i]);
				}
				this.createLocationShop(dataLocation, lat, lng);
			} else {
				this.getModel("titleModel").setProperty("/title", "Xin lỗi! Không có Cửa hàng nào gần bạn!");
			}
		},

		createLocationShop: function(dataLoca, lat, lng) {
			for (var i = 0; i < dataLoca.length; i++) {
				var latShop = dataLoca[i].latitude;
				var lngShop = dataLoca[i].longtitude;
				var shopName = dataLoca[i].shopName;
				var distance = this.calculateDistance(latShop, lngShop, lat, lng);
				if (distance <= 1000) {
					this.getPositionOfMarker(latShop, lngShop, shopName);
					this.getModel("titleModel").setProperty("/title", "Kết quả tìm kiếm 'gần đây 1km'");
				} else {
					this.getModel("titleModel").setProperty("/title", "Xin lỗi! Không có Cửa hàng nào gần bạn!");
				}
			}
		},

		getPositionOfMarker: function(lat, lng, shopName) {
			var position = {
				lat: lat,
				lng: lng
			};
			this.addMarker(position, shopName);
		},

		findMore: function() {
			if (count < 2) {
				this.clearMarker();
			}
			count++;
			if (count == 3) {
				this.radius = 10;
				this.getAllMarker(this.lat, this.lng);
			}
			for (var i = 0; i < dataLocation.length; i++) {
				var list = dataLocation[i].address;
				var latShop = list.latitude;
				var lngShop = list.longtitude;
				var shopName = dataLocation[i].shopName;
				var distance = this.calculateDistance(latShop, lngShop, this.lat, this.lng);
				if (count == 1) {
					if (distance <= 3000) {
						this.getPositionOfMarker(latShop, lngShop, shopName);
						this.getModel("titleModel").setProperty("/title", "Kết quả tìm kiếm 'gần đây 3km'");
					}
				} else if (count == 2) {
					if (distance <= 5000) {
						this.getPositionOfMarker(latShop, lngShop, shopName);
						this.getModel("titleModel").setProperty("/title", "Kết quả tìm kiếm 'gần đây 5km'");
					}
				} else if (count == 3) {
					if (distance <= 10000) {
						this.getPositionOfMarker(latShop, lngShop, shopName);
						this.getModel("titleModel").setProperty("/title", "Kết quả tìm kiếm 'gần đây 10km'");
					}
				} else {
					this.getModel("titleModel").setProperty("/title", "Chỉ tìm kiếm trong vòng bán kính 10km!");
				}
			}
		},

		calculateDistance: function(latShop, longShop, locationLat, locationLong) {
			var R = 6371e3; // metres
			var φ1 = this.toRadians(locationLat);
			var φ2 = this.toRadians(latShop);
			var Δφ = this.toRadians(latShop - locationLat);
			var Δλ = this.toRadians(longShop - locationLong);

			var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
				Math.cos(φ1) * Math.cos(φ2) *
				Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			var d = R * c;

			return d;
		},

		toRadians: function(deg) {
			var pi = Math.PI;
			return deg * (pi / 180);
		},

		addMarker: function(position, name) {
			var latLog = new google.maps.LatLng(position.lat, position.lng);
			var marker = new google.maps.Marker({
				position: latLog,
				map: gMap,
				animation: google.maps.Animation.DROP
			});
			markers.push(marker);
			var infowindow = new google.maps.InfoWindow({
				content: name
			});
			marker.addListener('click', function() {
				infowindow.open(gMap, marker);
			});
			// this.markers.push(marker);
		},

		onAfterRendering: function() {
			var mapOptions = {
				center: new google.maps.LatLng(0, 0),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			gMap = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), mapOptions);
		}

	});
});