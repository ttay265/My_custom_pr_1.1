sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("com.tw.mypr.My_custom_pr.controller.BaseController", {
        onInit: function () {

        },
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        setModel: function (n, m) {
            return this.getView().setModel(n, m);
        },
        getModel: function (m) {
            return this.getView().getModel(m);
        },
        getI18N: function (t) {
           return this.getView().getModel("i18n").getResourceBundle().getText(t);
        },
        getDeletePRConfirmMsg: function (n, d) {
            return this.getI18N("MSG_CONFIRM_DELETE_PR") + (n || "") + " " + (d || "") + "?";
        }
    });
});