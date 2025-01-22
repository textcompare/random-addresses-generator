const fs = require('fs');
const path = require('path');

// Default object
const infoObject = {
    country: "Indonesia",
    addressType: 'Residential',
    addressFormat: [`buildingNo`, `buildingName`, `streetNumber`, `streetName`, `neighborhood`, `landmark`, `city`, `state`, `zipCode`, `firstName`, `lastName`, `phone`, `email`],
    format: 'json'
};

// Get data of houseNames
const houseNames = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/common/houseNames.json`), 'utf-8'));
const landmarkData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/common/landmarks.json'), 'utf-8'));
const countryMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/common/countryMap.json'), 'utf-8'));

// Helper function to get a random element from an array
const getRandomElement = (array) => array ? array[Math.floor(Math.random() * array.length)] : 'N/A';


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

    let newLen = 10 - areaCode.length;
    let i;
    for (i = 0; i < phoneFormat.length; i++) {
        if (phoneFormat[i] == 'X') {
            newLen--;
            if (newLen <= 0) break;
        }
    }

    phoneFormat = phoneFormat.slice(0, i + 1);

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

    const container = getRandomElement(addressData.citycontainers);

    const validRegions = (() => {
        if (addressData.states && info.states && Array.isArray(info.states) && info.states.length > 0) {
            return info.states[0].toLowerCase() === 'all'
                ? Object.keys(addressData.states)
                : info.states.map(state => state.toUpperCase());
        }
        if (addressData.provinces && info.provinces && Array.isArray(info.provinces) && info.provinces.length > 0) {
            return info.provinces[0].toLowerCase() === 'all'
                ? Object.keys(addressData.provinces)
                : info.provinces.map(province => province);
        }
        if (addressData.territories && info.territories && Array.isArray(info.territories) && info.territories.length > 0) {
            return info.territories[0].toLowerCase() === 'all'
                ? Object.keys(addressData.territories)
                : info.territories.map(territory => territory);
        }
        if (addressData.regions && info.regions && Array.isArray(info.regions) && info.regions.length > 0) {
            return info.regions[0].toLowerCase() === 'all'
                ? Object.keys(addressData.regions)
                : info.region.map(region => region);
        }
        if (addressData.communities && info.communities && Array.isArray(info.communities) && info.communities.length > 0) {
            return info.communities[0].toLowerCase() === 'all'
                ? Object.keys(addressData.communities)
                : info.communities.map(community => community);
        }
        if (addressData.municipalities && info.municipalities && Array.isArray(info.municipalities) && info.municipalities.length > 0) {
            return info.municipalities[0].toLowerCase() === 'all'
                ? Object.keys(addressData.municipalities)
                : info.municipalities.map(municipality => municipality);
        }
        return Object.keys(addressData[container]);
    })();

    // Generate the addresses
    for (let i = 0; i < count; i++) {
        const address = {};

        // Select a random region (state, province, or territory)
        const selectedRegion = validRegions && validRegions.length > 0
            ? getRandomElement(validRegions)
            : getRandomElement(Object.keys(addressData.states || addressData.provinces || addressData.territories));

        let regionData;
        if (addressData.states && addressData.states[selectedRegion]) {
            regionData = addressData.states[selectedRegion];
        } else if (addressData.provinces && addressData.provinces[selectedRegion]) {
            regionData = addressData.provinces[selectedRegion];
        } else if (addressData.territories && addressData.territories[selectedRegion]) {
            regionData = addressData.territories[selectedRegion];
        }
        else if (addressData.regions && addressData.regions[selectedRegion]) {
            regionData = addressData.regions[selectedRegion];
        }
        else if (addressData.communities && addressData.communities[selectedRegion]) {
            regionData = addressData.communities[selectedRegion];
        }
        else if (addressData.municipalities && addressData.municipalities[selectedRegion]) {
            regionData = addressData.municipalities[selectedRegion];
        }

        // Select a random city from the selected region
        const cityData = getRandomElement(regionData.cities);
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
                if (container == "states") {
                    address['state'] = regionData.name;
                }
                else if (container == "territories") {
                    address["territory"] = regionData.name;
                }
                else {
                    address["province"] = regionData.name;
                }
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
                    address[field] = getRandomElement(addressData.neighborhoods.residential);
            } else if (updatedField === 'landmark') {
                if (addressT.toLowerCase() == "industrial")
                    address[field] = getRandomElement(landmarkData.industrial);
                else if (addressT.toLowerCase() == "corporate")
                    address[field] = getRandomElement(landmarkData.corporate);
                else
                    address[field] = getRandomElement(landmarkData.residential);
            } else if (updatedField === 'streetnumber' || updatedField === 'housenumber' || updatedField === 'streetno' || updatedField === 'houseno' || updatedField == "buildingno" || updatedField == "buildingNumber") {
                address[field] = Math.floor(Math.random() * 9999) + 1;
            } else if (updatedField === 'housename' || updatedField == 'buildingname' || updatedField == 'building') {
                if (addressT.toLowerCase() == "industrial")
                    address[field] = getRandomElement(houseNames.industrial);
                else if (addressT.toLowerCase() == "corporate")
                    address[field] = getRandomElement(houseNames.corporate);
                else
                    address[field] = getRandomElement(houseNames.residential);
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