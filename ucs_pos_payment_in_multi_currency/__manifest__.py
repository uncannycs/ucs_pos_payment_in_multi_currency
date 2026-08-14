{
    "name": "POS Payment In Multi Currency | POS Multi Currency Payment | Point Of Sale Multi Currency | Multi Currency POS Payment | POS Foreign Currency Payment | Multi Currency Payment in POS",
    'summary': 'Accept payments in multiple currencies at POS',
    'version': '18.0.1.0.0',
    'category': 'Point of Sale',
    'website': 'https://uncannycs.com',
    'author': 'Uncanny Consulting Services LLP',
    'maintainers': 'Uncanny Consulting Services LLP',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config_views.xml',
        'views/report_saledetails.xml',
    ],
    'license': 'Other proprietary',
    'assets': {
        'point_of_sale._assets_pos': [
            'ucs_pos_payment_in_multi_currency/static/src/app/components/multi_currency_popup/multi_currency_popup.js',
            'ucs_pos_payment_in_multi_currency/static/src/app/components/multi_currency_popup/multi_currency_popup.xml',
            'ucs_pos_payment_in_multi_currency/static/src/js/payment_screen.js',
            'ucs_pos_payment_in_multi_currency/static/src/xml/payment_screen.xml',
            'ucs_pos_payment_in_multi_currency/static/src/xml/close_pos_popup.xml',
        ],
    },
    "images": ["static/description/banner.gif"],
    'installable': True,
    'application': True,
    'auto_install': False,
    "price": 100,
    "currency": "USD"
}
