sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox'
], function(BaseController, formatter, models, JSONModel, MessageBox) {
	"use strict";

	var gMap, markers = [];
	return BaseController.extend("sap.ui.demo.basicTemplate.controller.FindShopByMap", {

		formatter: formatter,

		onInit: function() {
			var oRouter = this.getRouter();
			var oModel = new JSONModel();
			this.setModel(oModel, "dataCity");

			this.checkMarker = false;

			oRouter.getRoute("findShopByMap").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.checkLoginEachPage();
			this.getView().byId("map_canvas").addStyleClass("myMap");
			/** Get data **/
			this.getDataCity();
			this.getDataCategory();

			var check = this.checkMarker;
			if (check === true) {
				this.clearMarker();
			}

			var idDis = oEvent.getParameter("arguments").dis;
			var idCate = oEvent.getParameter("arguments").cate;
			this.getAllShopByMapFilter(idCate, idDis);
		},

		clearMarker: function() {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			markers = [];
		},

		getAllShopByMapFilter: function(idCate, idDis) {
			var check = this.checkMarker;
			if (check === true) {
				this.clearMarker();
			}
			if (idCate == "null" || !idCate) {
				idCate = 0;
			}
			if (idDis == "null" || !idDis) {
				idDis = 0;
			}
			var getShop = models.getShopByMap(idCate, idDis);
			if (getShop.length > 0) {
				for (var i = 0; i < getShop.length; i++) {
					this.getPositionOfMarker(getShop[i]);
				}
			} else {
				MessageBox.information("Không có Cửa hàng theo khu vực bạn chọn!");
			}
			this.checkMarker = true;
		},

		searchPlaceByForm: function() {
			var keyDistrics = this.getView().byId("filterDistrict").getSelectedItem().getKey();
			var keyItem = this.getView().byId("filterItem").getSelectedItem().getKey();
			if (keyDistrics === "") {
				keyDistrics = 0;
			}
			if (keyItem === "") {
				keyItem = 0;
			}
			this.getAllShopByMapFilter(keyItem, keyDistrics);
		},

		getPositionOfMarker: function(data) {
			var that = this;
			var location = data.address;
			var latLog = new google.maps.LatLng(location.latitude, location.longtitude);

			var marker = new google.maps.Marker({
				position: latLog,
				map: gMap,
				animation: google.maps.Animation.DROP
			});

			markers.push(marker);
			var shopId = data.id;
			var address = data.address;
			var fullAddress = address.fullAddress;
			var content = "<div id='shopDetail' class='box_shopDetailMap'><image class='custom-image-box' src=" + data.avatarUrl +
				" /><div class='custom-content-box'><h1>" + data.shopName +
				"</h1><span>Địa chỉ: </span><a href='https://mortgage.dfksoft.com/#/ShopDetail/" + shopId + "'>" + fullAddress +
				"</a></div></div>";
			var infowindow = new google.maps.InfoWindow({
				// content: data.shopName
				content: content
			});
			marker.addListener('click', function() {
				infowindow.open(gMap, marker);
				// var those = that;
				// $(document).on("click", "#shopDetail", function(oEvent) {
				// 	console.log(oEvent);
				// 	those.getRouter().navTo("shopDetail", {
				// 		shopId: shopId
				// 	});
				// });
			});
			gMap.setCenter(marker.getPosition());
		},

		onPressShopDetail: function() {
			console.log("abc");
		},

		getDataCategory: function() {
			var arrayOfHuy = [];
			var dataCate = models.getDataCategory();
			var objAll = {
				categoryName: "Tất cả"
			};
			arrayOfHuy.push(objAll);
			if (dataCate) {
				for (var i = 0; i < dataCate.length; i++) {
					arrayOfHuy.push(dataCate[i]);
				}
				var oModelCate = new JSONModel();
				oModelCate.setData({
					results: arrayOfHuy
				});
				this.setModel(oModelCate, "dataCate");
			}
		},

		getDataCity: function() {
			// get data city
			var getDataCity = models.getDataCity();
			if (getDataCity) {
				var oModelCity = this.getModel("dataCity");
				oModelCity.setProperty("/results", getDataCity);
				oModelCity.setProperty("/selectedCity", getDataCity[0].id);
				oModelCity.updateBindings();
			}
			/***************************************************/
			/** Get data Distrisct **/
			var getDataDis = models.getDataDistrict();
			if (getDataDis) {
				var dataDis = [];
				for (var i = 0; i < getDataDis.length; i++) {
					dataDis.push(getDataDis[i]);
				}

				var oModelDis = new JSONModel();
				oModelDis.setData({
					results: dataDis
				});
				this.setModel(oModelDis, "dataDis");
				this.onChangeCity();
			}
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
				// var cityContext = this.getView().byId("filterCity").getSelectedItem().getKey();
				var keyCity = cityModel.getProperty("/selectedCity");
				this.getDistrictByCity(keyCity);
			}
		},

		navToSearhByFields: function() {
			this.back();
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