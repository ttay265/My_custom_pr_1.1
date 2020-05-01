sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Label"
], function (Controller, JSONModel, Label) {
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
        getModel: function (m) {
            return this.getView().getModel(m) || this.getOwnerComponent().getModel(m);
        },
        getI18N: function (t) {
            return this.getView().getModel("i18n").getResourceBundle().getText(t);
        },
        getDeletePRConfirmMsg: function (n, d) {
            return this.getI18N("MSG_CONFIRM_DELETE_PR") + (n || "") + " " + (d || "") + "?";
        },
        createJSONObjectFromOData: function (sPath, oModel) {
            let model;
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
            let src = e.getSource();
            var binding = src.getBinding("value");
            let inputData = src.getCustomData();
            if (!inputData) {
                return;
            }
            var VHKey = inputData.find(function (e) {
                return e.getKey() === "VHKey";
            }).getValue();
            var text = inputData.find(function (e) {
                return e.getKey() === "text";
            });
            if (text) {
                var textBinding = text.getBinding("value");
            }


            //Initialize VHD
            var VHData = this.getVHColsModel().getProperty("/" + VHKey)
            // if (!this._oValueHelpDialog) {
            this._oValueHelpDialog = sap.ui.xmlfragment("com.tw.mypr.My_custom_pr.fragment.ValueHelpDialog", this);
            this.getView().addDependent(this._oValueHelpDialog);
            // }
            this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(new JSONModel(VHData), "columns");
                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", VHData.path);
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", VHData.path, function () {
                        return new sap.m.ColumnListItem({
                            cells: VHData.cols.map(function (column) {
                                return new Label({text: "{" + column.template + "}"});
                            })
                        });
                    });
                }
                this._oValueHelpDialog.update();
            }.bind(this));
            //Set current Binding Context
            this.currentVHBinding = binding;
            this.currentVHTextBinding = textBinding;
            this._oValueHelpDialog.open();
        },
        onValueHelpOkPress: function (oEvent) {
            let token = oEvent.getParameter("tokens")[0];
            let key = token.getKey();
            let text = token.getText();
            this.currentVHBinding.setValue(key);
            if (this.currentVHTextBinding) {
                this.currentVHTextBinding.setValue(text);
            }
            this._oValueHelpDialog.close();
        },
        onValueHelpCancelPress: function (e) {
            this._oValueHelpDialog.close();
        },

        back: function () {
            window.history.back();
        },
        onValueHelpAfterClose: function () {
            this._oValueHelpDialog.destroy();
        }
    });
});