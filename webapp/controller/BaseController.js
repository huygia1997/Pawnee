sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/BusyDialog",
	'sap/m/Button',
	'sap/m/MessageToast',
	'sap/m/ResponsivePopover',
	'sap/ui/core/syncStyleClass',
	'sap/m/NotificationListItem',
	'sap/ui/core/CustomData',
	'sap/m/ActionSheet',
	'sap/m/library',
	'sap/m/MessageBox',
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/demo/basicTemplate/model/models"
], function(Controller, UIComponent, Device, JSONModel, BusyDialog, Button, MessageToast, ResponsivePopover, syncStyleClass,
	NotificationListItem, CustomData, ActionSheet, mobileLibrary, MessageBox, formatter, models) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.BaseController", {

		formatter: formatter,

		onInit: function() {
			// this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		openBusyDialog: function(oSetting) {
			if (!this.busyDialog) {
				this.busyDialog = new BusyDialog(oSetting);
			} else {
				this.busyDialog.setTitle(oSetting.title);
				this.busyDialog.getText(oSetting.text);
				this.busyDialog.setShowCancelButton(oSetting.showCancelButton);
			}
			this.busyDialog.open();
		},
		closeBusyDialog: function() {
			if (this.busyDialog) {
				this.busyDialog.close();
			}
		},
		/**
		 * Convenience method for getting the control of view by Id.
		 * @public
		 * @param {string} sId id of the control
		 * @returns {sap.m.control} the control
		 */
		getId: function() {
			return this.getView().getId();
		},
		byId: function(sId) {
			return this.getView().byId(sId);
		},
		getSId: function(id) {
			return this.getView().getId() + "--" + id;
		},
		/**
		 * Convenience method for getting the control of view by Id.
		 * @public
		 * @param {string} sId id of the control
		 * @returns {sap.m.control} the control
		 */
		toast: function(sMessage) {
			return MessageToast.show(sMessage);
		},

		back: function() {
			window.history.back();
		},

		getDevice: function() {
			return Device;
		},
		dialogClose: function(oSource) {
			oSource.close();
		},
		/**
		 * Convenience method for accessing the router in each controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			// if (sName === null || sName === "") {
			// 	return this.getOwnerComponent().getModel("i18n");
			// }
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		createModel: function(sName) {
			var model = new JSONModel();
			this.getView().setModel(model, sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		onDialogClose: function(e) {
			e.getSource().getParent().close();
		},
		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resource model of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		/**
		 * Convenience method to get the global model containing the global state of the app.
		 * @returns {object} the global Propery model
		 */
		getGlobalModel: function() {
			return this.getOwnerComponent().getModel("globalProperties");
		},
		/**
		 * Convenience method to get the global model containing the global state of the app.
		 * @returns {object} the global Propery model
		 */
		getFilterParmeter: function() {
			return this.getOwnerComponent().getModel("globalFilterParam");
		},
		/**
		 * Convenience method to get the global model containing the global state of the app.
		 * @returns {object} the global Propery model
		 */
		getCartModel: function() {
			return this.getOwnerComponent().getModel("CartProperties");
		},
		/**
		 * Convenience method
		 * @returns {object} the application controller
		 */
		getApplication: function() {
			return this.getGlobalModel().getProperty("/application");
		},

		validateEmailGlobal: function(email) {
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			if (!mailregex.test(email)) {
				return false;
			}
			return true;
		},

		/**
		 * Convenience method checking login token
		 * @returns {object} the application controller
		 */

		checkLogin: function(oEvent) {
			//Set Busy before check login
			this._LoginDialog.getModel("loginResult").setProperty("/isLogging", true);

			var that = this;
			var loginModel = this._LoginDialog.getModel("loginResult");
			var username = this.getView().byId("txtEmail").getValue();
			var passwordValue = this.getView().byId("txtPassword").getValue();
			var user = loginModel.getProperty("/username");
			var checkEmail = this.validateEmailGlobal(user);
			var password = loginModel.getProperty("/password");
			if (username === "" || passwordValue === "") {
				this.getView().byId("userName").setValueState(sap.ui.core.ValueState.Error);
				this.getView().byId("passwordUser").setValueState(sap.ui.core.ValueState.Error);
			} else if (!checkEmail) {
				MessageBox.error("Email không đúng định dạng!");
			} else {
				var check = models.checkLogin(user, password);
				if (check.status === 404) {
					MessageBox.error("Email hoặc Mật khẩu không đúng!");
					loginModel.setProperty("/isLogging", false);
				} else if (check.id) {
					var logonresult = true;
					//process after login
					if (logonresult) {
						//post-process
						that.getGlobalModel().setProperty("/accountId", check.id);
						that.getGlobalModel().setProperty("/username", check.username);
						that.getGlobalModel().setProperty("/role", check.role);
						that.getGlobalModel().setProperty("/password", check.password);

						localStorage.setItem("uid", check.id);
						localStorage.setItem("email", check.username);

						that._LoginDialog.close();
						setInterval(that.fetchNoti(check.id), 500000);
						this.getRouter().navTo("home");
					} else {
						//if login = false 
						that._LoginDialog.getModel("loginResult").setProperty("/failed", true);
						MessageBox.error("Đăng nhập không thành công!");
					}
					loginModel.setProperty("failed", !logonresult);
					//Off-Busy after proceed
					//	loginModel.setProperty("/isLogging", false);
				} else {
					MessageBox.error("Email hoặc Mật khẩu không đúng!");
				}
			}

			loginModel.setProperty("/isLogging", false);
			return password !== "" && user !== "";
		},

		fetchNoti: function(uid) {
			var getNoti = models.getNotifications(uid);
			var count = 0;
			if (getNoti) {
				var notiPawner = [];
				for (var i = 0; i < getNoti.length; i++) {
					if (getNoti[i].type === 1 || getNoti[i].type === 2) {
						notiPawner.push(getNoti[i]);
						count++;
					}
				}
				var oModelNoti = this.getModel("noti");
				oModelNoti.setData({
					results: notiPawner
				});
				if (getNoti.length == 0) {
					oModelNoti.setProperty("/count", "");
				} else {
					oModelNoti.setProperty("/count", count);
				}
				oModelNoti.updateBindings(true);
			}
		},

		onPressNotiDetail: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("noti");
			if (bindingContext) {
				var type = bindingContext.getProperty("type");
				if (type === 1) {
					var transId = bindingContext.getProperty("objectId");
					var notificationId = bindingContext.getProperty("id");
					if (!this._detailNotification) {
						this._detailNotification = sap.ui.xmlfragment(this.getId(), "sap.ui.demo.basicTemplate.fragment.NotificationDetail",
							this);
					}
					var notiDetail = models.getNotificationDetail(transId, notificationId);
					if (notiDetail) {
						var oModelNotiDetail = new JSONModel();
						var transaction = notiDetail.transaction;
						oModelNotiDetail.setData(transaction);
						this.setModel(oModelNotiDetail, "oModelNotiDetail");

						var oModelNotiHistory = new JSONModel();
						var history = notiDetail.transactionHistories;
						oModelNotiHistory.setData(history);
						this.setModel(oModelNotiHistory, "oModelNotiHistory");
					}
					//Set models which is belonged to View to Fragment
					this.getView().addDependent(this._detailNotification);

					this._detailNotification.open();
				} else if (type === 2) {
					var itemId = bindingContext.getProperty("objectId");
					var userId = localStorage.getItem("uid");
					var getItemDetail = models.getItemDetail(itemId, userId);
					if (getItemDetail.status === 400) {
						MessageBox.information("Sản phẩm không còn tồn tại trong hệ thống!");
					} else {
						this.getRouter().navTo("itemDetail", {
							itemId: itemId
						});
					}
				}

			}
		},

		backToHome: function() {
			this.getRouter().navTo("home");
		},

		/*************************************************************************************************/
		openDialogLogin: function() {
			if (!this._LoginDialog) {
				this._LoginDialog = sap.ui.xmlfragment(this.getId(), "sap.ui.demo.basicTemplate.fragment.Login",
					this);
				var loginDialogModel = new JSONModel({
					username: "",
					password: "",
					failed: false,
					isLogging: false
				});
				this._LoginDialog.setModel(loginDialogModel, "loginResult");
				//Set models which is belonged to View to Fragment
				this.getView().addDependent(this._LoginDialog);
			}
			this._LoginDialog.open();
		},

		openDialogRegister: function() {
			if (!this._RegisterDialog) {
				this._RegisterDialog = sap.ui.xmlfragment(this.getId(), "sap.ui.demo.basicTemplate.fragment.Register",
					this);
				var registerDialogModel = new JSONModel({
					email: "",
					password: "",
					success: false,
					failed: false
				});
				this._RegisterDialog.setModel(registerDialogModel, "registerResult");
				//Set models which is belonged to View to Fragment
				this.getView().addDependent(this._RegisterDialog);
			}
			this._RegisterDialog.open();
		},

		validateEmail: function() {
			var email = this.getView().byId("emailRegister").getValue();

			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			if (!mailregex.test(email)) {
				this.getView().byId("emailRegister").setValueState(sap.ui.core.ValueState.Error);
			}
		},

		/**
		 * Event handler for the continue button
		 */
		checkInputRegister: function() {
			// collect input controls
			var email = this.getView().byId("emailRegister").getValue();
			var check = this.validateEmailGlobal(email);
			var password = this.getView().byId("passwordRegister").getValue();
			var rePassword = this.getView().byId("rePasswordRegister").getValue();
			if (email === "" || password === "") {
				MessageBox.error("Không được để trống");
			} else if (!check) {
				MessageBox.error("Email không đúng định dạng!");
			} else if (password !== rePassword) {
				MessageBox.error("Mật khẩu không trùng khớp");
			} else {
				var checkData = models.checkRegister(email, password);
				if (checkData.status === 406) {
					MessageBox.error("Email đã được sử dụng!");
				} else if (checkData.status === 200) {
					MessageBox.success("Đăng kí thành công! Mở email để kích hoạt tài khoản!");
				} else if (checkData.status === 400) {
					MessageBox.success("Email đã được sử dụng hoặc không đúng định dạng!");
				} else {
					MessageBox.error("Đăng kí thất bại!");
				}
			}
		},

		onDialogRegisterClose: function(e) {
			this.byId("emailRegister").setProperty("value", "");
			this.byId("passwordRegister").setProperty("value", "");
			e.getSource().getParent().close();
		},

		dialogAfterclose: function() {
			if (this._oDialog) {
				this._oDialog.destroy(); //destroy only the content inside the Dialog
			}
		},

		/**
		 * Event handler for the notification button
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onNotificationPress: function(oEvent) {
			var oModelNoti = this.getModel("noti");
			var notiList = this.byId("notiList");
			// this.bindNotiModel();
			notiList.openBy(oEvent.getSource());
			// close message popover
			// var oMessagePopover = this.byId("errorMessagePopover");
			// if (oMessagePopover && oMessagePopover.isOpen()) {
			// 	oMessagePopover.close();
			// }

			// var placement = oEvent.getSource();
			// var alertPo = this.byId("poAlert");
			// alertPo.openBy(placement);
			oModelNoti.setProperty("/count", "");
			oModelNoti.updateBindings();
		},

		onUserNamePress: function(oEvent) {
			if (!this.oActionSheet) {
				this.oActionSheet = this.byId("userMessageActionSheet");
			}
			this.oActionSheet.openBy(oEvent.getSource());
			this.oActionSheet.setVisible(true);
		},

		logout: function() {
			localStorage.removeItem("uid");
			localStorage.removeItem("email");

			this.getGlobalModel().setProperty("/accountId", "");
			this.getGlobalModel().setProperty("/username", "");
			this.getGlobalModel().setProperty("/role", "");
			this.getGlobalModel().setProperty("/password", "");

			this.getRouter().navTo("home");
			MessageBox.success("Đăng xuất thành công!");
		},

		filterTable: function(aCurrentFilterValues) {
			this.getTableItems().filter(this.getFilters(aCurrentFilterValues));
			this.updateFilterCriterias(this.getFilterCriteria(aCurrentFilterValues));
		},

		onSearch: function(oEvent) {
			var value = oEvent.getParameter("query");
			this.getRouter().navTo("searchShop", {
				query: value
			});
			var getValue = this.byId("searchField");
			// console.log(getValue);
			getValue.setProperty("value", "");
		},

		userDetail: function() {
			this.getRouter().navTo("userDetail");
		},

		isLogging: function() {
			var uid = localStorage.getItem("uid");
			var email = localStorage.getItem("email");
			if (!uid) {
				this.getRouter().navTo("home");
				this.getGlobalModel().setProperty("/isLogging", 1);
				// MessageBox.error("Xin lỗi! Bạn cần đăng nhập để tiếp tục");
			} else {
				this.getGlobalModel().setProperty("/accountId", uid);
				this.getGlobalModel().setProperty("/username", email);
			}
		},

		checkLoginEachPage: function() {
			var uid = localStorage.getItem("uid");
			var email = localStorage.getItem("email");
			if (uid) {
				this.getGlobalModel().setProperty("/accountId", uid);
				this.getGlobalModel().setProperty("/username", email);
			}
		},

		navToMapPage: function() {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					var lat = position.coords.latitude,
						lng = position.coords.longitude;
					that.getRouter().navTo("nearByLocation", {
						lat: lat,
						lng: lng
					}, false);
				}, function() {
					MessageBox.error("Bạn từ chối chia sẻ vị trí. Hãy bật nó lên để sử dụng chức năng này hoặc sử dụng các công cụ tìm kiếm khác.");
				});
			} else {
				// Browser doesn't support Geolocation
				MessageBox.error("Trình duyệt của bạn không hỗ trợ Geolocation");
			}
		},

		onForgetPasswordPress: function() {
			this.getRouter().navTo("forgetPassword");
		}
	});

});