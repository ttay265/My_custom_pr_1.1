sap.ui.define([
    "sap/ui/core/util/MockServer"
], function (MockServer) {
    "use strict";
    return {
        init: function () {
            // create
            var oMockServer = new MockServer({
                rootUri: "/destinations/northwind/V2/Northwind/Northwind.svc/"
            });
            var oUriParameters = jQuery.sap.getUriParameters();
            // configure
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: oUriParameters.get("serverDelay") || 1000
            });
            // simulate
            var sPath = jQuery.sap.getModulePath("com.tw.mypr.My_custom_pr.localService");
            oMockServer.simulate(sPath + "/metadata.xml", sPath + "/mockData");
            // start
            oMockServer.start();
        }
    };
});