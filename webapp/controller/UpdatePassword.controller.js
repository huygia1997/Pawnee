sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/basicTemplate/model/models",
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.UpdatePassword", {

		formatter: formatter,

		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("updatePassword").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.token = oEvent.getParameter("arguments").token;
		},

		onUpdatePassword: function() {
			var password = this.getView().byId("input_password").getValue();
			var repassword = this.getView().byId("input_repassword").getValue();
			if (password !== repassword) {
				MessageBox.error("Mật khẩu không khớp!");
			} else {
				var updatePassword = models.updatePassword(this.token, password);
				if(updatePassword.status === 200) {
					MessageBox.success("Cập nhật thành công!");
				} else {
					MessageBox.error("Cập nhật thất bại!");
				}
			}
		},

		backToHome: function() {
			this.getRouter().navTo("home");
		}
	});
});