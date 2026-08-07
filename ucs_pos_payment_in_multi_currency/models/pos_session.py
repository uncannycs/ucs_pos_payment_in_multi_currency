from odoo import models, api

class PosSession(models.Model):
    _inherit = 'pos.session'

    def get_closing_control_data(self):
        data = super().get_closing_control_data()
        
        orders = self._get_closed_orders()
        payments = orders.payment_ids.filtered(lambda p: p.foreign_currency_id)
        
        foreign_currency_totals = {}
        for payment in payments:
            if payment.foreign_currency_id not in foreign_currency_totals:
                foreign_currency_totals[payment.foreign_currency_id] = {
                    'name': payment.foreign_currency_id.name,
                    'symbol': payment.foreign_currency_id.symbol or payment.foreign_currency_id.name,
                    'position': payment.foreign_currency_id.position,
                    'amount': 0.0
                }
            foreign_currency_totals[payment.foreign_currency_id]['amount'] += payment.foreign_amount

        data['foreign_currency_totals'] = list(foreign_currency_totals.values())
        return data
