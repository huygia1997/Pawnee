sap.ui.define([], function() {
	"use strict";
	return {
		status: function(sStatus) {
			console.log(sStatus);
			switch (sStatus) {
				case 1:
					return sap.ui.core.ValueState.Success;
				case 2:
					return sap.ui.core.ValueState.Warning;
				case 3:
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.None;
			}
		},
		intBoolRandomizer: function(iRandom) {
			return iRandom % 2 === 0;
		},
		favorite: function(sStatus) {
			return sStatus.length % 2 === 0;
		}
	};
});