sap.ui.define([
	'sap/ui/demo/basicTemplate/controller/BaseController',
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/m/Dialog",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	"sap/ui/demo/basicTemplate/model/models"
], function(BaseController, formatter, Dialog, JSONModel, MessageToast, MessageBox, models) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Home", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();

			var oRouter = this.getRouter();
			oRouter.getRoute("home").attachPatternMatched(this._onRouteMatched, this);

			if (!this._Dialog) {
				this._Dialog = sap.ui.xmlfragment(this.getId(), "sap.ui.demo.basicTemplate.fragment.ListFieldSelect",
					this);
			}
			var oModel = new JSONModel();
			this.setModel(oModel, "dataCity");

		},

		_onRouteMatched: function(oEvent) {

			// var isLoggin = this.getGlobalModel().getProperty("/isLogging");
			// if (isLoggin == 1) {
			// 	MessageBox.error("Xin lỗi! Bạn cần đăng nhập để tiếp tục");
			// 	this.getGlobalModel().setProperty("/isLogging", "");
			// }
			/***************************************************/
			/** Get data **/

			this.getDataCity();
			this.getDataCategory();
			/***************************************************/
			this.getMyLocation();
			var lat = this.getGlobalModel().getProperty("/lat");
			var lng = this.getGlobalModel().getProperty("/lng");

			this.getBestSale(lat, lng);
			var uid = localStorage.getItem("uid");
			setInterval(this.fetchNoti(uid), 10000);
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

		searchPlaceByForm: function() {
			var keyDistrics = this.getView().byId("filterDistrict").getSelectedItem().getKey();
			var keyItem = this.getView().byId("filterItem").getSelectedItem().getKey();

			if (keyDistrics === "" && keyItem) {
				this.getRouter().navTo("findShop", {
					dis: "null",
					cate: keyItem
				}, false);
			} else if (keyItem === "" && keyDistrics) {
				this.getRouter().navTo("findShop", {
					dis: keyDistrics,
					cate: "null"
				}, false);
			} else if (keyDistrics === "" && keyItem === "") {
				this.getRouter().navTo("findShop", {
					dis: "null",
					cate: "null"
				}, false);
			} else {
				this.getRouter().navTo("findShop", {
					dis: keyDistrics,
					cate: keyItem
				}, false);
			}
		},

		selectShop: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("listShop");
			if (bindingContext) {
				var shopId = bindingContext.getProperty("CategoryID");
				this.getRouter().navTo("shopDetail", {
					shopId: shopId
				}, false);
			}
		},

		onShowValueHelp: function() {
			this._Dialog.open();
		},

		navToRegisterShop: function() {
			var getUserId = this.getGlobalModel().getProperty("/accountId");
			if (getUserId == "") {
				MessageBox.information("Bạn cần đăng nhập để tiếp tục Đăng kí trở thành chủ Shop trong hệ thống!");
			} else {
				this.getRouter().navTo("registerShop");
			}
		},

		navigateActivite: function() {
			this.getRouter().navTo("activate");
		},

		getMyLocation: function() {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var lat = position.coords.latitude,
						lng = position.coords.longitude;
					that.getGlobalModel().setProperty("/lat", lat);
					that.getGlobalModel().setProperty("/lng", lng);
				}, function() {
					MessageBox.error("Bạn từ chối chia sẻ vị trí. Hãy bật nó lên để sử dụng chức năng này hoặc sử dụng các công cụ tìm kiếm khác.");
				});
			} else {
				// Browser doesn't support Geolocation
				MessageBox.error("Trình duyệt của bạn không hỗ trợ Geolocation");
			}
		},

		getBestSale: function(lat, lng) {
			var oModelItem = new JSONModel();
			var getItem = models.getBestSaleItem(lat, lng);
			if (getItem) {
				oModelItem.setData({
					results: getItem
				});
			}
			this.setModel(oModelItem, "oModelItem");
		},

		selectItem: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("oModelItem");
			if (bindingContext) {
				var itemId = bindingContext.getProperty("id");
				this.getRouter().navTo("itemDetail", {
					itemId: itemId
				}, false);
			}
		},

		onSaleItemPress: function() {
			this.getRouter().navTo("saleItem");
		}
	});
});