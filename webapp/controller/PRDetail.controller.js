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
            var oDataModel = this.getModel();
            var PreqNo = o.getParameter("arguments").PreqNo;
            var isEdit = this.getModel("ui").getProperty("/editing");
            if (!isEdit) {
                if (PreqNo === "new" || PreqNo === "copy") {
                    //Default mode is EDIT & CREATE MODE
                    this.getModel("ui").setProperty("/", {
                        editing: true,
                        createMode: true
                    });
                    var draftModel = this.initDraft();

                    //check if newPR is created as copy PR
                    if (PreqNo === "copy") {
                        //Read Copy PR data
                        var copyModel = this.getModel("copyPR");
                        if (!copyModel) {
                            MessageToast.show(this.getI18N("CANNOT_READ_COPYPR"));
                            return;
                        }
                        var copyPRList = copyModel.getProperty("/");
                        if (Array.isArray(copyPRList) && copyPRList.length > 0) {
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
                                        var draftPR_Items = draftModel.getProperty("/To_PRItems");
                                        d.PreqItem = formatter.formatNUMC((draftPR_Items.length + 1) * 10, 5);
                                        draftPR_Items.push(d);
                                        draftModel.setProperty("/To_PRItems", draftPR_Items);
                                    },
                                    error: function (e) {
                                        console.log(e);
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
        onCancelEditPR: function (e) {
            this.getModel("ui").setProperty("/editing", false);
            if (this.getModel("ui").getProperty("/createMode") === true) {
                this.back();
                return;
            }
            this.loadODataPRItem(this.PreqNo);

        },
        onMaterialAdd: function (e) {
            var draftModel = this.getModel("draft");
            var draftPR = draftModel.getProperty("/");
            var newPRItem = this.createJSONObjectFromOData("/PR_ItemSet");
            newPRItem.ProdTypGrp = 1;  // Material = 1
            newPRItem.PreqNo = draftPR.PreqNo;
            newPRItem.to_accounts = [];
            newPRItem.PreqItem = formatter.formatNUMC((draftPR.To_PRItems.length + 1) * 10, 5);
            draftPR.To_PRItems.push(newPRItem);
            draftModel.refresh();
            this.getRouter().navTo("itemDetail", {
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
                PreqItem: PRItem.PreqItem,
                edit: edit
            }, false);
        }
        ,
        onPressDeletePR: function (e) {
            var bindingObj = e.getSource().getBindingContext();
            try {
                var PreqNo = bindingObj.PreqNo;
                var Desc = bindingObj.Desc;
            } catch (ex) {

            }
            var close = function (e) {
                if (e === MessageBox.Action.OK) {
                    var key = this.getModel().createKey("/PR_HeaderSet", {
                        PreqNo: this.PreqNo
                    });
                    var onSuccess = function () {
                            console.log("Deleted" + this.PreqNo);
                        },
                        onError = function (e) {
                            console.log("Cannot delete" + this.PreqNo + ": " + e);
                        };

                    this.getModel().remove(key, {
                        success: onSuccess,
                        error: onError
                    });
                } else if (e === sap.m.MessageBox.Action.Cancel) {
                }
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
        },
        handleMessagePopoverPress: function (e) {
            var messagePopover = e.getSource().getDependents()[0];
            messagePopover.openBy(e.getSource());
        },
        onSavePR: function (e) {
            var that = this;
            // this.setViewProperty("busy", true);
            var btnMessagesStrip = this.byId("__btnMessagesStrip");
            var onSuccess = function (d, r) {
                // case success
                var errorResponse = d.__batchResponses[0].response;
                var postResponse = d.__batchResponses[0].__changeResponses;
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
                    var message = postResponse[0].headers['sap-message'];
                    var changeSetMessage = JSON.parse(message);
                    var oMsgStrip = new sap.m.MessageStrip("msgStrip", {
                        text: changeSetMessage.code + ' ' + changeSetMessage.message,
                        type: formatter.serverityFormat(changeSetMessage.severity)
                    });
                    that.getView().addContent(oMsgStrip);
                    that.getModel("ui").setProperty("/", {
                        editing: false,
                        createMode: false,
                        itemSelected: false,
                        busy: false
                    });
                }

            }, onError = function (e) {
                console.log(e);
                that.setViewProperty("busy", false);
            };
            var mode = this.getModel("ui").getProperty("/createMode");
            if (mode === true) {
                this.onCreatePR(onSuccess, onError);
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

        }
        ,
        onCreatePR: function (success, error) {
            var that = this;
            this.getModel().setDeferredGroups("create");
            var draftPR = this.getModel("draft").getProperty("/");
            draftPR.To_PRItems.forEach(function (item) {
                item.to_accounts.forEach(function (acctAss) {
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
            delete draftPR.To_PRItems;
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