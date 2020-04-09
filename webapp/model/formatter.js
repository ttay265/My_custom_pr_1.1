sap.ui.define(["sap/ui/core/format/DateFormat"], function () {
    "use strict";
    return {
        date: function (v) {
            if (v) {
                var Y = v.substr(0, 4);
                var M = v.substr(4, 2);
                var d = v.substr(6, 2);
                return d + "." + M + "." + Y;
            } else {
                return v;
            }
        },
        formatCurrency: function (v, a) {
            var n = sap.ui.core.format.NumberFormat.getCurrencyInstance();
            return n.format(v);
        }
    };
});
