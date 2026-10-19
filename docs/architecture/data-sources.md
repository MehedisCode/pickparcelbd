# Bundled location names

The old profile form loads `https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json` at runtime. The replacement bundles the factual district/upazila names from that same dataset in `frontend/src/data/locations.json` (retrieved 18 October 2026). Coordinates, unions, city boundaries and executable scripts were not copied. This avoids making profile completion depend on an external runtime request.

The bundle contains 64 district entries. Existing stored district/upazila values remain selectable when editing a profile, including legacy spelling variations. Delivery staff and administrators must review district changes because district strings determine routing and authorization. GPS updates save coordinates separately; they do not silently change address or district.

The original terms are carried over from the supplied `terms-and-conditions.php`. The favicon and APK are copied unchanged from the supplied old directory. Demo product illustrations are local SVG drawings and the development accounts are fictional.

CI action syntax was checked against the maintainers' documentation: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), and [setup-php](https://github.com/shivammathur/setup-php). CI runs only after the project is placed in a GitHub repository; it is not configured on the live cPanel account.
