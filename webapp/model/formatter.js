sap.ui.define([
    "sap/ui/core/ValueState"], function(ValueState) {
	"use strict";
	return {
		status: function(sStatus) {
			switch (sStatus) {
				case 1: //NOT_OVERDUE
                    return ValueState.Information;
                case 2: //WAIT_FOR_LIQUIDATION
                    return ValueState.Error;
                case 3: //REDEEMED
                    return ValueState.Success;
                case 4: //LATE
                    return ValueState.Warning;
                case 5: //LIQUIDATION
                    return ValueState.Success;
                case 6: //CANCELED
                    return ValueState.None;
                case 7: //ON_DUE_DATE
                    return ValueState.Warning;
                default:
                    return ValueState.None;
			}
		},
        transStatusDesc: function (sStatus) {
            var i18n = this.getResourceBundle();
            switch (sStatus) {
                case 1:
                    return i18n.getText('NOT_OVERDUE'); //Information
                case 2:
                    return i18n.getText('WAIT_FOR_LIQUIDATION'); //Accept
                case 3:
                    return i18n.getText('REDEEMED'); // Neutral
                case 4:
                    return i18n.getText('LATE'); //critical
                case 5:
                    return i18n.getText('LIQUIDATION'); //Information
                case 6:
                    return i18n.getText('CANCELED'); // Neutral
                case 7:
                    return i18n.getText('ON_DUE_DATE'); //Warning
                default:
                    return "";
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