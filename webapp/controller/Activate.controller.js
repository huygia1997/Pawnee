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
			var activateModel = new JSONModel({
				text: "",
				isActivate: false
			});
			this.setModel(activateModel, "activateModel");

			oRouter.getRoute("activate").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			var token = oEvent.getParameter("arguments").token;
			var data = models.checkActivate(token);
			var getModel = this.getModel("activateModel");
			if (data.status === 200) {
				this.getView().byId("text_activate").addStyleClass("un_activate");
				getModel.setProperty("/isActivate", true);
				getModel.setProperty("/text", "Đăng kí tài khoản thành công!");
			} else {
				this.getView().byId("text_activate").addStyleClass("activate");
				getModel.setProperty("/isActivate", false);
				getModel.setProperty("/text", "Đăng kí tài khoản thất bại!");
			}
		},
		
		backToHome: function() {
			this.getRouter().navTo("home");
		}
	});
});