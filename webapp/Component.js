sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/tw/mypr/My_custom_pr/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
], function (UIComponent, Device, models, JSONModel, MessageToast, Filter) {
    "use strict";

    return UIComponent.extend("com.tw.mypr.My_custom_pr.Component", {

        metadata: {
            manifest: "json",
            config: {fullWidth: true}
        },
        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            require('dotenv').config();
            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.loadStatusTextTypeSet();
            this.loadPurcDocTypeSet();
            this.setModel(new JSONModel({}, true), "documentFlow");
        }, createContent: function () {
            var r = UIComponent.prototype.createContent.apply(this, arguments);
            r.addStyleClass(this.getContentDensityClass());
            return r;
        }, getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (Device.system.desktop) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },
        loadStatusTextTypeSet: function () {
            var that = this;
            var onSuccess = function (d, r) {
                    that.setModel(new JSONModel(d.results), "statusText");
                },
                onError = function (e) {
                    console.log(e);
                };
            this.getModel().read("/StatusTextTypeSet", {
                success: onSuccess,
                error: onError
            });
        },
        loadPurcDocTypeSet: function () {
            var that = this;
            var onSuccess = function (d, r) {
                that.setModel(new JSONModel(d.results), "PurcDocType");
            }, onError = function (e) {
                MessageToast.show(e.toString());
            };
            var filter = new Filter({
                path: "DocCategory",
                operator: "EQ",
                value1: "B",
                value2: ''
            });
            this.getModel().read("/PurcDocTypeSet", {
                filters: [filter],
                success: onSuccess,
                error: onError
            });
        }

    });
});