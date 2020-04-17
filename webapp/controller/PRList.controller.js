sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.PRList", {

        formatter: formatter,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        onInit: function () {
            this.UIModel = new JSONModel({
                hasItemSelected: false    // By default, no items have been selected yet.
            });
            this.setModel(this.UIModel, "ui");
        },
        onSearchPRList: function () {

        },
        onPressNavPRDetail: function (e) {
            var o = e.getSource().getBindingContext().getObject();
            var PreqNo = o.PreqNo;
            var router = this.getRouter();
            router.navTo("PRDetail",{
                PreqNo: PreqNo
            }, false);
        },
        onPressRow: function (e) {
            var table = e.getSource();
            var hasItemSelected = table.getSelectedItems().length > 0 ? true : false;
            this.getModel("ui").setProperty("/hasItemSelected", hasItemSelected);
        },
        onNavCopyPR: function (o) {
            // var router = this.getRouter();
            //get selected PR
            var table = o.getSource();
            var selectedPR = [];
            var selectedItems = table.getSelectedItems();
            var ob = selectedItems.getBindingContext().getObject();
            console.log(ob);
            for (var i =0; i < selectedItems.length; i++) {
                selectedPR.push({
                    PreqNo: selectedItems[i].PreqNo,
                    PreqItem
                })
            }
            // this.setCopyPR();
            // router.navTo("newPR", {
            //     copy: true
            // }, false)
        }
        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onExit: function() {
        //
        //	}

    });

});