/** @odoo-module */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { Order, Payment } from "@point_of_sale/app/store/models";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { MultiCurrencyPopup } from "@ucs_pos_payment_in_multi_currency/app/components/multi_currency_popup/multi_currency_popup";

import { ClosePosPopup } from "@point_of_sale/app/navbar/closing_popup/closing_popup";

if (!ClosePosPopup.props.includes("foreign_currency_totals")) {
    ClosePosPopup.props.push("foreign_currency_totals");
}

patch(PosStore.prototype, {
    async _processData(loadedData) {
        await super._processData(...arguments);
        this.all_currencies = loadedData["all_currencies"] || [];
    }
});

patch(Payment.prototype, {
    setup(_defaultObj, options) {
        super.setup(...arguments);
        this.foreign_currency_id = this.foreign_currency_id || false;
        this.foreign_amount = this.foreign_amount || 0.0;
        this.conversion_rate = this.conversion_rate || 1.0;
    },
    set_amount(value) {
        super.set_amount(...arguments);
        if (this.foreign_currency_id && this.conversion_rate) {
            this.foreign_amount = this.get_amount() * this.conversion_rate;
        }
    },
    export_for_printing() {
        const res = super.export_for_printing(...arguments);
        if (this.foreign_currency_id) {
            res.foreign_currency_id = this.foreign_currency_id;
            res.foreign_amount = this.foreign_amount;
        }
        return res;
    },
    export_as_JSON() {
        const res = super.export_as_JSON(...arguments);
        if (this.foreign_currency_id) {
            res.foreign_currency_id = this.foreign_currency_id.id || this.foreign_currency_id;
            res.foreign_amount = this.foreign_amount;
        }
        return res;
    }
});


patch(PaymentScreen.prototype, {
    async onClickMultiCurrency() {
        const { confirmed, payload } = await this.popup.add(MultiCurrencyPopup, {
            title: "Multi Currency",
            currencies: this.pos.all_currencies,
            baseCurrency: this.pos.currency,
            totalDue: this.currentOrder.get_due(),
        });

        if (confirmed && payload) {
            // Find a suitable payment method, e.g., the first cash one
            let paymentMethod = this.payment_methods_from_config.find(p => p.type === 'cash' || p.is_cash_count) || this.payment_methods_from_config[0];
            if (!paymentMethod) {
                return;
            }

            // Add the payment line with the default currency amount
            this.currentOrder.add_paymentline(paymentMethod);

            // Get the newly added payment line
            const paymentLine = this.currentOrder.selected_paymentline;
            if (paymentLine) {
                paymentLine.foreign_currency_id = payload.currency;
                paymentLine.conversion_rate = paymentLine.get_amount() ? payload.convertedAmount / paymentLine.get_amount() : 1.0;
                paymentLine.foreign_amount = payload.convertedAmount;
                // Force a re-render
                this.render();
            }
        }
    }
});
