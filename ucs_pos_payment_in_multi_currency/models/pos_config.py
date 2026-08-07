from odoo import api, fields, models

class PosConfig(models.Model):
    _inherit = 'pos.config'

    enable_multi_currency = fields.Boolean(string='Enable Multi Currency')
    multi_currency_ids = fields.Many2many(
        'res.currency',
        string='Accepted Currencies',
        help='Currencies that can be used for payments in this POS.'
    )


class ResCurrency(models.Model):
    _inherit = 'res.currency'

    @api.model
    def _load_pos_data_domain(self, data, config):
        domain = super()._load_pos_data_domain(data, config)
        if config.enable_multi_currency and config.multi_currency_ids:
            return ['|', ('id', 'in', config.multi_currency_ids.ids)] + domain
        return domain
