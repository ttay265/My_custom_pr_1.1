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
        setModel: function (m, n, s) {
            if (s) {
                return this.getOwnerComponent().setModel(m, n);
            } else {
                return this.getView().setModel(m, n);
            }

        },
        getModel: function (m) {
            return this.getView().getModel(m) || this.getOwnerComponent().getModel(m);
        },
        getI18N: function (t) {
            return this.getView().getModel("i18n").getResourceBundle().getText(t);
        },
        getDeletePRConfirmMsg: function (n, d) {
            return this.getI18N("MSG_CONFIRM_DELETE_PR") + (n || "") + " " + (d || "") + "?";
        },
        createJSONObjectFromOData: function (m, p) {
            if (m) {
                var d = m.createEntry(p).getObject();
                delete d.__metadata;
                return d;
            }
        }
    });
});