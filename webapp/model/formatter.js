sap.ui.define([
        "sap/ui/core/format/DateFormat",
        "sap/m/MessageToast",
        "com/tw/mypr/My_custom_pr/controller/BaseController",
        "sap/ui/model/json/JSONModel"],
    function (DateFormat, BaseController, MessageToast, JSONModel) {
        "use strict";
        return {
            date: function (v) {
                if (v) {
                    var Y = v.substr(0, 4);
                    var M = v.substr(4, 2);
                    var d = v.substr(6, 2);
                    return d + "." + M + "." + Y;
                } else {
                    return v;
                }
            },
            formatCurrency: function (v, a) {
                var n = sap.ui.core.format.NumberFormat.getCurrencyInstance();
                return n.format(v);
            },
            prStatusText: function (s) {
                var that = this;
                var statusModel = this.getModel("statusText");
                if (statusModel) {
                    var statusList = statusModel.getProperty("/");
                    if (statusList.length > 0) {
                        var statusCondtion = function (c) {
                            return c.StatusID === s;
                        };
                        var result = statusList.find(statusCondtion);
                        if (result) {
                            return result.StatusText;
                        }
                    }
                }

            },
            docTypeText: function (s) {
                var that = this;
                var statusModel = this.getModel("PurcDocType");
                if (statusModel) {
                    var statusList = statusModel.getProperty("/");
                    if (statusList.length > 0) {
                        var statusCondtion = function (c) {

                            return c.DocType === s;
                        };
                        var result = statusList.find(statusCondtion);
                        if (result) {
                            return result.Description + " (" + s + ")";
                        }
                    }
                }

            },
            formatNUMC: function (d, n) {
                try {
                    return d.toString().padStart(n, "0");
                } catch (e) {
                }
            }
        };
    });
