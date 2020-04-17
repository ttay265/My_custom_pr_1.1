sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, MessageBox, formatter) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.PRDetail", {
        formatter: formatter,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.PRList
         */
        onInit: function () {
            this.setModel(new JSONModel({
                editting: false
            }), "ui");
            this.setModel(new JSONModel({
                totalValue: 0,
                items: [],
                limitItems: []
            }), "draft");
        },
        onPressDeleteItem: function () {

        },
        onAfterRendering: function () {
            this.getRouter().getRoute("PRDetail").attachPatternMatched(this._onObjectMatched, this);
            this.getRouter().getRoute("newPR").attachPatternMatched(this._onNewPRMatch, this);
        },
        onPressAddItem: function () {
            var items = this.getModel("draft").getProperty("/items");
            if (!items) {
                items = new Array();
            }
            items.push();
            this.getModel("draft").refresh();
            this.getModel("draft").updateBindings(true);
        },
        onPressAddLimitItem: function () {
            var items = this.getModel("draft").getProperty("/limitItems");
            if (!items) {
                items = new Array();
            }
            items.push();
            this.getModel("draft").updateBindings();
        },
        _onNewPRMatch: function (o) {
            //Default mode is EDIT
            this.getModel("ui").setProperty("/editting", true);

            //Load
            var isCopy = o.getParameter("arguments").copy;
            if (isCopy) {
                //Read Copy PR data

            }
        },
        _onObjectMatched: function (o) {
            var odataModel = this.getModel();
            var that = this;
            this.PreqNo = o.getParameter("arguments").PreqNo;
            var key = this.getModel().createKey("/PR_HeaderSet", {
                PreqNo: this.PreqNo
            });
            var onSuccess = function (d, r) {
                //Bind data in response with display oData
                that.setModel(new JSONModel(d), "display");
            }, onError = function (e) {
                console.log(e);
            };

            odataModel.read(key, {
                urlParameters: "$expand=To_PRItems",
                success: onSuccess,
                error: onError
            });
            // this.getView().setBindingContext(key);

            var detailKey = key + "/$expand=To_PRItems";
            var onSuccess = function (d, r) {
                //Bind data in response with display oData
                that.getModel("display").setProperty("/items", d.results);
            }, onError = function (e) {
                console.log(e);
            };

            odataModel.read(key, {
                success: onSuccess,
                error: onError
            });
        },
        onEditPress: function (e) {
            this.getModel("ui").setProperty("/editting", true);
            //copy display data to edit model
            var prData = this.getModel("display").getProperty("/");
            this.getModel("draft").setProperty("/", prData);
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

            }
            ;
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