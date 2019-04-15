sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/basicTemplate/model/models",
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.SearchShop", {

		formatter: formatter,

		onInit: function() {
			// this.isLogging();
			var oRouter = this.getRouter();

			oRouter.getRoute("searchShop").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var that = this;
			var query = oEvent.getParameter("arguments").query;
			// console.log(query);
			var getData = models.searchShopByKeyword(query);
			if(getData) {
				var oModel = new JSONModel();
				oModel.setData({
					results: getData
				});
				that.setModel(oModel, "dataShop");
			} else {
				MessageBox.error("Không có dữ liệu!");
			}
		},

		selectShop: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("dataShop");
			if (bindingContext) {
				var shopId = bindingContext.getProperty("id");
				this.getRouter().navTo("shopDetail", {
					shopId: shopId
				}, false);
			}
		}
	});
});