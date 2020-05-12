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
            var that = this;
            this.PreqItem = o.getParameter("arguments").PreqItem;
            var editing = o.getParameter("arguments").edit === "true";
            if (editing === true) {
                var PRItemModel = this.getModel("draft");
            } else {
                var PRItemModel = this.getModel("display");
            }
            this.getModel("ui").setProperty("/editing", editing);
            var To_PRItems = PRItemModel.getProperty("/To_PRItems");
            var currentPRItem = To_PRItems.find(function (a) {
                return a.PreqItem == that.PreqItem;
            });
            this.getModel("PRItem").setProperty("/", currentPRItem);
        },
        onSavePR: function (e) {
            var that = this;
            var PRItemModel = this.getModel("draft");
            var Draft_To_PRItems = PRItemModel.getProperty("/To_PRItems");
            var idx = Draft_To_PRItems.findIndex(function (a) {
                return a.PreqItem == that.PreqItem;
            });
            var savingPRItem = this.getModel("PRItem").getProperty("/");
            Draft_To_PRItems[idx] = savingPRItem;
            this.back();
        },
        onCancel: function () {
            this.back();
        },
        onAddAccAssPress: function (e) {
            var oDataModel = this.getModel();
            oDataModel.createEntry("/AccAssignmentSet", {

            })
        }

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onExit: function() {
        //
        //	}

    });

});