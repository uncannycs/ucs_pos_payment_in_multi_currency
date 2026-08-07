from odoo import models, api

class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def _payment_fields(self, order, ui_paymentline):
        payment_fields = super()._payment_fields(order, ui_paymentline)
        if ui_paymentline.get('foreign_currency_id'):
            payment_fields.update({
                'foreign_currency_id': ui_paymentline.get('foreign_currency_id'),
                'foreign_amount': ui_paymentline.get('foreign_amount') or 0.0,
            })
        return payment_fields
