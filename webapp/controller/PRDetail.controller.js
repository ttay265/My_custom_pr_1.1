sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, MessageBox) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.PRDetail", {

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        onInit: function () {
            this.setModel(new JSONModel({
                editting: false
            }), "ui");
            this.getRouter().getRoute("PRDetail").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (o) {
            var PreqNo = o.getParameter("arguments").PreqNo;
            var key = this.getModel().createKey("/PR_HeaderSet", {
                PreqNo: PreqNo
            });
            this.getView().bindElement({
                path: key
            });
        },
        onEditPress: function (e) {
            this.getModel("ui").setProperty("/editting", true);
        },
        onCancelEditPR: function (e) {
            this.getModel("ui").setProperty("/editting", false);
        },
        onPressDeletePR: function (e) {
            var bindingObj = e.getSource().getBindingContext();
            try {
                var PreqNo = bindingObj.PreqNo;
                var Desc = bindingObj.Desc;
            } catch (ex) {

            };
            var close = function (e) {
                if (e === MessageBox.Action.OK) {
                    console.log("asd");
                } else if (e === sap.m.MessageBox.Action.Cancel) {
                    console.log("dsa");
                }
                ;
            };
            MessageBox.show(
                this.getDeletePRConfirmMsg(PreqNo, Desc), {
                    icon: MessageBox.Icon.WARNING,
                    title: this.getI18N("deletePR"),
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    initialFocus: MessageBox.Action.CANCEL,
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: close
                }
            );
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