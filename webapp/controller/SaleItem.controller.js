sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, formatter, models, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.SaleItem", {

		formatter: formatter,

		onInit: function() {
			// this.isLogging();
			var oRouter = this.getRouter();
			this.keySort = false;
			oRouter.getRoute("saleItem").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.getView().byId("searchItem").setProperty("value", "");
			this.getAllCate();
			this.getAllItem();
		},

		getAllItem: function(keySort, page, idCate) {
			var lat = this.getGlobalModel().getProperty("/lat");
			var lng = this.getGlobalModel().getProperty("/lng");
			var oModelItem = new JSONModel();
			var check = this.keySort;
			var getItem;
			if (!check) {
				getItem = models.getBestSaleItem(lat, lng);
				// getItem = models.getBestSaleItem();
			} else {
				getItem = models.getItemBySort(keySort, page, idCate);
				this.keySort = false;
			}
			this.getView().byId("filterSort").setProperty("selectedKey", 1);
			if (getItem) {
				oModelItem.setData({
					results: getItem
				});
			}
			this.setModel(oModelItem, "bestItem");
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
			var keySort = this.getView().byId("filterSort").getSelectedItem().getKey();
			if (keySort != 6) {
				this.keySort = true;
				var cateId = this.idCate;
				this.getAllItem(keySort, 0, cateId);
			} else {
				this.getAllItem();
			}
		},

		selectOptionCate: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("listCate");
			if (bindingContext) {
				var cateId = bindingContext.getProperty("id");
				this.idCate = cateId;
				this.keySort = true;
				this.getAllItem(6, 0, cateId);
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
		}
	});
});