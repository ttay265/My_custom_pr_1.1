sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/tw/mypr/My_custom_pr/model/models",
    "sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, Device, models, ODataModel) {
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

            // enable routing
            this.getRouter().initialize();

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
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
        }
    });
});