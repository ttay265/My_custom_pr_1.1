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
            let viewModel = new JSONModel({
                editting: false
            }, true);
            this.setModel(viewModel, "ui");
            this.setModel(new JSONModel({}, true), "draft");

        },
        initDraft: function () {
            let draftPRObject = this.createJSONObjectFromOData(this.getModel(), "/PR_HeaderSet");
            draftPRObject.To_PRItems = [];
            draftPRObject.PreqNo = "New Purchase Requisition";
            let draftModel = this.getModel("draft");
            draftModel.setProperty("/", draftPRObject);
            return draftModel;
        },
        onPressDeleteItem: function () {

        },
        onAfterRendering: function () {
            this.getRouter().getRoute("PRDetail").attachPatternMatched(this._onObjectMatched, this);
            this.getRouter().getRoute("newPR").attachPatternMatched(this._onNewPRMatch, this);
        },
        onPressAddItem: function () {
            let items = this.getModel("draft").getProperty("/items");
            if (!items) {
                items = new Array();
            }
            items.push();
            this.getModel("draft").refresh();
            this.getModel("draft").updateBindings(true);
        },
        onPressAddLimitItem: function () {
            let items = this.getModel("draft").getProperty("/limitItems");
            if (!items) {
                items = new Array();
            }
            items.push();
            this.getModel("draft").updateBindings();
        },
        _onNewPRMatch: function (o) {
            let that = this;
            //Default mode is EDIT
            this.getModel("ui").setProperty("/editting", true);
            let draftModel = this.initDraft();
            let draftPR_Items = draftModel.getProperty("/To_PRItems");

            let oDataModel = this.getModel();

            //check if newPR is created as copy PR
            let isCopy = o.getParameter("arguments").copy;
            if (isCopy) {
                //Read Copy PR data
                let copyModel = this.getModel("copyPR");
                if (!copyModel) {
                    MessageToast.show(this.getI18N("CANNOT_READ_COPYPR"));
                    return;
                }
                let copyPRList = copyModel.getProperty("/");
                if (Array.isArray(copyPRList) && copyPRList.length > 0) {
                    copyPRList.forEach(function (e) {
                        let key = oDataModel.createKey("/PR_ItemSet", {
                            PreqNo: e.PreqNo,
                            PreqItem: e.PreqItem
                        });
                        oDataModel.read(key, {
                            urlParameters: {
                                "$expand": "to_accounts"
                            },
                            success: function (d, r) {

                                d.to_accounts = d.to_accounts.results;
                                delete d.to_accounts.results;
                                delete d.__metadata;
                                d.PreqNo = "";
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
        },
        _onObjectMatched: function (o) {
            let oDataModel = this.getModel();
            let that = this;
            this.PreqNo = o.getParameter("arguments").PreqNo;
            let key = this.getModel().createKey("/PR_HeaderSet", {
                PreqNo: this.PreqNo
            });
            let onSuccess = function (d, r) {
                //Bind data in response with display oData
                that.setModel(new JSONModel(d), "display");
            }, onError = function (e) {
                console.log(e);
            };
            oDataModel.read(key, {
                urlParameters: "$expand=To_PRItems",
                success: onSuccess,
                error: onError
            });
            // this.getView().setBindingContext(key);
        },
        onEditPress: function (e) {
            this.getModel("ui").setProperty("/editting", true);
            //copy display data to edit model
            let prData = this.getModel("display").getProperty("/");
            this.getModel("draft").setProperty("/", prData);
        },
        onCancelEditPR: function (e) {
            this.getModel("ui").setProperty("/editting", false);
        },
        onPressDeletePR: function (e) {
            let bindingObj = e.getSource().getBindingContext();
            try {
                let PreqNo = bindingObj.PreqNo;
                let Desc = bindingObj.Desc;
            } catch (ex) {

            }
            ;
            let close = function (e) {
                if (e === MessageBox.Action.OK) {
                    let key = this.getModel().createKey("/PR_HeaderSet", {
                        PreqNo: this.PreqNo
                    });
                    let onSuccess = function () {
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
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        //	onExit: function() {
        //
        //	}

    });

});