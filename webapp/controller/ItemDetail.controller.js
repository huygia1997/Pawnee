sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	'sap/ui/demo/basicTemplate/model/models',
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.ItemDetail", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();
			var oRouter = this.getRouter();

			oRouter.getRoute("itemDetail").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var itemId = oEvent.getParameter("arguments").itemId;
			var userId = this.getGlobalModel().getProperty("/accountId");

			var oModelItem = new JSONModel();
			var oModelImages = new JSONModel();
			var oModelShop = new JSONModel();

			var getItemDetail = models.getItemDetail(itemId, userId);
			if (getItemDetail) {
				oModelItem.setData(getItemDetail);
				oModelImages.setData({
					results: getItemDetail.pictureURL
				});
				oModelShop.setData({
					results: getItemDetail.shop
				});
			}
			this.setModel(oModelItem, "oModelItem");
			this.setModel(oModelImages, "oModelImages");
			this.visibleButton();
		},
		
		shopContact: function() {
			var userId = this.getGlobalModel().getProperty("/accountId");
			if(userId) {
				var item = this.getModel("oModelItem").getProperty("/shop");
				var shopId = item.id;
				this.getRouter().navTo("shopDetail", {
					shopId: shopId
				});
			} else {
				MessageBox.information("Bạn phải đăng nhập mới sử dụng chức năng này!");
			}
		},

		interestedItem: function() {
			var itemId = this.getModel("oModelItem").getProperty("/id");
			var userId = localStorage.getItem("uid");
			if (userId) {
				var checkFavorite = models.checkFavoriteItem(itemId, userId);
				if (checkFavorite === "success") {
					MessageBox.success("Cảm ơn bạn đã quan tâm đến Món hàng!");
					this.getModel("oModelItem").setProperty("/check", true);
				}
			} else {
				MessageBox.information("Bạn phải đăng nhập mới sử dụng chức năng này!");
			}

		},

		unInterestedItem: function() {
			var itemId = this.getModel("oModelItem").getProperty("/id");
			var userId = localStorage.getItem("uid");
			var checkUnFavorite = models.checkUnFavoriteItem(itemId, userId);
			if (checkUnFavorite === "success") {
				MessageBox.success("Đã bỏ Quan tâm Món hàng!");
				this.getModel("oModelItem").setProperty("/check", false);
			}
		},

		visibleButton: function() {
			var checkF = this.getModel("oModelItem").getProperty("/checkFavorite");
			var userId = this.getGlobalModel().getProperty("/accountId");
			if (userId) {
				if (checkF == true) {
					this.getModel("oModelItem").setProperty("/check", true);
				} else if (checkF == false) {
					this.getModel("oModelItem").setProperty("/check", false);
				}
			} else {
				this.getModel("oModelItem").setProperty("/check", false);
			}
		},

		onAfterRendering: function() {}
	});
});