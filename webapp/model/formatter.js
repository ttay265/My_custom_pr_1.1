sap.ui.define([
        "sap/ui/core/format/DateFormat",
        "sap/ui/core/format/NumberFormat",
        "sap/m/MessageToast",
        "sap/ui/model/type/Currency",
        "com/tw/mypr/My_custom_pr/controller/BaseController",
        "sap/ui/model/json/JSONModel"],
    function (DateFormat, NumberFormat, BaseController, MessageToast, JSONModel) {
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
            formatCurrency: function (v, ISOCode) {
                var oCurrencyFormat = NumberFormat.getCurrencyInstance();

                return oCurrencyFormat.format(v, ISOCode);
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
            },
            serverityFormat: function (s) {
                switch (s) {
                    case "success":
                        return "Success";
                    case "info":
                        return "Information";
                    case "warning":
                        return "Warning";
                    case "error":
                        return "Error";
                    default:
                        return "None";
                }
            },
            calculateTotalValue: function (PreqPrice, PriceUnit, Quantity, Currency) {

                var oCurrency = new sap.ui.model.type.Currency({
                    showMeasure: false
                });

                function isNumber(n) {
                    return typeof n == 'number' && !isNaN(n) && isFinite(n);
                }

                var totalValue = PreqPrice / PriceUnit * Quantity;
                if (!isNumber(totalValue)) {
                    totalValue = 0;
                }
                return oCurrency.formatValue([totalValue, Currency], "string");
            }
        };
    });
