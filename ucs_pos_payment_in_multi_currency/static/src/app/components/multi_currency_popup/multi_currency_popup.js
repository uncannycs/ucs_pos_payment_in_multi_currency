/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";

export class MultiCurrencyPopup extends AbstractAwaitablePopup {
    static template = "ucs_pos_payment_in_multi_currency.MultiCurrencyPopup";

    static defaultProps = {
        title: _t("Multi Currency"),
        currencies: [],
        totalDue: 0,
    };

    setup() {
        this.pos = useService("pos");
        this.state = useState({
            selectedCurrencyId: this.props.currencies.length ? this.props.currencies[0].id : this.props.baseCurrency.id,
        });
    }

    get selectedCurrency() {
        return this.props.currencies.find((c) => c.id === parseInt(this.state.selectedCurrencyId)) || this.props.baseCurrency;
    }

    get conversionRate() {
        const sc = this.selectedCurrency;
        const bc = this.props.baseCurrency;
        return sc.rate / bc.rate;
    }

    get convertedAmount() {
        return this.props.totalDue * this.conversionRate;
    }

    onCurrencyChange(ev) {
        this.state.selectedCurrencyId = ev.target.value;
    }

    getPayload() {
        return {
            currency: this.selectedCurrency,
            rate: this.conversionRate,
            convertedAmount: this.convertedAmount,
        };
    }
}
