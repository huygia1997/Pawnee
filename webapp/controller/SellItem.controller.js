sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models",
	"sap/ui/model/json/JSONModel"
], function(BaseController, formatter, models, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.SellItem", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();
			var oRouter = this.getRouter();
			this.keySort = false;
			oRouter.getRoute("sellItem").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
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
			}
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
			this.keySort = true;
			var cateId = this.idCate;
			this.getAllItem(keySort, 0, cateId);
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
		}
	});
});