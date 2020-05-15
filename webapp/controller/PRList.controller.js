sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, MessageBox, MessageToast, formatter) {
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
            this.table_PRList = this.byId("table_PRList");
        },
        onAfterRendering: function () {
            this.getModel().updateBindings(true);
        },

        onSearchPRList: function () {

        },
        onPressNavPRDetail: function (e) {
            var o = e.getSource().getBindingContext().getObject();
            var PreqNo = o.PreqNo;
            var router = this.getRouter();
            router.navTo("PRDetail", {
                PreqNo: PreqNo
            }, false);
        },
        onPressRow: function (e) {
            var table = e.getSource();
            var hasItemSelected = table.getSelectedItems().length > 0 ? true : false;
            this.getModel("ui").setProperty("/hasItemSelected", hasItemSelected);

            var hasMultiItemSelected = table.getSelectedItems().length > 1 ? false : true;
            this.getModel("ui").setProperty("/hasMultiItemSelected", hasMultiItemSelected);
        },
        onCreatePR: function () {
            this.getRouter().navTo("PRDetail", {
                PreqNo: "new"
            }, false);
        },
        onNavDocFlow: function (o) {
            var selectedItems = this.table_PRList.getSelectedItems();
            var PreqNo;
            var PreqItem;

            if (this.table_PRList.getSelectedItems().length > 1) {
                //var hasMultiItemSelected = this.table_PRList.getSelectedItems().length > 1 ? true : false;
                //this.getModel("ui").setProperty("/hasMultiItemSelected", hasMultiItemSelected);
                MessageBox.alert("It can not proceed with multiple items. Please select 1 item only.");
            } else {
                selectedItems.forEach(function (e) {
                    var ob = e.getBindingContext().getObject();
                    //DocumentFlow/{PreqNo}/{PreqItem}
                    PreqNo = ob.PreqNo;
                    PreqItem = ob.PreqItem;
                });
                this.getRouter().navTo("DocumentFlow", {
                    PreqNo: PreqNo,
                    PreqItem: PreqItem
                }, false);
            }
        },
        onPressDeletePR: function () {

            const that = this;
            var deletingPR = [];
            var selectedItems = this.table_PRList.getSelectedItems()
            if (selectedItems.length <= 0) { // this case should never happen since the button enable logic is handled
                MessageToast.show(this.getI18N("MSG_SELECT_AT_LEAST_ONE_LINE"));
                return;
            }
            selectedItems.forEach(function (e) {
                var ob = e.getBindingContext().getPath();
                deletingPR.push(ob);
            });

            var close = function (e) {
                if (e === MessageBox.Action.DELETE) {
                    that.setViewProperty("/busy", true);
                    that.getModel().setDeferredGroups(["remove"]);
                    deletingPR.forEach(function (r) {
                        that.getModel().remove(r, {
                            groupId: "remove",
                            changeSetId: "remove"
                        });
                    });
                    var onSuccess = function (d) {
                            const errorResponse = d.__batchResponses[0].response;
                            const postResponse = d.__batchResponses[0].__changeResponses;
                            if (errorResponse) {
                                //Process error response
                                try {
                                    const errorsBodyMessages = JSON.parse(errorResponse.body);
                                    MessageBox.error("Cannot delete" + that.PreqNo + ": " + errorsBodyMessages.error.message.value);
                                } catch (e) {
                                    MessageToast.show("Cannot parse Error Messages");
                                } finally {
                                    that.setViewProperty("busy", false);
                                    return;
                                }
                            } else {
                                MessageToast.show(that.getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_DELETE_PR", [deletingPR.length]));
                            }
                            that.setViewProperty("/busy", false);
                        },
                        onError = function (e) {
                            that.setViewProperty("/busy", false);
                            const msgJSON = JSON.parse(e.responseText);
                            MessageBox.error("Cannot delete" + that.PreqNo + ": " + msgJSON.error.message.value);
                        };

                    that.getModel().submitChanges({
                        groupId: "remove",
                        success: onSuccess,
                        error: onError
                    });
                } else if (e === sap.m.MessageBox.Action.Cancel) {
                }
            };
            const msg = this.getView().getModel("i18n").getResourceBundle().getText("MSG_CONFIRM_DELETE_MULTI_PR", [deletingPR.length]);
            MessageBox.show(msg, {
                    icon: MessageBox.Icon.WARNING,
                    title: this.getI18N("deletePR"),
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    initialFocus: MessageBox.Action.CANCEL,
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: close
                }
            );

        },

        onNavCopyPR: function (o) {
            // var router = this.getRouter();
            //get selected PR
            var copyingPR = [];
            var selectedItems = this.table_PRList.getSelectedItems();
            selectedItems.forEach(function (e) {
                var ob = e.getBindingContext().getObject();
                copyingPR.push(ob);
            });
            var model = this.getModel("copyPR") || new JSONModel();
            model.setProperty("/", copyingPR);
            this.setModel(model, "copyPR", true);
            this.getRouter().navTo("PRDetail", {
                PreqNo: "copy"
            }, false);
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

})
;