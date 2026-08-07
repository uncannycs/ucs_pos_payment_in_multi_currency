from odoo import fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_enable_multi_currency = fields.Boolean(
        related='pos_config_id.enable_multi_currency', 
        readonly=False, 
        string='Enable Multi Currency'
    )
    pos_multi_currency_ids = fields.Many2many(
        related='pos_config_id.multi_currency_ids', 
        readonly=False, 
        string='Accepted Currencies'
    )
