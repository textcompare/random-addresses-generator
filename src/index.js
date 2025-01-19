const fs = require('fs');
const path = require('path');

// Default object
const infoObject = {
    country: "United States",
    addressType: 'Residential',
    addressFormat: [`buildingNo`, `buildingName`, `streetNumber`, `streetName`, `neighborhood`, `landmark`, `city`, `state`, `zipCode`, `firstName`, `lastName`, `phone`, `email`],
    format: 'json',
    states: ['all'],
};

// Get data of houseNames
const houseNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/common/houseNames.json`), 'utf-8'));
const landmarkData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/common/landmarks.json'), 'utf-8'));
const countryMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/common/countryMap.json'), 'utf-8'));

// Helper function to get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];



// Normalize country name
function normalizeCountryName(countryName) {
    // Convert to lowercase and check the map
    const normalizedName = countryName.toLowerCase().trim();

    for (let key in countryMap) {
        if (countryMap[key].includes(normalizedName)) {
            return key;
        }
    }

    // If no match found, return as is
    return normalizedName;
}

// Helper function to generate random phone number
function generateRandomPhoneNumber(areaCode, countryCode, phoneFormat) {
    const randomDigit = () => Math.floor(Math.random() * 10);

    // If areaCode is not provided, generate a random area code
    if (!areaCode) {
        areaCode = Math.floor(Math.random() * 900 + 100); // Random area code between 100 and 999
    }

    let phoneNumber = phoneFormat.replace(/A/g, areaCode)
        .replace(/X/g, randomDigit);

    return countryCode + phoneNumber;
}


// Function to generate addresses
function generateAddress(count, info = infoObject) {
    if (!count || typeof count !== 'number' || count <= 0) {
        return "Provide a valid count.";
    }

    const addresses = [];
    const country = info.country || infoObject.country;
    let fileName = normalizeCountryName(country);

    let addressData;
    let nameData;
    try {
        // Use path.resolve to handle file paths in a platform-independent way
        addressData = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/countries/${fileName}.json`), 'utf-8'));
        nameData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/common/names.json'), 'utf-8'));
    } catch (error) {
        return "Invalid Country Name or data file not found.";
    }

    // Normalize the address format based on user input
    const addressFormat = info.addressFormat && info.addressFormat.includes('all')
        ? infoObject.addressFormat
        : (info.addressFormat || infoObject.addressFormat);

    const validStates = info.states && Array.isArray(info.states) && info.states.length > 0
        ? info.states[0].toLowerCase() === 'all' || info.states[0].toLowerCase() === 'all'
            ? Object.keys(addressData.states) // Pick a random state from all available states
            : info.states.map(state => state.toUpperCase()) // If specific states are provided, use them
        : Object.keys(addressData.states); // Default to picking any state if no states are provided


    // Generate the addresses
    for (let i = 0; i < count; i++) {
        const address = {};

        // Select a random state if 'all' or from specific states
        const selectedState = validStates && validStates.length > 0
            ? getRandomElement(validStates)
            : getRandomElement(Object.keys(addressData.states));

        // Select a random city from the selected state
        const cityData = getRandomElement(addressData.states[selectedState].cities);
        const { cityname, zipcodes, areacodes } = cityData;

        // Select a random zip code and area code
        const zipCode = getRandomElement(zipcodes);
        const areaCode = getRandomElement(areacodes);

        // Generate the phone number with area code
        const phoneNumber = generateRandomPhoneNumber(areaCode, addressData.countrycode, addressData.phoneformat);
        let generatedFirstName = "", generatedLastName = "";

        // Populate the address format fields
        addressFormat.forEach((field) => {
            let updatedField = field.toLowerCase();
            const dataField = updatedField + 's';
            let addressT = info.addressType || "Residential";
            address['addressType'] = addressT;
            if (updatedField === 'firstname') {
                if (!generatedFirstName)
                    generatedFirstName = nameData[dataField] ? getRandomElement(nameData[dataField]) : `N/A`
                address[field] = generatedFirstName;
            } else if (updatedField === 'lastname') {
                if (!generatedLastName) generatedLastName = nameData[dataField] ? getRandomElement(nameData[dataField]) : `N/A`
                address[field] = generatedLastName;
            } else if (updatedField === 'email') {
                if (generatedFirstName == "") generatedFirstName = getRandomElement(nameData.firstnames);
                if (generatedLastName == "") generatedLastName = getRandomElement(nameData.lastnames);
                address[field] = `${generatedFirstName.toLowerCase()}.${generatedLastName.toLowerCase()}@example.com`;
            } else if (updatedField === 'state') {
                address[field] = addressData.states[selectedState].state;
            } else if (updatedField === 'city') {
                address[field] = cityname;
            } else if (updatedField === 'zipcode') {
                address[field] = zipCode;
            } else if (updatedField === 'phone' || updatedField === 'phoneno') {
                address[field] = phoneNumber;
            } else if (updatedField === 'streetname') {
                address[field] = getRandomElement(addressData.streetnames);
            } else if (updatedField === 'neighborhood') {
                if (addressT.toLowerCase() == "industrial")
                    address[field] = getRandomElement(addressData.neighborhoods.industrial);
                else if (addressT.toLowerCase() == "corporate")
                    address[field] = getRandomElement(addressData.neighborhoods.corporate);
                else
                    address[field] = getRandomElement(addressData.neighborhoods.commerical);
            } else if (updatedField === 'landmark') {
                if (addressT.toLowerCase() == "industrial")
                    address[field] = getRandomElement(landmarkData.industrial);
                else if (addressT.toLowerCase() == "corporate")
                    address[field] = getRandomElement(landmarkData.corporate);
                else
                    address[field] = getRandomElement(landmarkData.commerical);
            } else if (updatedField === 'streetnumber' || updatedField === 'housenumber' || updatedField === 'streetno' || updatedField === 'houseno' || updatedField == "buildingno" || updatedField == "buildingNumber") {
                address[field] = Math.floor(Math.random() * 9999) + 1;
            } else if (updatedField === 'housename' || updatedField == 'buildingname' || updatedField == 'building') {
                if (addressT.toLowerCase() == "industrial")
                    address[field] = getRandomElement(houseNames.industrial);
                else if (addressT.toLowerCase() == "corporate")
                    address[field] = getRandomElement(houseNames.corporate);
                else
                    address[field] = getRandomElement(houseNames.commerical);
            }
            else {
                address[field] = `N/A`;
            }
        });
        if (info.addon) {
            for (let key in info.addon) {
                address[key] = info.addon[key];
            }
        }

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

console.log(generateAddress(1));

module.exports = { generateAddress };