sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.PRDetail", {
        formatter: formatter,

        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        onInit: function () {
            this.table_PRItem_draft = this.byId("_table_PRItem_draft");
            var viewModel = new JSONModel({
                editing: false,
                createMode: false,
                itemSelected: false,
                busy: false
            }, true);
            this.setViewModel(viewModel);
            this.setModel(new JSONModel(), "message");
            this.setModel(new JSONModel({}, true), "draft", true);
            this.setModel(new JSONModel({}, true), "display", true);
            this.getRouter().getRoute("PRDetail").attachPatternMatched(this._onObjectMatched, this);
        },
        initDraft: function () {
            var draftPRObject = this.createJSONObjectFromOData("/PR_HeaderSet");
            draftPRObject.To_PRItems = [];
            var draftModel = this.getModel("draft");
            draftModel.setProperty("/", draftPRObject);
            return draftModel;
        },
        onPressDeleteItem: function (o) {
            if (this.getModel("ui").getProperty("/createMode")) {
                var table = o.getSource().getParent().getParent();
                var deletingItems = [];
                table.getSelectedItems().forEach(function (e) {
                    let PreqItem = e.getBindingContext("draft").getObject().PreqItem;
                    deletingItems.push(PreqItem);
                });
                var To_PRItems = this.getModel("draft").getProperty("/To_PRItems");
                deletingItems.forEach(function (e) {
                    var idx = To_PRItems.findIndex(function (p) {
                        return p.PreqItem == e;
                    });
                    To_PRItems.splice(idx, 1);
                });
                this.getModel("draft").refresh();
                this.table_PRItem_draft.fireSelectionChange();
            } else { //

            }
        },
        onSelectionChange: function (o) {
            this.getModel("ui").setProperty("/itemSelected", o.getSource().getSelectedItems().length > 0);
        },
        onAfterRendering: function () {

        },
        onPressAddItem: function (e) {
            var actionSheet = e.getSource().getDependents()[0];
            actionSheet.openBy(e.getSource());
        },
        // onPressAddLimitItem: function () {
        //     var items = this.getModel("draft").getProperty("/limitItems");
        //     if (!items) {
        //         items = new Array();
        //     }
        //     items.push();
        //     this.getModel("draft").updateBindings();
        // },

        _onObjectMatched: function (o) {
            var that = this;
            const oDataModel = this.getModel(), PreqNo = o.getParameter("arguments").PreqNo,
                isEdit = this.getModel("ui").getProperty("/editing");
            if (!isEdit) {
                if (PreqNo === "new" || PreqNo === "copy") {
                    //Default mode is EDIT & CREATE MODE
                    var draftModel = this.initDraft();
                    var draftPR_Items = draftModel.getProperty("/To_PRItems");
                    this.getModel("ui").setProperty("/", {
                        editing: true,
                        createMode: true
                    });
                    //check if newPR is created as copy PR
                    if (PreqNo === "copy") {
                        this.getModel("ui").setProperty("/busy", true, null, false);
                        //Read Copy PR data
                        var copyModel = this.getModel("copyPR");
                        if (!copyModel) {
                            MessageToast.show(this.getI18N("CANNOT_READ_COPYPR"));
                            return;
                        }
                        var copyPRList = copyModel.getProperty("/");
                        if (Array.isArray(copyPRList) && copyPRList.length > 0) {
                            var i = 0;

                            copyPRList.forEach(function (e) {
                                var key = oDataModel.createKey("/PR_ItemSet", {
                                    PreqNo: e.PreqNo,
                                    PreqItem: e.PreqItem
                                });
                                oDataModel.read(key, {
                                    urlParameters: {
                                        "$expand": "to_accounts"
                                    },
                                    success: function (d, r) {
                                        d.to_accounts = d.to_accounts.results;
                                        delete d.__metadata;
                                        d.PreqNo = "";
                                        d.PreqItem = formatter.formatNUMC((draftPR_Items.length + 1) * 10, 5);
                                        draftPR_Items.push(d);
                                        if (draftPR_Items.length === copyPRList.length) {
                                            that.getModel("ui").setProperty("/busy", false);
                                        }
                                        draftModel.refresh(true);
                                    },
                                    error: function (e) {
                                        that.getModel("ui").setProperty("/busy", false);
                                        MessageToast.show(e.toString());

                                    }
                                })
                            });
                        }
                    }

                } else {
                    this.PreqNo = PreqNo;
                    this.loadODataPRItem(this.PreqNo);
                }
            }
        },

        loadODataPRItem: function (PreqNo) {
            var oDataModel = this.getModel();
            var that = this;
            var key = this.getModel().createKey("/PR_HeaderSet", {
                PreqNo: PreqNo
            });
            var onSuccess = function (d, r) {
                //Bind data in response with display oData
                d.To_PRItems = d.To_PRItems.results;
                d.To_PRItems.forEach(function (item) {
                    item.to_accounts = item.to_accounts.results;
                });
                that.getModel("display").setProperty("/", d);

            }, onError = function (e) {
                console.log(e);
            };
            oDataModel.read(key, {
                urlParameters: "$expand=To_PRItems/to_accounts",
                success: onSuccess,
                error: onError
            });
        }
        ,
        onEditPress: function (e) {
            this.getModel("ui").setProperty("/editing", true);
            //copy display data to edit model
            var prData = this.getModel("display").getProperty("/");
            this.getModel("draft").setProperty("/", prData);
            this.table_PRItem_draft.removeSelections(true);
        },
        onCancelEditPR: function () {
            this.getModel("message").setProperty("/", {});
            this.getModel("ui").setProperty("/editing", false);
            if (this.getModel("ui").getProperty("/createMode") === true) {
                this.getModel("ui").setProperty("/createMode", false);
                this.back();

                return;
            }
            this.loadODataPRItem(this.PreqNo);
        },
        onMaterialAdd: function (e) {
            var draftModel = this.getModel("draft");
            var draftPR = draftModel.getProperty("/");
            var newPRItem = this.createJSONObjectFromOData("/PR_ItemSet");
            newPRItem.PreqNo = draftPR.PreqNo;
            newPRItem.to_accounts = [];
            newPRItem.PreqItem = formatter.formatNUMC((draftPR.To_PRItems.length + 1) * 10, 5);
            draftPR.To_PRItems.push(newPRItem);
            draftModel.refresh();
            this.getRouter().navTo("itemDetail", {
                PreqNo: newPRItem.PreqNo,
                PreqItem: newPRItem.PreqItem,
                edit: true
            }, false);
        },
        onItemPress: function (e) {

            var edit = this.getViewProperty("editing");
            if (edit === true) {
                var PRItem = e.getSource().getBindingContext("draft").getObject();
            } else {
                var PRItem = e.getSource().getBindingContext("display").getObject();
            }
            this.getRouter().navTo("itemDetail", {
                PreqNo: PRItem.PreqNo,
                PreqItem: PRItem.PreqItem,
                edit: edit
            }, false);
        }
        ,
        onPressDeletePR: function (e) {
            var that = this;
            const msg = this.getView().getModel("i18n").getResourceBundle().getText("MSG_CONFIRM_DELETE_PR", [this.PreqNo]);
            var close = function (e) {
                if (e === MessageBox.Action.DELETE) {
                    that.setViewProperty("/busy", true);
                    var key = that.getModel().createKey("/PR_HeaderSet", {
                        PreqNo: that.PreqNo
                    });
                    var onSuccess = function () {
                            var msg = that.getModel("i18n").getResourceBundle().getText("MSG_SUCCESS_DELETE_PR_SINGLE", [that.PreqNo]);
                            MessageToast.show(msg);
                            that.setViewProperty("/", {
                                editing: false,
                                createMode: false,
                                itemSelected: false,
                                busy: false
                            })
                            that.back();
                        },
                        onError = function (e) {
                            that.setViewProperty("/busy", false);
                            const msgJSON = JSON.parse(e.responseText);
                            MessageBox.error("Cannot delete" + that.PreqNo + ": " + msgJSON.error.message.value);
                        };

                    that.getModel().remove(key, {
                        success: onSuccess,
                        error: onError
                    });
                } else if (e === sap.m.MessageBox.Action.Cancel) {
                }
            };
            MessageBox.show(
                msg, {
                    icon: MessageBox.Icon.WARNING,
                    title: this.getI18N("deletePR"),
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    initialFocus: MessageBox.Action.CANCEL,
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: close
                }
            );
        },

        handleMessagePopoverPress: function (e) {
            var messagePopover = e.getSource().getDependents()[0];
            messagePopover.openBy(e.getSource());
        },

        onSavePR: function (oEvent, isHold) {
            var that = this;
            this.setViewProperty("busy", true);
            var btnMessagesStrip = this.byId("__btnMessagesStrip");
            if (!this.MessageDialog) {
                this.MessageDialog = sap.ui.xmlfragment("com.tw.mypr.My_custom_pr.fragment.MessageContainerDialog", this);
            }
            const onSuccess = function (d, r) {
                // case success
                const errorResponse = d.__batchResponses[0].response;
                const postResponse = d.__batchResponses[0].__changeResponses;
                if (errorResponse) {
                    //Process error response
                    try {
                        var errorsBodyMessages = JSON.parse(errorResponse.body);
                        var busiExceptionList = errorsBodyMessages.error.innererror.errordetails;
                        if (busiExceptionList.length === 0) {
                            busiExceptionList.push({
                                code: errorsBodyMessages.error.code,
                                message: errorsBodyMessages.error.message.value,
                                description: errorsBodyMessages.error.message.value,
                                severity: "error"
                            });
                        }
                        that.getModel("message").setProperty("/", busiExceptionList, null, false);
                        // btnMessagesStrip.addEventDelegate({
                        //     "onAfterRendering": function (e) {
                        //         if (e.getSource().getVisible()) {
                        //             var messagePopover = btnMessagesStrip.getDependents()[0];
                        //             messagePopover.openBy(btnMessagesStrip);
                        //         }
                        //     }
                        // }, this);
                        that.getModel().resetChanges(null, true);

                        var messagePopover = btnMessagesStrip.getDependents()[0];
                        messagePopover.openBy(btnMessagesStrip);
                    } catch (e) {
                        MessageToast.show("Cannot parse Error Messages");
                    } finally {
                        that.setViewProperty("busy", false);
                        return;
                    }
                }
                if (postResponse.find(e => e.statusCode.startsWith("20"))) {
                    //Post-Processing
                    const message = postResponse[0].headers['sap-message'];
                    var changeSetMessage = JSON.parse(message);
                    if (changeSetMessage.details.length > 0) {
                        // that.getModel("message").setProperty("/", changeSetMessage.details, null, false);
                        that.getView().addDependent(that.MessageDialog);
                        that.MessageDialog.setModel(new JSONModel(changeSetMessage.details), "message");
                        that.MessageDialog.open();
                    }
                    if (changeSetMessage.severity == "success") {
                        MessageToast.show(changeSetMessage.message);
                    }

                    that.onCancelEditPR();
                    that.setViewProperty("busy", false);
                    return;
                }
            }

            const onError = function (e) {
                console.log(e);
                that.getModel().resetChanges(null, true);
                that.setViewProperty("busy", false);
            }

            var mode = this.getModel("ui").getProperty("/createMode");
            if (mode === true) {
                this.onCreatePR(isHold, onSuccess, onError);
            } else {
                this.onUpdatePR(onSuccess, onError);
            }
        },
        onUpdatePR: function (success, error) {
            var that = this;
            this.getModel().setDeferredGroups(["update"]);
            var draftPR = Object.assign({}, this.getModel("draft").getProperty("/"));
            draftPR.To_PRItems.forEach(function (i) {
                var item = Object.assign({}, i);
                item.to_accounts.forEach(function (a) {
                    var acctAss = Object.assign({}, a);
                    var key = that.getModel().createKey("/AccAssignmentSet", {
                        PreqNo: acctAss.PreqNo,
                        PreqItem: acctAss.PreqItem,
                        SerialNo: acctAss.SerialNo
                    });
                    if (key) {
                        that.getModel().update(key, acctAss, {
                            method: 'PUT',
                            groupId: "update",

                        });
                    }
                });
                var key = that.getModel().createKey("/PR_ItemSet", {
                    PreqNo: item.PreqNo,
                    PreqItem: item.PreqItem
                });
                //format updating data
                if (item.PreqPrice.isPrototypeOf(String)) {
                    item.PreqPrice = Number.parseFloat(item.PreqPrice);
                }
                delete item.to_accounts;
                that.getModel().update(key, item, {
                    method: 'PUT',
                    groupId: "update",

                })
            });
            delete draftPR.To_PRItems;
            var key = that.getModel().createKey("/PR_HeaderSet", {
                PreqNo: draftPR.PreqNo
            });
            this.getModel().update(key, draftPR, {
                method: 'PUT',
                groupId: "update"
            });
            this.getModel().submitChanges({
                groupId: "update",
                success: success,
                error: error
            });

        },
        onHoldPR: function () {
            this.onSavePR(null, true);
        },
        onCreatePR: function (isHold, success, error) {
            var that = this;
            this.getModel().setDeferredGroups(["create"]);
            var draftPR = Object.assign({}, this.getModel("draft").getProperty("/"));
            draftPR.To_PRItems.forEach(function (i) {
                var item = Object.assign({}, i);
                delete item.__metadata;
                item.PreqPrice = item.PreqPrice.toString();
                item.to_accounts.forEach(function (a) {
                    var acctAss = Object.assign({}, a);
                    delete acctAss.__metadata;
                    that.getModel().createEntry("/AccAssignmentSet", {
                        properties: acctAss,
                        changeSetId: "create",
                        groupId: "create"
                    });
                });
                that.getModel().createEntry("/PR_ItemSet", {
                    properties: item,
                    changeSetId: "create",
                    groupId: "create"
                })
            });
            //Transform PR Data
            if (isHold) {
                draftPR.HoldComplete = 'X';
                draftPR.HoldUncomplete = 'X';
                draftPR.MemoryType = 'H';
            }

            delete draftPR.To_PRItems;
            delete draftPR.__metadata;

            this.getModel().createEntry("/PR_HeaderSet", {
                properties: draftPR,
                changeSetId: "create",
                groupId: "create"
            });
            this.getModel().submitChanges({
                groupId: "create",
                success: success,
                error: error
            });
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