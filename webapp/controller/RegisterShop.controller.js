sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	'sap/m/MessageBox',
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel"
], function(BaseController, formatter, MessageBox, models, JSONModel) {
	"use strict";

	var gMap;
	var markers;
	return BaseController.extend("sap.ui.demo.basicTemplate.controller.RegisterShop", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();
			var oRouter = this.getRouter();
			var oModel = new sap.ui.model.json.JSONModel();
			this.setModel(oModel, "dataCity");
			this.checkRegister = true;

			this.getView().byId("map_canvas").addStyleClass("myMap");
			oRouter.getRoute("registerShop").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			// check Login
			this.isLogging();
			/** Get data **/
			var that = this;
			this.getDataCity();
			this.getDataCategory();

			var emailUser = this.getGlobalModel().getProperty("/username");

			var modelRegister = new JSONModel({
				email: emailUser,
				shopName: "",
				phone: "",
				district: "",
				address: "",
				lat: "",
				lng: ""
			});
			this.setModel(modelRegister, "modelRegister");

			/**************************************/
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var lat = position.coords.latitude,
						lng = position.coords.longitude;
					that.setLocation(lat, lng);
				}, function() {
					MessageBox.error("Bạn từ chối chia sẻ vị trí. Hãy bật nó lên để sử dụng chức năng này hoặc sử dụng các công cụ tìm kiếm khác.");
				});
			} else {
				// Browser doesn't support Geolocation
				MessageBox.error("Trình duyệt của bạn không hỗ trợ Geolocation");
			}
			if(markers) {
				this.clearMarker();
			}
		},

		validatePhone: function() {
			var getId = this.getView().byId("ip_phone");
			var getValue = getId.getValue();

			var phoneRegex = /((09|03|07|08|05)+([0-9]{8})\b)/g;

			if (!phoneRegex.test(getValue)) {
				getId.setValueState(sap.ui.core.ValueState.Error);
				this.checkRegister = false;
			} else {
				getId.setValueState(sap.ui.core.ValueState.Success);
				this.checkRegister = true;
			}
		},

		handleUserInput: function(oEvent) {
			var check = false;
			var sUserInput = oEvent.getParameter("value");
			var oInputControl = oEvent.getSource();
			if (!sUserInput || sUserInput == "") {
				oInputControl.setValueState(sap.ui.core.ValueState.Error);
				this.checkRegister = false;
			} else {
				oInputControl.setValueState(sap.ui.core.ValueState.Success);
				check = true;
			}
			return check;
		},

		registerShop: function() {
			//set busy
			var modelResiter = this.getModel("modelRegister");
			modelResiter.setProperty("/isPressing", true);

			// var email = this.getView().byId("emailRegister").getProperty("value");
			// var shopName = this.getView().byId("ip_shopname").getProperty("value");
			// var phone = this.getView().byId("ip_phone").getProperty("value");
			var keyDistrict = this.getView().byId("filterDistrict").getSelectedKey();
			var email = this.getModel("modelRegister").getProperty("/email");
			var shopName = this.getModel("modelRegister").getProperty("/shopName");
			var phone = this.getModel("modelRegister").getProperty("/phone");
			var address = this.getView().byId("ip_address").getProperty("value");
			var lat = this.getModel("modelRegister").getProperty("/lat");
			var lng = this.getModel("modelRegister").getProperty("/lng");
			var accountId = this.getGlobalModel().getProperty("/accountId");

			if (this.checkRegister == true) {
				if (lat === "" && lng === "") {
					MessageBox.error("Kéo Marker để có vị trí chính xác của Cửa hàng!");
				} else {
					var registerData = {
						accountId: accountId,
						shopName: shopName,
						email: email,
						phoneNumber: phone,
						districtId: keyDistrict,
						address: address,
						longtitude: lng,
						latitude: lat
					};
					var registerShop = models.registerShop(registerData);
					if (registerShop == "success") {
						MessageBox.success("Gửi đăng ký thành công! Hệ thống sẽ duyệt Cửa hàng của bạn!");
					} else if (registerShop.status === 406) {
						MessageBox.error("Tài khoản này đã được đăng ký thành chủ tiệm");
					} else {
						MessageBox.error("Lỗi hệ thống!");
					}
					modelResiter.setProperty("/isPressing", false);
				}
			} else {
				MessageBox.error("Thông tin đăng kí chưa chính xác!");
				modelResiter.setProperty("/isPressing", false);
			}
		},

		clearMarker: function() {
			markers.setMap(null);
		},

		getLocationFromInput: function() {
			this.clearMarker();
			var that = this;
			var getView = this.getView().byId("ip_address");
			var getAddress = getView.getProperty("value");
			var getCity = this.getView().byId("filterCity").getSelectedItem().getText();
			var getDis = this.getView().byId("filterDistrict").getSelectedItem().getText();
			var fullAddress = getAddress + ", " + getDis + "," + getCity;

			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				'address': fullAddress
			}, function(results, status) {
				if (status === 'OK') {
					gMap.setCenter(results[0].geometry.location);
					markers = new google.maps.Marker({
						map: gMap,
						position: results[0].geometry.location,
						draggable: true
					});
					var currentLatitude = markers.getPosition().lat();
					var currentLongitude = markers.getPosition().lng();
					that.getModel("modelRegister").setProperty("/lat", currentLatitude);
					that.getModel("modelRegister").setProperty("/lng", currentLongitude);
					that.getLatLng(markers);
				} else {
					MessageBox.error("Địa chỉ bạn nhập chưa đúng!");
				}
			});
		},

		getLatLng: function(marker) {
			var that = this;
			google.maps.event.addListener(marker, 'dragend', function(marker) {
				var latLng = marker.latLng;
				var currentLatitude = latLng.lat();
				var currentLongitude = latLng.lng();
				that.getModel("modelRegister").setProperty("/lat", currentLatitude);
				that.getModel("modelRegister").setProperty("/lng", currentLongitude);
			});
		},

		setLocation: function(lat, lng) {
			var that = this;
			var latLong = new google.maps.LatLng(lat, lng);
			var myEmail = this.getGlobalModel().getProperty("/username");
			var content = "<h3>" + myEmail + "</h3>";

			markers = new google.maps.Marker({
				position: latLong,
				map: gMap,
				draggable: true
			});
			var infowindow = new google.maps.InfoWindow({
				content: content
			});
			markers.addListener('click', function() {
				infowindow.open(gMap, markers);
			});
			google.maps.event.addListener(markers, 'dragend', function(marker) {
				var latLng = marker.latLng;
				var currentLatitude = latLng.lat();
				var currentLongitude = latLng.lng();
				that.getModel("modelRegister").setProperty("/lat", currentLatitude);
				that.getModel("modelRegister").setProperty("/lng", currentLongitude);
				// console.log(currentLatitude, currentLongitude);
			});
			markers.setMap(gMap);

			gMap.setZoom(15);
			gMap.setCenter(markers.getPosition());
		},

		/*********************************************************************/

		getDataCategory: function() {
			var that = this;
			var onSuccess = function(res, status, xhr) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					results: res
				});
				that.setModel(oModel, "dataCate");

			};
			var onError = function(jqXHR, textStatus, errorThrown) {};
			$.ajax({
				type: "GET",
				url: "model/category.json",
				dataType: "json",
				success: onSuccess,
				error: onError
			});
		},

		getDataCity: function() {
			var that = this;
			var onSuccessOfCity = function(res, status, xhr) {
				var oModel = that.getModel("dataCity");
				oModel.setProperty("/results", res);
				oModel.setProperty("/selectedCity", res[0].id);
				oModel.updateBindings();

			};
			var onErrorOfCity = function(jqXHR, textStatus, errorThrown) {};
			$.ajax({
				type: "GET",
				url: "model/dataLocation.json",
				dataType: "json",
				success: onSuccessOfCity,
				error: onErrorOfCity
			});

			/******************************************************************************************************/
			/** Get data Distrisct **/
			var onSuccessOfDistrisct = function(res, status, xhr) {
				var dataDis = [];
				for (var i = 0; i < res.length; i++) {
					dataDis.push(res[i]);
				}

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData({
					results: dataDis
				});
				that.setModel(oModel, "dataDis");
				that.onChangeCity();
			};
			var onErrorOfDistrisct = function(jqXHR, textStatus, errorThrown) {};
			$.ajax({
				type: "GET",
				url: "model/dataDisRegister.json",
				dataType: "json",
				success: onSuccessOfDistrisct,
				error: onErrorOfDistrisct
			});
			/***************************************************/
		},
		getDistrictByCity: function(cityId) {
			var filters = [];
			var cityIdFilter = new sap.ui.model.Filter({
				path: "cityId",
				operator: "EQ",
				value1: cityId
			});
			filters.push(cityIdFilter);
			this.byId("filterDistrict").getBinding("items").filter(filters);
		},
		onChangeCity: function() {
			var cityModel = this.getModel("dataCity");
			if (cityModel) {
				var keyCity = cityModel.getProperty("/selectedCity");
				this.getDistrictByCity(keyCity);
			}
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