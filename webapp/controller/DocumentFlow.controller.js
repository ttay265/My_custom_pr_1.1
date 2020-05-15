sap.ui.define([
    "com/tw/mypr/My_custom_pr/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "com/tw/mypr/My_custom_pr/model/formatter"
], function (BaseController, JSONModel, formatter) {
    "use strict";

    return BaseController.extend("com.tw.mypr.My_custom_pr.controller.DocumentFlow", {
        formatter: formatter,
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberOf com.tw.mypr.My_custom_pr.view.DocumentFlow
         */

        onInit: function () {
            this.setModel(new JSONModel({
                busy: false
            }, true), "ui");
            //this.setModel(new JSONModel(), "docflow")
            this.getRouter().getRoute("DocumentFlow").attachPatternMatched(this._onObjectMatched, this);
            // this.getRouter().getRoute("itemDetail").attachPatternMatched(this._onObjectMatched, this);

            //var oView = this.getView();
            //this.oProcessFlow1 = oView.byId("processflow1");
            //var sDataPath = jQuery.sap.getModulePath("com.tw.mypr.My_custom_pr", ".model/ProcessFlow.json");
            //var oModelPf1 = new sap.ui.model.json.JSONModel(".model/ProcessFlow.json");
            //oView.setModel(oModelPf1);
            //oModelPf1.attachRequestCompleted(this.oProcessFlow1.updateModel.bind(this.oProcessFlow1));
        },

        onAfterRendering: function () {
            let PRItem = this.getModel("documentFlow").getProperty("/");
            this.loadProcessFlow(PRItem.PreqNo, PRItem.PreqItem);
            // this._onObjectMatched();
        },
        _onObjectMatched: function (o) {
            this.getModel("ui").setProperty("/busy", true);
            var PreqNo = o.getParameter("arguments").PreqNo;
            var PreqItem = o.getParameter("arguments").PreqItem;
            this.loadProcessFlow(PreqNo, PreqItem);
        },
        loadProcessFlow: function (PreqNo, PreqItem) {
            // route -- DocumentFlow/{PreqNo}/{PreqItem}

            var key = this.getModel().createKey("/PR_ItemSet", {
                PreqNo: PreqNo,
                PreqItem: PreqItem
            });

            var that = this;
            var onSuccess = function (d, r) {

                    var lanes = [{
                        id: "0",
                        icon: "sap-icon://cart",
                        label: "Requisitioning",
                        position: 0
                    }, {
                        id: "1",
                        icon: "sap-icon://order-status",
                        label: "Ordering",
                        position: 1
                    }, {
                        id: "2",
                        icon: "sap-icon://shipping-status",
                        label: "Confirmation",
                        position: 2
                    }, {
                        id: "3",
                        icon: "sap-icon://payment-approval",
                        label: "Invoicing",
                        position: 3
                    }];

                    var goods_receipts = d.to_GoodsReceiptSet.results,
                        invoices = d.to_invoices.results,
                        id = 0,
                        nodes = [],
                        po_children = [],
                        state, stateText;

                    invoices.forEach(function (e) {
                        id++;

                        if (e.Completed == true) {
                            state = sap.suite.ui.commons.ProcessFlowNodeState.Positive;
                            stateText = "Completed";
                        } else {
                            state = sap.suite.ui.commons.ProcessFlowNodeState.Neutral;
                            stateText = "In Progress";
                        }
                        var node = {
                            id: id.toString(),
                            lane: "3",
                            title: ["Supplier Invoice " + e.MatDoc + "/" + e.MatdocItm],
                            titleAbbreviation: e.MatDoc,
                            children: [],
                            state: state,
                            stateText: stateText,
                            focused: true,
                            texts: ["Posting Date   " + that.GetFormattedDate(e.PstngDate), "Gross Amount " + e.InvoiceValLoc]
                        };
                        nodes.push(node);
                        po_children.push(id.toString());
                    });

                    goods_receipts.forEach(function (e) {
                        id++;

                        if (e.Completed == true) {
                            state = sap.suite.ui.commons.ProcessFlowNodeState.Positive;
                            stateText = "Completed";
                        } else {
                            state = sap.suite.ui.commons.ProcessFlowNodeState.Neutral;
                            stateText = "In Progress";
                        }
                        var node = {
                            id: id.toString(),
                            lane: "2",
                            title: ["Goods Receipt  " + e.MatDoc + "/" + e.MatdocItm],
                            titleAbbreviation: e.MatDoc,
                            children: [],
                            state: state,
                            stateText: stateText,
                            focused: true,
                            texts: ["Posting Date " + that.GetFormattedDate(e.PstngDate), "Quantity " + d.Quantity]
                        };
                        nodes.push(node);
                        po_children.push(id.toString());
                    });

                    id++;
                    if (d.PO_Completed == true) {
                        state = sap.suite.ui.commons.ProcessFlowNodeState.Positive;
                        stateText = "Completed";
                    } else {
                        state = sap.suite.ui.commons.ProcessFlowNodeState.Neutral;
                        stateText = "In Progress";
                    }
                    var PO_node = {
                        id: id.toString(),
                        lane: "1",
                        title: ["Purchase Order " + d.PONumber + "/" + d.POItem],
                        titleAbbreviation: d.PONumber,
                        children: po_children,
                        state: state,
                        stateText: stateText,
                        focused: true,
                        texts: ["Supplier     " + d.POSupplier, "Created On   " + that.GetFormattedDate(d.POCreationDate)]
                    };
                    nodes.push(PO_node);
                    var PO_id = id;
                    id++;

                    if (d.PR_Completed == true) {
                        state = sap.suite.ui.commons.ProcessFlowNodeState.Positive;
                        stateText = "Completed";
                    } else {
                        state = sap.suite.ui.commons.ProcessFlowNodeState.Neutral;
                        stateText = "In Progress";
                    }
                    var PR_node = {
                        id: id.toString(),
                        lane: "0",
                        title: ["Purchase Requisition " + d.PreqNo + "/" + d.PreqItem],
                        titleAbbreviation: d.PreqNo,
                        children: [PO_id.toString()],
                        state: state,
                        stateText: stateText,
                        focused: true,
                        texts: ["Delivery Date " + that.GetFormattedDate(d.DelivDate), "Requested Quantity " + d.Quantity]
                    };
                    id++;
                    nodes.push(PR_node);

                    var pr_processflow = {
                        nodes: nodes,
                        lanes: lanes
                    };

                    var oModelPf1 = new sap.ui.model.json.JSONModel();
                    var viewPf1 = that.getView();
                    oModelPf1.setData(pr_processflow);
                    viewPf1.setModel(oModelPf1, "flow");
                    viewPf1.byId("processflow1").updateModel();
                    that.getModel("ui").setProperty("/busy", false);
                },
                onError = function (e) {
                    //console.log(e);
                    that.getModel("ui").setProperty("/busy", false);
                };

            var oDataModel = this.getModel();
            oDataModel.read(key, {
                urlParameters: {
                    "$expand": "to_GoodsReceiptSet,to_invoices"
                },
                //filters: filters,
                success: onSuccess,
                error: onError
            });

        },

        /**
         * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
         * (NOT before the first rendering! onInit() is used for that one!).
         * @memberOf com.tw.mypr.My_custom_pr.view.DocumentFlow
         */
        //	onBeforeRendering: function() {
        //
        //	},

        /**
         * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
         * This hook is the same one that SAPUI5 controls get after being rendered.
         * @memberOf com.tw.mypr.My_custom_pr.view.DocumentFlow
         */
        //	onAfterRendering: function() {
        //
        //	},

        /**
         * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
         * @memberOf com.tw.mypr.My_custom_pr.view.DocumentFlow
         */
        //	onExit: function() {
        //
        //	}

    });

});