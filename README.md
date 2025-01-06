
# Random Address Generator

A package to generate random addresses  based on country data. It allows users to generate realistic addresses for various countries with customizable formats.

## Installation

To install the package, use npm:

```bash
npm install random-addresses-generator
```

## Available Countries

You can generate addresses for the following countries:

- Argentina
- Australia
- Belgium
- Brazil
- Canada
- China
- Egypt
- France
- Germany
- Greece
- India
- Indonesia
- Italy
- Japan
- Mexico
- Netherlands
- New Zealand
- Nigeria
- Norway
- Poland
- Portugal
- Russia
- Saudi Arabia
- Singapore
- South Africa
- South Korea
- Spain
- Sweden
- Switzerland
- Thailand
- Turkey
- UAE
- UK
- USA
- Vietnam

## Parameters

The following parameters can be passed to the `generateAddress` function:

| Parameter        | Type     | Description                                                            | Default Value | Optional/Required |
|------------------|----------|------------------------------------------------------------------------|---------------|-------------------|
| `count`          | Number   | The number of random addresses to generate.                             | N/A           | Required          |
| `country`        | String   | The country for which to generate addresses (e.g., "USA", "India").     | USA           | Optional          |
| `states`         | Array    | List of states to include in address (e.g., ['California']).            | ['all']       | Optional          |
| `format`         | String   | The format in which to return the addresses (json, csv, text).          | json          | Optional          |
| `addressFormat`  | Array    | The order of fields to include in the address (e.g., `['firstName', 'city', 'phone']`). | ['firstName', 'lastName', 'phone', 'streetNumber', 'streetName', 'city', 'state', 'zipCode'] | Optional          |
| `separator`      | String   | The separator used in the CSV format.                                   | ','           | Optional          |

### How to Pass Parameters

To pass parameters to the `generateAddress` function, you can either pass them directly or use the default object `infoObject` which contains the default values.

### Example Usage

#### Generate Addresses in JSON Format

```javascript
const { generateAddress } = require('random-addresses-generator');

// Generate 5 random addresses for USA
const addresses = generateAddress(5, { country: 'USA' });
console.log(addresses);
```

#### Generate Addresses in CSV Format

```javascript
const { generateAddress } = require('random-addresses-generator');

// Generate 3 random addresses for India in CSV format
const addresses = generateAddress(3, { country: 'India', format: 'csv' });
console.log(addresses);
```

#### Generate Addresses with Custom Fields

```javascript
const { generateAddress } = require('random-addresses-generator');

// Generate 2 random addresses for France, only including firstName, lastName, and city
const addresses = generateAddress(2, { country: 'France', addressFormat: ['firstName', 'lastName', 'city'] });
console.log(addresses);
```

### File Formats

You can choose from the following formats for the generated addresses:

- **JSON Format** (`json`): Returns addresses in a well-structured JSON format.
- **CSV Format** (`csv`): Returns addresses in CSV format, with the option to specify a custom separator.
- **Text Format** (`text`): Returns addresses as comma-separated values.

Here’s an example of the output in different formats:

#### JSON Format:
```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "USA 555-1234",
    "streetNumber": "123",
    "streetName": "Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  ...
]
```

#### CSV Format:
```csv
firstName,lastName,phone,streetNumber,streetName,city,state,zipCode
John,Doe,USA 555-1234,123,Main St,New York,NY,10001
...
```

#### Text Format:
```
John, Doe, USA 555-1234, 123, Main St, New York, NY, 10001
...
```

## Example Output

Here is an example of how the package works:

```javascript
const { generateAddress } = require('random-addresses-generator');

// Example: Generate 3 random addresses for Brazil
const addresses = generateAddress(3, { country: 'Brazil', format: 'json' });
console.log(addresses);
```

Output:

```json
[
  {
    "firstName": "Carlos",
    "lastName": "Silva",
    "phone": "Brazil 55-9999-1234",
    "streetNumber": "567",
    "streetName": "Rua dos Andes",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "04523-000"
  },
  ...
]
```

## License

This package is open source and available under the MIT License.
