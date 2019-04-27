sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/m/MessageBox'
], function(BaseController, formatter, models, JSONModel, Filter, FilterOperator, MessageBox) {
	"use strict";

	var arrayItem = [];
	return BaseController.extend("sap.ui.demo.basicTemplate.controller.SaleItem", {

		formatter: formatter,

		onInit: function() {
			// this.isLogging();
			var oRouter = this.getRouter();

			oRouter.getRoute("saleItem").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			// check login
			this.checkLoginEachPage();
			//create model item
			var oModelItem = new JSONModel();
			this.setModel(oModelItem, "bestItem");

			this.paging = 0;
			this.isScrollToLoad = false;
			this.getView().byId("filterSort").setProperty("selectedKey", 6);
			this.getView().byId("searchItem").setProperty("value", "");
			this.keySort = false;

			// get category and item
			this.getAllCate();
			this.getBestItem();

			this.idCate = "";
			this.isGetBestItem = true;
		},

		getBestItem: function() {
			var lat = this.getGlobalModel().getProperty("/lat");
			var lng = this.getGlobalModel().getProperty("/lng");
			var getItem = models.getBestSaleItem(lat, lng);
			var oModelItem = this.getModel("bestItem");
			if (getItem.length) {
				oModelItem.setData({
					results: getItem
				});
			}
			//set sort cate default
			this.idCate = "";
			this.isGetBestItem = true;
		},

		getAllItem: function(keySort, page, idCate) {
			this.isGetBestItem = false;
			var isScrollToLoad = this.isScrollToLoad;
			if (!isScrollToLoad) {
				arrayItem = [];
			}
			var oModelItem = this.getModel("bestItem");
			var getItem = models.getItemBySort(keySort, page, idCate);
			if (getItem.length) {
				if (!arrayItem.length) {
					arrayItem.push(getItem);
				} else {
					for (var i = 0; i < getItem.length; i++) {
						arrayItem[0].push(getItem[i]);
					}
				}
				oModelItem.setData({
					results: arrayItem[0]
				});
			}
		},

		getAllCate: function() {
			var oModelCate = new JSONModel();
			var getList = models.getAllCategory();
			if (getList) {
				oModelCate.setData({
					results: getList
				});
				this.setModel(oModelCate, "listCate");
			}
		},

		onChangeSort: function() {
			this.paging = 0;
			var keySort = this.getView().byId("filterSort").getSelectedItem().getKey();
			this.keySort = true;
			if (keySort != 6) {
				var cateId = this.idCate;
				this.isScrollToLoad = false;
				this.getAllItem(keySort, 0, cateId);
			} else {
				this.getBestItem();
			}
		},

		selectOptionCate: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("listCate");
			if (bindingContext) {
				var cateId = bindingContext.getProperty("id");
				this.idCate = cateId;
				this.paging = 0;
				this.keySort = true;
				this.isScrollToLoad = false;
				this.getAllItem(6, 0, cateId);

				this.getView().byId("filterSort").setProperty("selectedKey", 1);
			}
		},

		selectItem: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("bestItem");
			if (bindingContext) {
				var itemId = bindingContext.getProperty("id");
				this.getRouter().navTo("itemDetail", {
					itemId: itemId
				}, false);
			}
		},

		onSearchItem: function(oEvent) {
			// var getModel = this.getModel("bestItem");
			// var value = oEvent.getParameter("query");
			// if (value) {
			// 	var getItem = models.searchItemByKeyword(value);
			// 	if (getItem) {
			// 		getModel.setData({
			// 			results: getItem
			// 		});
			// 		getModel.updateBindings(true);
			// 	}
			// }
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("itemName", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("ShortProductList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		onAfterRendering: function() {
			var that = this;
			var oPage = this.getView().byId("SaleItem");
			$("#" + oPage.sId + " section").scroll(function(oEvent) {
				var scrollHeight = oEvent.target.scrollTop;
				var windownHeight = oEvent.target.scrollHeight - oEvent.target.offsetHeight;
				if (scrollHeight === windownHeight) {
					if (!that.isGetBestItem) {
						var keySort;
						if (that.keySort) {
							keySort = that.getView().byId("filterSort").getSelectedItem().getKey();
						} else {
							keySort = "";
						}
						var paging = ++that.paging;
						var cate = that.idCate;
						that.isScrollToLoad = true;
						that.getAllItem(keySort, paging, cate);
					}
				}
			});
		}
	});
});