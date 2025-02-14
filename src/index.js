let houseNames, landmarkData, countryMap, addressData;

class DataContainer {
    constructor(countryName) {
        this.countryName = countryName;
    }

    // Load fs and path dynamically in Node.js environment
    async loadJSON(filePath) {
        let fs = null;
        let path = null;

        // Get the directory of the current module 
        const basePath = new URL('.', import.meta.url).href;
        if (typeof window === 'undefined') {
            fs = (await import('fs')).default;
            path = (await import('path')).default;
        }

        if (fs && path) {
            return await JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, filePath), 'utf-8'));
        } else {
            return await fetch(new URL(filePath, basePath)).then(res => res.json());
        }
    }


    async loadData() {
        const fileName = normalizeCountryName(this.countryName);
        try {
            houseNames = await this.loadJSON('../data/common/houseNames.json');
            landmarkData = await this.loadJSON('../data/common/landmarks.json');
            countryMap = await this.loadJSON('../data/common/countryMap.json');
            addressData = await this.loadJSON(`../data/countries/${fileName}.json`);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }
}

// Default object
const infoObject = {
    country: "USA",
    addressType: 'Residential',
    addressFormat: [`buildingNo`, `buildingName`, `streetNumber`, `streetName`, `neighborhood`, `landmark`, `city`, `state`, `zipCode`, `firstName`, `lastName`, `phone`, `email`],
    format: 'json'
};

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
        areaCode = Math.floor(Math.random() * 900 + 100).toString(); // Random area code between 100 and 999
    } else {
        areaCode = areaCode.toString();
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
async function generateAddress(count, info) {
    if (!count || typeof count !== 'number' || count <= 0) {
        return "Provide a valid count.";
    }


    const addresses = [];
    const country = info.country || infoObject.country;

    const dataContainer = new DataContainer(country);
    await dataContainer.loadData();

    // Normalize the address format based on user input
    const addressFormat = info.addressFormat && info.addressFormat.includes('all')
        ? infoObject.addressFormat
        : (info.addressFormat || infoObject.addressFormat);


    const container = getRandomElement(addressData.citycontainers);

    const getValidRegions = (data, key) => {
        if (data && info[key] && Array.isArray(info[key]) && info[key].length > 0) {
            return info[key][0].toLowerCase() === 'all'
                ? Object.keys(data)
                : info[key].map(item => item);
        }
        return null;
    };

    const validRegions = getValidRegions(addressData.states, 'states') ||
        getValidRegions(addressData.provinces, 'provinces') ||
        getValidRegions(addressData.territories, 'territories') ||
        getValidRegions(addressData.regions, 'regions') ||
        getValidRegions(addressData.communities, 'communities') ||
        getValidRegions(addressData.municipalities, 'municipalities') ||
        Object.keys(addressData[container]);

    // Generate the addresses
    for (let i = 0; i < count; i++) {
        const address = {};

        // Select a random region (state, province, or territory)
        const selectedRegion = validRegions && validRegions.length > 0
            ? getRandomElement(validRegions)
            : getRandomElement(Object.keys(addressData.states || addressData.provinces || addressData.territories));

        const regionData = addressData.states?.[selectedRegion] ||
            addressData.provinces?.[selectedRegion] ||
            addressData.territories?.[selectedRegion] ||
            addressData.regions?.[selectedRegion] ||
            addressData.communities?.[selectedRegion] ||
            addressData.municipalities?.[selectedRegion];

        // Select a random city from the selected region
        let cityData, data;
        const countryName = normalizeCountryName(country);
        if (countryName == 'usa') {
            data = await dataContainer.loadJSON(`../data/regions/${countryName}/${addressData.states[selectedRegion]}.json`);
            cityData = getRandomElement(data.cities);
        } else {
            cityData = getRandomElement(regionData.cities);
        }
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
                    generatedFirstName = addressData[dataField] ? getRandomElement(addressData[dataField]) : `N/A`
                address[field] = generatedFirstName;
            } else if (updatedField === 'lastname') {
                if (!generatedLastName) generatedLastName = addressData[dataField] ? getRandomElement(addressData[dataField]) : `N/A`
                address[field] = generatedLastName;
            } else if (updatedField === 'email') {
                if (generatedFirstName == "") generatedFirstName = getRandomElement(addressData.firstnames);
                if (generatedLastName == "") generatedLastName = getRandomElement(addressData.lastnames);
                address[field] = `${generatedFirstName.toLowerCase()}.${generatedLastName.toLowerCase()}@example.com`;
            } else if (updatedField === 'state' || updatedField === 'province' || updatedField === 'territory') {
                if (countryName === 'usa') {
                    address['state'] = data.name;
                } else if (container === "states") {
                    address['state'] = regionData.name;
                } else if (container === "territories") {
                    address["territory"] = regionData.name;
                } else {
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

export const getAddress = async (count, info = infoObject) => {
    return await generateAddress(count, info);
}