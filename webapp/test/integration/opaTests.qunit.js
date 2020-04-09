/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
    "use strict";

    sap.ui.require([
        "com/tw/mypr/My_custom_pr/test/integration/AllJourneys"
    ], function () {
        QUnit.start();
    });
});