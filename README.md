
# Random Address Generator


**Here is the [demo](https://addressgenerator.io/) of the npm.**
**https://addressgenerator.io/**


## Overview

The **Random Address Generator** package generates realistic random addresses based on country data, with customizable formats and additional fields. The package supports generating random addresses for various countries, and allows you to control various aspects of the address, such as the country, address type, and format.

## Installation

To install the package, use npm:

```bash
npm install random-addresses-generator
```
**CDN:**
```html
<script type="module">
        import { getAddress } from 'https://cdn.jsdelivr.net/npm/random-addresses-generator@1.1.2/src/index.js'; 
        console.log(await getAddress(1));
    </script>
```

## Fields Generated

The address generator can generate the following fields:

1. **buildingNo**: The building number or house number (e.g., 123, 456).
2. **buildingName**: The name of the building (e.g., "Sunset Tower").
3. **streetNumber**: The street number (e.g., 12).
4. **streetName**: The name of the street (e.g., "Main St", "Elm Street").
5. **neighborhood**: The neighborhood or area (e.g., "Downtown", "Suburbs").
6. **landmark**: A nearby landmark or notable feature (e.g., "Near Central Park").
7. **city**: The city name (e.g., "New York", "Los Angeles").
8. **state**: The state or region name (e.g., "California", "Texas").
9. **zipCode**: The postal or zip code (e.g., "10001", "90210").
10. **firstName**: The first name of a random person (e.g., "John", "Maria").
11. **lastName**: The last name of a random person (e.g., "Doe", "Smith").
12. **phone**: A randomly generated phone number (e.g., "+1 (555) 123-4567").
13. **email**: A randomly generated email address (e.g., "john.doe@example.com").

### Address Type

- **Resedential**: Residential addresses (default).
- **Corporate**: Corporate addresses such as company headquarters.
- **Industrial**: Industrial addresses like factories, warehouses.

**Example:**

```js
{
  addressType : "Resedential"
}
```
### Addon Fields

You can add custom fields to your address data by using the `addon` property. This property allows you to inject additional data into the generated address.

**Example:**

```js
{
  addon: [{
    note: "This is a special note"
  }]
}
```

This will append a `note` field to each generated address.

### State Selection

You can control which states to generate addresses from by passing an array of state codes. If you don't specify any states, the generator will select from all available states by default.

**Example:**

```js
{
  states: ["CA", "MN"] // Generates addresses from California and Minnesota only
}
```

### Country Selection

You can specify the country to generate addresses from. The default country is the United States (`USA`).

**Example:**

```js
{
  country: "Canada" // Generates addresses from Canada
}
```

### Address Format

You can specify the format of the generated address using the `addressFormat` property, which defines the order of the fields. By default, the address format is:

```js
['buildingNo', 'buildingName', 'streetNumber', 'streetName', 'neighborhood', 'landmark', 'city', 'state', 'zipCode', 'firstName', 'lastName', 'phone', 'email']
```

You can customize the format by passing an array of field names.

**Example:**

```js
{
  addressFormat: ['firstName', 'lastName', 'city', 'state', 'zipCode']
}
```

## Function Usage

### `getAddress(count, info)`

Generates a specified number of random addresses with the given configuration.

#### Parameters:

- **count**: The number of addresses to generate.
- **info** (optional): A configuration object with the following optional properties:
  - `country`: The country to generate addresses for (default is "United States").
  - `addressType`: The type of address to generate (options: "Resedential", "Corporate", "Industrial", default is "Resedential").
  - `states`: An array of state codes (e.g., `["CA", "MN"]`), default is `["all"]`, which generates from all states.
  - `addressFormat`: A custom format for the address (default is `['buildingNo', 'buildingName', 'streetNumber', 'streetName', 'neighborhood', 'landmark', 'city', 'state', 'zipCode', 'firstName', 'lastName', 'phone', 'email']`).
  - `addon`: Custom fields to be added to each address.
  - `format`: The format of the output (options: "json", "csv", "text", default is "json").

#### Example Usage:

1. **Generate 5 Commercial Addresses from the United States:**

```js
import { getAddress } from('random-addresses-generator');

const addressData = getAddress(5, {
  country: 'USA', 
  addressType: 'Resedential', 
  format: 'json'
});

console.log(addressData);
```

2. **Generate 3 addresses from specific states (California and Minnesota):**

```js
import { getAddress } from "random-addresses-generator";

const addressData = getAddress(3, {
  country: 'USA', 
  states: ['CA', 'MN'],
  addressFormat: ['firstName', 'lastName', 'streetName', 'city', 'state', 'zipCode'],
  format: 'json'
});

console.log(addressData);
```

3. **Generate 2 addresses with custom addon field:**

```js
import { getAddress } from "random-addresses-generator";

const addressData = getAddress(2, {
  country: 'Canada',
  addressType: 'Corporate',
  addon: [{
    note: "This is a custom note"
  }],
  format: 'json'
});

console.log(addressData);
```

### Supported Countries

The package supports generating random addresses for the following countries:

#### Available Countries:

- **United States (USA)**
- **Canada**
- **Germany**
- **Argentina**
- **Australia**
- **Belgium**
- **Brazil**
- **Canada**
- **China**
- **Egypt**
- **France**
- **Germany**
- **Greece**
- **India**
- **Indonesia**
- **United Kingdom**
- **Mexico**
- **Japan**
- **Netherlands**
- **New Zealand**
- **Nigeria**
- **Norway**
- **Poland**
- **Portugal**
- **Russia**
- **Saudi Arabia**
- **Singapore**
- **South Africa**
- **South Korea**
- **Spain**
- **Sweden**
- **Switzerland**
- **Thailand**
- **Turkey**
- **UAE**
- **Vietnam**



## What Makes Us Different?

The Random Address Generator stands out by ensuring that the generated addresses are not only random but also relevant and realistic. Each address component, such as the city, zip code, and street name, is carefully matched to ensure consistency and accuracy. This means that the zip code corresponds to the correct city, and the street names are appropriate for the selected country and region. Our generator provides high-quality, believable addresses that can be used for testing, development, and other purposes where realistic data is crucial.