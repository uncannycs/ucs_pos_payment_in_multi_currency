from odoo import models, api

class ReportSaleDetails(models.AbstractModel):
    _inherit = 'report.point_of_sale.report_saledetails'

    @api.model
    def get_sale_details(self, date_start=False, date_stop=False, config_ids=False, session_ids=False, **kwargs):
        data = super().get_sale_details(date_start, date_stop, config_ids, session_ids, **kwargs)
        
        # Calculate foreign currency totals based on the orders fetched by super
        domain = [('state', 'in', ['paid', 'invoiced', 'done'])]
        if session_ids:
            domain.append(('session_id', 'in', session_ids))
        elif config_ids:
            domain.append(('config_id', 'in', config_ids))
        
        if date_start:
            domain.append(('date_order', '>=', date_start))
        if date_stop:
            domain.append(('date_order', '<=', date_stop))
            
        orders = self.env['pos.order'].search(domain)
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
