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
            var viewModel = new JSONModel({
                editing: false,
                createMode: true
            }, true);
            this.setModel(viewModel, "ui");
            this.setModel(new JSONModel({}, true), "draft", true);

        },
        initDraft: function () {
            var draftPRObject = this.createJSONObjectFromOData("/PR_HeaderSet");
            draftPRObject.To_PRItems = [];
            var draftModel = this.getModel("draft");
            draftModel.setProperty("/", draftPRObject);
            return draftModel;
        },
        onPressDeleteItem: function () {

        },
        onAfterRendering: function () {
            this.getRouter().getRoute("PRDetail").attachPatternMatched(this._onObjectMatched, this);
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
            if (PreqNo === "new" || PreqNo === "copy") {
                //Default mode is EDIT
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
                this.getModel("ui").setProperty("/", {
                    editing: false,
                    createMode: false
                });
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
                that.setModel(new JSONModel(d), "display");
            }, onError = function (e) {
                console.log(e);
            };
            oDataModel.read(key, {
                urlParameters: "$expand=To_PRItems",
                success: onSuccess,
                error: onError
            });
        },
        onEditPress: function (e) {
            this.getModel("ui").setProperty("/editing", true);
            //copy display data to edit model
            var prData = this.getModel("display").getProperty("/");
            this.getModel("draft").setProperty("/", prData);
        },
        onCancelEditPR: function (e) {
            if (this.getModel("ui").getProperty("/createMode") === true) {
                this.back();
                return;
            }
            this.loadODataPRItem(this.PreqNo);
            this.getModel("ui").setProperty("/editing", false);
        },
        onMaterialAdd: function (e) {
            var draftModel = this.getModel("draft");
            var draftPR = draftModel.getProperty("/");
            var newPRItem = this.createJSONObjectFromOData("/PR_ItemSet");
            newPRItem.Preqno = draftPR.PreqNo;
            newPRItem.PreqItem = formatter.formatNUMC((draftPR.To_PRItems.length + 1) * 10, 5);
            delete newPRItem.__metadata;
            draftPR.To_PRItems.push(newPRItem);
            draftModel.setProperty("/To_PRItems", draftPR.To_PRItems);
            this.getRouter().navTo("itemDetail", {
                PreqItem: newPRItem.PreqItem,
                edit: true
            }, false);
        },
        onItemPress: function (e) {
            var PRItem = e.getSource().getBindingContext("draft").getObject();
            var edit = this.getModel("ui").getProperty("/editing");
            this.getRouter().navTo("itemDetail", {
                PreqItem: PRItem.PreqItem,
                edit: edit
            }, false);
        },
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