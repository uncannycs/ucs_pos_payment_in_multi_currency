/** @odoo-module */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { PosPayment } from "@point_of_sale/app/models/pos_payment";
import { PosOrder } from "@point_of_sale/app/models/pos_order";
import { patch } from "@web/core/utils/patch";
import { MultiCurrencyPopup } from "@ucs_pos_payment_in_multi_currency/app/components/multi_currency_popup/multi_currency_popup";
import { makeAwaitable } from "@point_of_sale/app/utils/make_awaitable_dialog";
import { ClosePosPopup } from "@point_of_sale/app/components/popups/closing_popup/closing_popup";

if (!ClosePosPopup.props.includes("foreign_currency_totals")) {
    ClosePosPopup.props.push("foreign_currency_totals");
}

patch(PosOrder.prototype, {
    serializeForORM(opts = {}) {
        const data = super.serializeForORM(opts);
        if (data.payment_ids && data.payment_ids.length && this.payment_ids && this.payment_ids.length) {
            for (let i = 0; i < data.payment_ids.length; i++) {
                const cmd = data.payment_ids[i];
                if (cmd[0] === 0 || cmd[0] === 1) { // create or update
                    const paymentVals = cmd[2];
                    const paymentLine = this.payment_ids.find(p => p.uuid === paymentVals.uuid) || this.payment_ids[i];
                    if (paymentLine && paymentLine.foreign_currency_id) {
                        paymentVals.foreign_currency_id = paymentLine.foreign_currency_id.id || paymentLine.foreign_currency_id;
                        paymentVals.foreign_amount = paymentLine.foreign_amount;
                    }
                }
            }
        }
        return data;
    }
});

patch(PosPayment.prototype, {
    setup(_defaultObj, options) {
        super.setup(...arguments);
        this.foreign_currency_id = this.foreign_currency_id || false;
        this.foreign_amount = this.foreign_amount || 0.0;
        this.conversion_rate = this.conversion_rate || 1.0;
    },
    setAmount(value) {
        super.setAmount(...arguments);
        if (this.foreign_currency_id && this.conversion_rate) {
            this.foreign_amount = this.getAmount() * this.conversion_rate;
        }
    }
});


patch(PaymentScreen.prototype, {
    async onClickMultiCurrency() {
        const payload = await makeAwaitable(this.dialog, MultiCurrencyPopup, {
            title: "Multi Currency",
            currencies: this.pos.models['res.currency'].getAll(),
            baseCurrency: this.pos.currency,
            totalDue: this.currentOrder.remainingDue,
        });

        if (payload) {
            // Find a suitable payment method, e.g., the first cash one
            let paymentMethod = this.payment_methods_from_config.find(p => p.type === 'cash' || p.is_cash_count) || this.payment_methods_from_config[0];
            if (!paymentMethod) {
                return;
            }

            // Add the payment line with the default currency amount
            this.currentOrder.addPaymentline(paymentMethod);

            // Get the newly added payment line
            const paymentLine = this.currentOrder.getSelectedPaymentline();
            if (paymentLine) {
                paymentLine.foreign_currency_id = payload.currency;
                paymentLine.conversion_rate = paymentLine.getAmount() ? payload.convertedAmount / paymentLine.getAmount() : 1.0;
                paymentLine.foreign_amount = payload.convertedAmount;
                // Force a re-render
                this.render();
            }
        }
    }
});
