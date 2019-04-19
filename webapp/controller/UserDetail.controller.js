sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/BaseController",
	"sap/ui/demo/basicTemplate/model/formatter",
	"sap/ui/model/json/JSONModel",
	'sap/ui/demo/basicTemplate/model/models',
	'sap/m/MessageBox'
], function(BaseController, formatter, JSONModel, models, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.UserDetail", {

		formatter: formatter,

		onInit: function() {
			this.isLogging();
			var oRouter = this.getRouter();

			oRouter.getRoute("userDetail").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function(oEvent) {
			this.isLogging();
			var id = this.getGlobalModel().getProperty("/accountId");
			var getData = models.getUserDetail(id);
			if (getData) {
				var dataUser = new JSONModel({
					name: getData.name,
					email: getData.email,
					phone: getData.phoneNumber,
					address: getData.address,
					avatar: getData.avaURL
				});
				this.setModel(dataUser, "dataUser");

				// get data notification
				var listNotification = getData.listNotification;
				var dataNotify = new JSONModel();
				dataNotify.setData({
					results: listNotification
				});
				this.setModel(dataNotify, "dataNotify");

				// get data transaction
				var listTrans = getData.listTransaction;
				var dataTrans = new JSONModel();
				dataTrans.setData({
					results: listTrans
				});
				this.setModel(dataTrans, "dataTrans");

				// get data item
				var listItem = getData.listFavoriteItem;
				var oModelItem = new JSONModel();
				oModelItem.setData({
					results: listItem
				});
				this.setModel(oModelItem, "oModelItem");

				//get data shop
				var listShop = getData.listFavoriteShop;
				var oModelShop = new JSONModel();
				oModelShop.setData({
					results: listShop
				});
				this.setModel(oModelShop, "oModelShop");
			}
		},

		updateUserInfo: function() {
			var uid = localStorage.getItem("uid");
			var getImg = this.getView().byId("img_user").getSrc();
			var getValueName = this.getView().byId("nameInput").getValue();
			var getValuePhone = this.getView().byId("phoneInput").getValue();
			var getValueAddress = this.getView().byId("addressInput").getValue();

			this.getModel("dataUser").setProperty("/name", getValueName);
			this.getModel("dataUser").setProperty("/phone", getValuePhone);
			this.getModel("dataUser").setProperty("/address", getValueAddress);
			var data = {
				userName: getValueName,
				phone: getValuePhone,
				acountId: uid,
				avaUrl: getImg,
				address: getValueAddress
			};

			var update = models.updateUserInfo(data);
			if (update === "success") {
				MessageBox.success("Cập nhật thành công!");
				var modelUserInfo = this.getModel("dataUser");
				modelUserInfo.setProperty("/name", getValueName);
				modelUserInfo.setProperty("/phone", getValuePhone);
				modelUserInfo.setProperty("/address", getValueAddress);
				modelUserInfo.updateBindings(true);
			} else if (update.status === 405) {
				MessageBox.error("Cập nhật thất bại");
			}
		},

		onUploadPress: function(oEvt) {
			var that = this;
			var oFileUploader = oEvt.getSource();
			var aFiles = oEvt.getParameters().files;
			var currentFile = aFiles[0];
			this.resizeAndUpload(currentFile, {
				success: function(oEvt) {
					oFileUploader.setValue("");
					//Here the image is on the backend, so i call it again and set the image
					// var model = that.getModel("createTrans");
					var getModelUserInfo = that.getModel("dataUser");
					if (!getModelUserInfo) {
						return;
					}
					getModelUserInfo.setProperty("/avatar", encodeURI(oEvt.data.link));
					// pics.push({
					// 	url: encodeURI(oEvt.data.link)
					// });
					getModelUserInfo.updateBindings(true);
				},
				error: function(oEvt) {
					//Handle error here
				}
			});
		},

		resizeAndUpload: function(file, mParams) {
			var that = this;
			var reader = new FileReader();
			reader.onerror = function(e) {
				//handle error here
			};
			reader.onloadend = function() {
				var tempImg = new Image();
				tempImg.src = reader.result;
				tempImg.onload = function() {
					that.uploadFile(tempImg.src, mParams, file);
				};
			};
			reader.readAsDataURL(file);
		},

		uploadFile: function(dataURL, mParams, file) {
			var xhr = new XMLHttpRequest();
			var BASE64_MARKER = 'data:' + file.type + ';base64,';
			var base64Index = dataURL.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
			var base64string = dataURL.split(",")[1];

			xhr.onreadystatechange = function(ev) {
				if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 201)) {
					mParams.success(JSON.parse(xhr.response));
				} else if (xhr.readyState == 4) {
					mParams.error(ev);
				}
			};
			var URL = "https://api.imgur.com/3/upload";
			var fileName = (file.name === "image.jpeg") ? "image_" + new Date().getTime() + ".jpeg" : file.name;
			xhr.open('POST', URL, true);
			xhr.setRequestHeader("Content-type", file.type); //"application/x-www-form-urlencoded");
			xhr.setRequestHeader("Authorization", "Bearer 5c25e781ffc7f495059078408c311799e277d70e"); //"application/x-www-form-urlencoded");
			var data = base64string;
			xhr.send(data);
		},

		selectItem: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("oModelItem");
			if (bindingContext) {
				var itemId = bindingContext.getProperty("id");
				this.getRouter().navTo("itemDetail", {
					itemId: itemId
				}, false);
			}
		},

		onSelectShop: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("oModelShop");
			if (bindingContext) {
				var shopId = bindingContext.getProperty("id");
				this.getRouter().navTo("shopDetail", {
					shopId: shopId
				}, false);
			}
		},

		updatePassword: function() {
			var oldPassword = this.getView().byId("oldPassword").getValue();
			var newPassword = this.getView().byId("newPassword").getValue();
			var email = this.getGlobalModel().getProperty("/username");
			var change = models.changePassword(newPassword, email, oldPassword);
			if (change.status === 200) {
				MessageBox.success("Cập nhật thành công!");
				this.getView().byId("oldPassword").setValue("");
				this.getView().byId("newPassword").setValue("");
			} else {
				MessageBox.error("Cập nhật thất bại!");
			}
		},

		onPressNotiDetail: function(oEvent) {
			var item = oEvent.getSource();
			var bindingContext = item.getBindingContext("dataNotify");
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
					this.getRouter().navTo("itemDetail", {
						itemId: itemId
					});
				}

			}
		}

	});
});