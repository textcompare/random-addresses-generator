const fs = require('fs');  // Import fs module
const path = require('path'); // Import path module
const phoneFormats = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/phone.json'), 'utf8')); // Using path.resolve for cross-platform compatibility

// Default object
const infoObject = {
    country: "USA",
    states: ['all'],
    format: 'json',
    addressFormat: ['firstName', 'lastName', 'phone', 'streetNumber', 'streetName', 'city', 'state', 'zipCode'],
    separator: ','
};

// Helper function to get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

function generateRandomPhoneNumber(countryCode) {
    // Load phone formats from JSON file
    const countryKey = countryCode.toLowerCase();

    if (!phoneFormats[countryKey]) {
        throw new Error(`Unsupported country code: ${countryCode}`);
    }

    const { countryPrefix, format } = phoneFormats[countryKey];

    const randomDigit = () => Math.floor(Math.random() * 10);
    const randomStartDigit = () => Math.floor(Math.random() * 3) + 7;

    let isFirst = true;
    const phoneNumber = format.replace(/X/g, () => {
        if (isFirst) {
            isFirst = false;
            return randomStartDigit();
        }
        return randomDigit();
    });

    return `${countryPrefix} ${phoneNumber}`;
}

// Function to generate addresses
function generateAddress(count, info = infoObject) {
    if (!count || typeof count !== 'number' || count <= 0) {
        return "Provide a valid count.";
    }

    const addresses = [];
    const country = info.country || infoObject.country;
    const fileName = country.toLowerCase().trim().replaceAll(' ', '-');  // Normalize country name

    let addressData;
    let nameData;
    try {
        // Use path.resolve to handle file paths in a platform-independent way
        addressData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${fileName}.json`), 'utf-8'));
        nameData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/name.json'), 'utf-8'));
    } catch (error) {
        console.error(error);
        return "Invalid Country Name or data file not found.";
    }

    // Normalize the address format based on user input
    const addressFormat = info.addressFormat && info.addressFormat.includes('all')
        ? infoObject.addressFormat
        : (info.addressFormat || infoObject.addressFormat);

    // Generate the addresses
    for (let i = 0; i < count; i++) {
        const address = {};

        addressFormat.forEach((field) => {
            const dataField = field + 's';

            if (field === 'firstName' || field === 'lastName') {
                address[field] = getRandomElement(nameData[dataField]);
            } else if (addressData[dataField]) {
                address[field] = getRandomElement(addressData[dataField]);
            } else if (field === 'city') {
                address[field] = getRandomElement(addressData['cities']);
            } else if (field === 'phone' || field === 'phoneNo') {
                address[field] = generateRandomPhoneNumber(fileName);
            } else {
                address[field] = `N/A`;
            }
        });

        addresses.push(address);
    }

    // Format the output based on the requested format
    const format = info.format || infoObject.format;
    const separator = info.separator || infoObject.separator;

    switch (format.toLowerCase()) {
        case 'json':
            return JSON.stringify(addresses, null, 2);
        case 'csv':
            const headers = addressFormat.join(separator);
            const rows = addresses.map((addr) =>
                addressFormat.map((field) => addr[field] || "").join(separator)
            );
            return [headers, ...rows].join("\n");
        case 'text':
            return addresses
                .map((addr) => addressFormat.map((field) => addr[field] || "").join(", "))
                .join("\n");
        default:
            return "Unsupported format. Use 'json', 'csv', or 'text'.";
    }
}

module.exports = { generateAddress };