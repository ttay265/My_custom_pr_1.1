sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label",
    "sap/m/Token"
], function (Controller, JSONModel, Label, Token) {
    "use strict";

    return Controller.extend("com.tw.mypr.My_custom_pr.controller.BaseController", {
        onInit: function () {

        },
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },
        setModel: function (m, n, s) {
            if (s) {
                return this.getOwnerComponent().setModel(m, n);
            } else {
                return this.getView().setModel(m, n);
            }
        },
        getViewProperty: function (sName) {
            if (sName) {
                return this.getView().getModel("ui").getProperty("/" + sName);
            } else {
                return this.getView().getModel("ui").getProperty("/");
            }
        },
        setViewProperty: function (sName, oValue) {
            this.getView().getModel("ui").setProperty("/" + sName, oValue);
        },
        getViewModel: function () {
            return this.getView().getModel("ui");
        },
        setViewModel: function (oModel) {
            this.getView().setModel(oModel, "ui");
        },
        getModel: function (m) {
            return this.getView().getModel(m) || this.getOwnerComponent().getModel(m);
        },
        getI18N: function (t) {
            return this.getView().getModel("i18n").getResourceBundle().getText(t);
        },
        GetFormattedDate: function (dat) {
            var date_format = new Date(dat);
            var month = date_format.getMonth() + 1;
            var day = date_format.getDate();
            var year = date_format.getFullYear();
            var format_date = day + "/" + month + "/" + year;
            return format_date;
        },

        createJSONObjectFromOData: function (sPath, oModel) {
            let model;
            //get ODATA model instance
            if (oModel) {
                model = this.getModel(oModel);
            } else {
                model = this.getModel();
            }
            if (model) {
                var d = model.createEntry(sPath).getObject();
                delete d.__metadata;
                return d;
            }
        },
        getVHColsModel: function () {
            return this.getModel("VHCols");
        },
        onValHelpReq: function (e) {
            //Initialize binding infos
            var that = this;
            let src = e.getSource();
            var binding = src.getBinding("value");
            let inputData = src.getCustomData();
            if (!inputData) {
                return;
            }
            this.aggregatedReturnProperties = [];
            var VHKey = inputData.find(function (e) {
                return e.getKey() === "VHKey";
            }).getValue();
            this.aggregatedReturnProperties.push({
                key: VHKey,
                binding: binding
            });
            inputData.forEach(function (e) {
                var addBinding = e.getBinding("value");
                if (addBinding) {
                    that.aggregatedReturnProperties.push({
                        key: e.getKey(),
                        binding: addBinding
                    });
                }
            });
            //Initialize VHD
            var VHData = this.getVHColsModel().getProperty("/" + VHKey);
            // if (!this._oValueHelpDialog) {
            this._oValueHelpDialog = sap.ui.xmlfragment("com.tw.mypr.My_custom_pr.fragment.ValueHelpDialog", this);
            // this._oValueHelpDialog = src.getDependents()[0];
            this.getView().addDependent(this._oValueHelpDialog);
            // }
            this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(new JSONModel(VHData), "columns");
                oTable.setBusy(true);
                oTable.setBusyIndicatorDelay(0);
                if (oTable.bindRows) {
                    oTable.unbindAggregation("rows");

                    oTable.bindAggregation("rows",
                        {
                            path: VHData.path,
                            events: {
                                dataReceived: function () {
                                    oTable.setBusy(false);
                                }
                            }
                        });
                }
                if (oTable.bindItems) {
                    oTable.unbindAggregation("items");
                    oTable.bindAggregation("items", {
                        path: VHData.path,
                        template: function () {
                            return new sap.m.ColumnListItem({
                                cells: VHData.cols.map(function (column) {
                                    return new Label({text: "{" + column.template + "}"});
                                })
                            });
                        },
                        events:
                            {
                                dataReceived: function () {
                                    oTable.setBusy(false);
                                }
                            }
                    });
                }
                this._oValueHelpDialog.update();
            }.bind(this));
            //Set current Binding Context
            // this.currentVHBinding = binding;
            // this.currentVHTextBinding = textBinding;
            this._oValueHelpDialog.setKey(VHKey);
            this._oValueHelpDialog.setTokens([new Token({
                key: binding.getValue()
            })]);
            this._oValueHelpDialog.open();
        },
        onValueHelpOkPress: function (oEvent) {
            //Get selected key & text
            var table = this._oValueHelpDialog.getTable();
            var a = table.getContextByIndex(table.getSelectedIndex()).getObject();
            delete a.__metadata;
            var b = Object.keys(a);
            this.aggregatedReturnProperties.forEach(function (e) {
                e.binding.setValue(a[e.key]);
                e.binding.refresh(true);
            });
//             let key = token.getKey();
//             let text = token.getText();
            //update to input binding
//             this.currentVHBinding.setValue(key);
//             this.currentVHBinding.getModel().refresh(true);
//             if (this.currentVHTextBinding) {
//                 this.currentVHTextBinding.setValue(text);
//                 this.currentVHTextBinding.getModel().refresh(true);
//             }

            this._oValueHelpDialog.close();
        },
        onValueHelpCancelPress: function (e) {
            this._oValueHelpDialog.close();
        },
        onDialogClose: function (e) {
            e.getSource().getParent().close();
        },

        back: function () {
            window.history.back();
        },
        onValueHelpAfterClose: function () {
            this._oValueHelpDialog.destroy();
        }
    });
});