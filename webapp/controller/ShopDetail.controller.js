sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	'sap/ui/demo/basicTemplate/model/models',
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	var gMap, arrayView = [];
	return BaseController.extend("sap.ui.demo.basicTemplate.controller.ShopDetail", {

		formatter: formatter,

		onInit: function() {
			// this.isLogging();
			var oRouter = this.getRouter();

			oRouter.getRoute("shopDetail").attachPatternMatched(this._onRouteMatched, this);
			this.getView().byId("map").addStyleClass("myMap");
		},

		_onRouteMatched: function(oEvent) {
			this.checkLoginEachPage();
			if (!gMap) {
				var mapOptions = {
					center: new google.maps.LatLng(0, 0),
					zoom: 1,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				gMap = new google.maps.Map(this.getView().byId("map").getDomRef(), mapOptions);
			}
			var shopId = oEvent.getParameter("arguments").shopId;
			var userId = this.getGlobalModel().getProperty("/accountId");

			this.getView().byId("rating").setProperty("value", 1);
			var checkView = sessionStorage.getItem("check");
			this.check = false;
			if (!checkView) {
				sessionStorage.setItem("check", shopId);
			} else {
				sessionStorage.removeItem("check");
				arrayView = checkView.split(",");
				var hasValue = false;
				for (var i = 0; i < arrayView.length; i++) {
					if (arrayView[i] === shopId) {
						this.check = true;
						hasValue = true;
					}
				}
				if (!hasValue) {
					arrayView.push(shopId);
				}
				sessionStorage.setItem("check", arrayView);
			}
			var getData;
			if (this.check) {
				var increaseView = true;
				getData = models.getShopDetail(shopId, userId, increaseView);
			} else {
				getData = models.getShopDetail(shopId, userId);
			}
			if (getData.status === 400) {
				this.getRouter().navTo("home");
			} else {
				this.getDataShop(getData);
				this.getCateItem(getData);
			}
			this.visibleButton();
		},

		interestedShop: function() {
			var userId = localStorage.getItem("uid");
			var shopId = this.getModel("dataShopDetail").getProperty("/id");
			var checkFavorite = models.checkFavorite(shopId, userId);
			if (userId != null) {
				if (checkFavorite === "success") {
					MessageBox.success("Cảm ơn bạn đã quan tâm đến Cửa hàng!");
					this.getModel("dataShopDetail").setProperty("/check", true);
				}
			} else {
				MessageBox.information("Bạn phải đăng nhập mới sử dụng được chức năng này!");
			}
		},

		changeRating: function(oEvent) {
			var rate = oEvent.getSource().getProperty("value");
			var accountId = localStorage.getItem("uid");

			var shopId = this.getModel("dataShopDetail").getProperty("/id");
			if (accountId) {
				var rating = models.ratingShop(rate, accountId, shopId);
				if (rating.status === 400) {
					MessageBox.information("Bạn đã đánh giá cửa hàng này!");
				} else {
					MessageBox.success("Cảm ơn bạn đã đánh giá chúng tôi!");
				}
			} else {
				this.getView().byId("rating").setProperty("value", 1);
				MessageBox.information("Bạn phải đăng nhập mới sử dụng được chức năng này!");
			}
		},

		unInterestedShop: function() {
			var userId = localStorage.getItem("uid");
			var shopId = this.getModel("dataShopDetail").getProperty("/id");
			var checkUnFavorite = models.checkUnFavorite(shopId, userId);
			if (checkUnFavorite === "success") {
				this.getModel("dataShopDetail").setProperty("/check", false);
				MessageBox.success("Đã bỏ Quan tâm!");
			}
		},

		visibleButton: function() {
			var checkF = this.getModel("dataShopDetail").getProperty("/checkFavorite");

			if (checkF == true) {
				this.getModel("dataShopDetail").setProperty("/check", true);
			} else if (checkF == false) {
				this.getModel("dataShopDetail").setProperty("/check", false);
			} else {
				this.getModel("dataShopDetail").setProperty("/check", false);
			}
		},

		getDataShop: function(res) {
			var lat = res.latitude,
				lng = res.longtitude;
			var dataShopDetail = new JSONModel({
				id: res.id,
				shopName: res.shopName,
				phoneNumber: res.phoneNumber,
				fullAddress: res.fullAddress,
				facebook: res.facebook,
				viewCount: res.viewCount,
				avaUrl: res.avaUrl,
				rating: res.rating,
				lat: res.latitude,
				lng: res.longtitude,
				policy: res.policy,
				checkFavorite: res.checkFavorite
			});
			this.setModel(dataShopDetail, "dataShopDetail");

			this.setLocationShop(lat, lng);
		},

		getCateItem: function(res) {
			var cateItem = new JSONModel();
			cateItem.setData({
				results: res.categoryItems
			});
			this.setModel(cateItem, "cateItem");
		},

		setLocationShop: function(lat, lng) {
			var latLong = new google.maps.LatLng(lat, lng);
			if (!this.marker) {
				this.marker = new google.maps.Marker({
					position: latLong,
					map: gMap
				});
				this.marker.setMap(gMap);
			} else {
				this.marker.setPosition(latLong);
			}
			gMap.setZoom(15);
			gMap.setCenter(this.marker.getPosition());
		},

		navToGGMap: function() {
			var lat = this.getModel("dataShopDetail").getData().lat;
			var lng = this.getModel("dataShopDetail").getData().lng;
			if (lat && lng) {
				var url = "https://www.google.com/maps/dir//" + lat + "," + lng;
				sap.m.URLHelper.redirect(url, true);
			}
		},

		backToPrevious: function() {
			this.back();
		},

		onAfterRendering: function() {
			var mapOptions = {
				center: new google.maps.LatLng(0, 0),
				zoom: 1,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			gMap = new google.maps.Map(this.getView().byId("map").getDomRef(), mapOptions);
		}
	});
});