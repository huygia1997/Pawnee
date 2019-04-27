sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox'
], function(BaseController, formatter, models, JSONModel, MessageBox) {
	"use strict";

	var arrayShop = [];
	return BaseController.extend("sap.ui.demo.basicTemplate.controller.FindShop", {

		formatter: formatter,

		onInit: function() {
			var oRouter = this.getRouter();
			var oModel = new JSONModel();
			this.setModel(oModel, "dataCity");

			var oModelShop = new JSONModel();
			this.setModel(oModelShop, "dataSearchShop");

			var keyOfFilter = new JSONModel();
			this.setModel(keyOfFilter, "keyOfFilter");

			oRouter.getRoute("findShop").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.getView().byId("filterSort").setProperty("selectedKey", 4);
			this.checkGetBestShop = true;
			this.checkLoginEachPage();
			/** Get data **/
			this.getDataCity();
			this.getDataCategory();
			var idDis = oEvent.getParameter("arguments").dis;
			var idCate = oEvent.getParameter("arguments").cate;
			this.getModel("keyOfFilter").setProperty("/keyDis", idDis);
			this.getModel("keyOfFilter").setProperty("/keyCate", idCate);
			this.getBestShop();
			this.paging = 0;
			this.isScrollToLoad = false;
			arrayShop = [];
		},

		onChangeSort: function() {
			this.paging = 0;
			arrayShop = [];
			var keySort = this.getView().byId("filterSort").getSelectedItem().getKey();
			this.getModel("keyOfFilter").setProperty("/keySort", keySort);
			if (keySort === "4") {
				this.getBestShop();
			} else {
				this.getAllShopByFilter(this.paging, keySort);
			}
		},

		getBestShop: function() {
			this.checkGetBestShop = true;
			var lat = this.getGlobalModel().getProperty("/lat");
			var lng = this.getGlobalModel().getProperty("/lng");
			var getData = models.getBestShop(lat, lng);
			if (getData) {
				var oModelShop = this.getModel("dataSearchShop");
				oModelShop.setData({
					results: getData
				});
			}
		},

		getAllShopByFilter: function(page, sort) {
			// set array []
			var isScrollToLoad = this.isScrollToLoad;
			if (!isScrollToLoad) {
				arrayShop = [];
			}
			this.checkGetBestShop = false;
			var idDis = this.getModel("keyOfFilter").getProperty("/keyDis");
			var idCate = this.getModel("keyOfFilter").getProperty("/keyCate");
			var getData;
			var oModelShop = this.getModel("dataSearchShop");
			if (idCate !== "null" && idDis !== "null") {
				getData = models.getShopByFilter(page, sort, idCate, idDis);
			} else if (idDis === "null" && idCate !== "null") {
				getData = models.getShopByFilter(page, sort, idCate, 0);
			} else if (idCate === "null" && idDis !== "null") {
				getData = models.getShopByFilter(page, sort, 0, idDis);
			} else {
				getData = models.getShopByFilter(page, sort, 0, 0);
			}
			if (getData.length) {
				if (!arrayShop.length || page === 0) {
					arrayShop = [];
					arrayShop.push(getData);
				} else {
					for (var i = 0; i < getData.length; i++) {
						arrayShop[0].push(getData[i]);
					}
				}
				oModelShop.setData({
					results: arrayShop[0]
				});
			} else if (!getData.length && !this.isScrollToLoad) {
				MessageBox.information("Không có Cửa hàng trong khu vực bạn chọn!");
			}
		},

		selectShop: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("dataSearchShop");
			if (bindingContext) {
				var shopId = bindingContext.getProperty("id");
				this.getRouter().navTo("shopDetail", {
					shopId: shopId
				}, false);
			}
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
				var keyCity = cityModel.getProperty("/selectedCity");
				this.getDistrictByCity(keyCity);
			}
		},

		searchPlaceByForm: function() {
			var keyDistrics = this.getView().byId("filterDistrict").getSelectedItem().getKey();
			var keyItem = this.getView().byId("filterItem").getSelectedItem().getKey();
			var oModelKey = this.getModel("keyOfFilter");
			// console.log(keyDistrics, keyItem);
			if (keyDistrics === "") {
				oModelKey.setProperty("/keyDis", "null");
			} else {
				oModelKey.setProperty("/keyDis", keyDistrics);
			}
			if (keyItem === "") {
				oModelKey.setProperty("/keyCate", "null");
			} else {
				oModelKey.setProperty("/keyCate", keyItem);
			}
			this.searchShopbyForm = true;
			this.getAllShopByFilter(0, 3);
			this.paging = 0;
		},

		navToMap: function() {
			var keyDistrics = this.getView().byId("filterDistrict").getSelectedItem().getKey();
			var keyItem = this.getView().byId("filterItem").getSelectedItem().getKey();

			if (keyDistrics === "" && keyItem) {
				this.getRouter().navTo("findShopByMap", {
					dis: "null",
					cate: keyItem
				}, false);
			} else if (keyItem === "" && keyDistrics) {
				this.getRouter().navTo("findShopByMap", {
					dis: keyDistrics,
					cate: "null"
				}, false);
			} else if (keyDistrics === "" && keyItem === "") {
				this.getRouter().navTo("findShopByMap", {
					dis: "null",
					cate: "null"
				}, false);
			} else {
				this.getRouter().navTo("findShopByMap", {
					dis: keyDistrics,
					cate: keyItem
				}, false);
			}
		},

		onAfterRendering: function() {
			var that = this;
			var oPage = this.getView().byId("FindShopPage");
			$("#" + oPage.sId + " section").scroll(function(oEvent) {
				var checking = that.checkGetBestShop;
				var scrollHeight = oEvent.target.scrollTop;
				var windownHeight = oEvent.target.scrollHeight - oEvent.target.offsetHeight;
				if (scrollHeight === windownHeight) {
					if (!checking) {
						var keySort = that.getModel("keyOfFilter").getProperty("/keySort");
						if (keySort !== "4") {
							var paging = ++that.paging;
							that.isScrollToLoad = true;
							that.getAllShopByFilter(paging, keySort);
						}
					}
				}
			});
		}
	});
});