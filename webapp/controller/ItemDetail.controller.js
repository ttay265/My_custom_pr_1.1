sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.ItemDetail", {
        formatter: formatter,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        onInit: function () {
            this.setModel(new JSONModel({
                editing: false
            }, true), "ui");
            this.setModel(new JSONModel({}, true), "PRItem");
            this.getRouter().getRoute("itemDetail").attachPatternMatched(this._onObjectMatched, this);

        },
        onAfterRendering: function () {

        },
        _onObjectMatched: function (o) {
            var PreqItem = o.getParameter("arguments").PreqItem;
            var editing = o.getParameter("arguments").edit === "true";
            if (editing === true) {
                var PRItemModel = this.getModel("draft");
            } else {
                var PRItemModel = this.getModel("display");
            }
            this.getModel("ui").setProperty("/editing", editing);
            var PRItem = PRItemModel.getProperty("/To_PRItems").find(function (a) {
                return a.PreqItem = PreqItem;
            });
            this.getModel("PRItem").setProperty("/", PRItem);
        },



        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onExit: function() {
        //
        //	}

    });

});