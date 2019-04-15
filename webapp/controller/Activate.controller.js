sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/basicTemplate/model/models"
], function(BaseController, formatter, JSONModel, models) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Activate", {

		formatter: formatter,

		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("activate").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var token = oEvent.getParameter("arguments").token;
			var activateModel = new JSONModel({
				text: "",
				isActivate: false
			});
			this.setModel(activateModel, "activateModel");
			var getModel = this.getModel("activateModel");
			var data = models.checkActivate(token);
			if (data.status === 200) {
				getModel.setProperty("/text", "Tạo tài khoản thành công!");
			} else {
				getModel.setProperty("/text", "Tạo tài khoản thất bại!");
			}
		},
		
		backToHome: function() {
			this.getRouter().navTo("home");
		}
	});
});