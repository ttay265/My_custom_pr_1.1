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
        valueHelpOpen: function (sName, sPath, oModel) {
            var VHColModel = this.getModel("VHCols");
            if (!VHColModel) {
                VHColModel = new JSONModel("com.tw.mypr.My_custom_pr.model.ValueHelpColumns");
                this.setModel(VHColModel, "VHCols", true);
            }
            var VHData = VHColModel.getProperty("/" + sName);

            this._oValueHelpDialog = sap.ui.xmlfragment("com.tw.mypr.My_custom_pr.fragment.")
            this.getView().addDependent(this._oValueHelpDialog);
            this._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(VHColModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", VHData.path);
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", VHData.path, function () {
                        return new ColumnListItem({
                            cells: VHData.cols.map(function (column) {
                                return new Label({text: "{" + column.template + "}"});
                            })
                        });
                    });
                }
                this._oValueHelpDialog.update();
            }.bind(this));
            this.currentVHPath = sPath;
            this.currentVHModel = oModel;
            this._oValueHelpDialog.open();
        },
        onValueHelpOkPress: function (oEvent) {
            console.log(oEvent);
            // this.currentVHModel.setProperty(this.currentVHPath);
            this._oValueHelpDialog.close();
        },
        onValueHelpCancelPress: function () {
            this._oValueHelpDialog.close();
        },
        back: function() {
            window.history.back();
        },
        onValueHelpAfterClose: function () {
            this._oValueHelpDialog.destroy();
        }
    });
});