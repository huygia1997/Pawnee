sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/basicTemplate/model/models",
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.ForgetPassword", {

		formatter: formatter,

		onInit: function() {
			var oRouter = this.getRouter();
			oRouter.getRoute("forgetPassword").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			
		},
		
		onSendRequest: function() {
			var email = this.getView().byId("input_email").getValue();
			var validateEmail = this.validateEmailGlobal(email);
			if(!validateEmail) {
				MessageBox.error("Email không đúng định dạng!");
			} else {
				var getRequest = models.sendRequestForgetPassword(email);
				if(getRequest.status === 200) {
					MessageBox.success("Hệ thống đã gửi Email xác nhận tài khoản!");
				} else {
					MessageBox.error("Email không tồn tại trong hệ thống!");
				}
			}
		},
		
		backToHome: function() {
			this.getRouter().navTo("home");
		}
	});
});