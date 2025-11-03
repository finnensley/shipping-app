import easyship from '@api/easyship';

easyship.rates_request({
  destination_address: {country_alpha2: 'AD'},
  incoterms: 'DDU',
  insurance: {is_insured: false},
  courier_settings: {show_courier_logo_url: false, apply_shipping_rules: true},
  shipping_settings: {units: {weight: 'lb', dimensions: 'in'}},
  parcels: [
    {
      items: [
        {
          contains_battery_pi966: true,
          contains_battery_pi967: true,
          contains_liquids: true,
          origin_country_alpha2: 'AD',
          quantity: 1,
          declared_currency: 'AED'
        }
      ]
    }
  ]
})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));