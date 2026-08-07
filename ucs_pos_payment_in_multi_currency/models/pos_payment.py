from odoo import fields, models

class PosPayment(models.Model):
    _inherit = 'pos.payment'

    foreign_amount = fields.Float(string='Amount in Foreign Currency', help="Amount paid in foreign currency")
    foreign_currency_id = fields.Many2one('res.currency', string='Foreign Currency', help="Foreign Currency of the payment")
