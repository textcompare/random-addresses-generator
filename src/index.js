let houseNames, landmarkData, countryMap, addressData, regionName, countryName, dataContainer, searchResult;

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
            const dirName = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:)/, '$1'); // Normalize Windows path
            return await JSON.parse(fs.readFileSync(path.resolve(dirName, filePath), 'utf-8'));
        } else {
            return await fetch(new URL(filePath, basePath)).then(res => res.json());
        }
        //return JSON.parse(await fetch(filePath).then(res => res.text()));
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
    addressFormat: [`buildingNo`, `buildingName`, `streetNumber`, `streetName`, `neighborhood`, `landmark`, `city`, `state`, `zipCode`, `firstName`, `lastName`, `phone`, `email`, `country`],
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

async function searchCity(cityName) {
    if (!addressData || !addressData.citycontainers) {
        console.error("Error: addressData or citycontainers is undefined.");
        return false;
    }
    const containers = addressData.citycontainers;

    // Handle USA separately
    if (countryName === 'usa') {
        for (const state in addressData.states) {
            const regionData = await dataContainer.loadJSON(`../data/regions/usa/${addressData.states[state]}.json`);
            if (regionData?.cities?.[cityName]) {
                searchResult = { region: regionData.name, cityData: regionData.cities[cityName] };
                return true;
            }
        }
    }

    // General case for other countries
    for (const container of containers) {
        for (const regionName in addressData[container] || {}) {
            const region = addressData[container][regionName]; // Accessing the region object
            if (region.cities && region.cities[cityName]) {
                searchResult = { region: region.name, cityData: region.cities[cityName] };
                return true;
            }
        }
    }

    return false;
}


function convertToFormat(addresses, format, separator) {
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

// Function to generate addresses
async function generateAddress(count, info) {
    if (!count || typeof count !== 'number' || count <= 0) {
        return "Provide a valid count.";
    }

    const addresses = [];
    const country = info.country || infoObject.country;

    dataContainer = new DataContainer(country);
    await dataContainer.loadData();

    if (!addressData || !addressData.citycontainers) {
        console.error("Error: addressData or citycontainers is undefined.");
        return "Error: Unable to generate address due to missing data.";
    }

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

    const regionTypes = ['states', 'provinces', 'territories', 'municipalities', 'counties', 'regions', 'communities', 'governorates', 'prefectures', 'districts', 'emirates'];

    const validRegions = regionTypes
        .map(type => getValidRegions(addressData[type], type))
        .find(Boolean) || Object.keys(addressData[container]);


    // Generate the addresses
    for (let i = 0; i < count; i++) {
        const address = {};

        // Select a random region from validRegions if available, otherwise fallback to available keys
        const selectedRegion = validRegions?.length
            ? getRandomElement(validRegions)
            : getRandomElement(regionTypes.flatMap(type => Object.keys(addressData[type] || {})));

        // Get the region data from the first matching type
        let regionData = regionTypes.reduce((data, type) => data || addressData[type]?.[selectedRegion], null);

        // Select a random city from the selected region
        let cityData, cityName;


        countryName = normalizeCountryName(country);

        if (countryName == 'usa') {
            regionData = await dataContainer.loadJSON(`../data/regions/usa/${addressData.states[selectedRegion]}.json`);
            cityName = getRandomElement(regionData.cities); // Select a random city key
            cityData = regionData.cities[cityName]; // Access the city data
            regionName = regionData.name;
        }
        regionName = regionData.name;
        if (info.city && regionData.cities[info.city]) {
            cityData = regionData.cities[info.city];
            cityName = info.city;
            regionName = regionData.name;
        }
        else if (info.city && await searchCity(info.city)) {
            cityName = info.city;
            cityData = searchResult.cityData;
            regionName = searchResult.region;
        }
        else {
            const cityNames = Object.keys(regionData.cities); // Get all city names (keys)
            cityName = getRandomElement(cityNames); // Select a random city key
            cityData = regionData.cities[cityName]; // Access the city data
            regionName = regionData.name;
        }

        const { zipcodes, areacodes } = cityData;


        // Select a random zip code and area code
        const zipCode = getRandomElement(zipcodes);
        const areaCode = getRandomElement(areacodes);

        // Generate the phone number with area code
        const phoneNumber = generateRandomPhoneNumber(areaCode, addressData.countrycode, addressData.phoneformat);
        let generatedFirstName = "", generatedLastName = "";

        // Helper function to get a random element from an array safely
        const getRandomValue = (dataField, fallback = "N/A") =>
            addressData[dataField] ? getRandomElement(addressData[dataField]) : fallback;

        // Helper function to get neighborhood or house/building names based on address type
        const getTypeBasedValue = (dataCategory, addressType) => {
            const typeKey = addressType.toLowerCase();
            return getRandomElement(dataCategory[typeKey] || dataCategory["residential"]);
        };

        // Populate the address format fields
        addressFormat.forEach((field) => {
            let updatedField = field.toLowerCase();
            let dataField = updatedField + 's'; // Plural form for accessing datasets
            let addressT = info.addressType || "Residential";

            address['addressType'] = addressT;

            switch (updatedField) {
                case 'country':
                    address[field] = addressData.country || "N/A";
                    break;


                case 'firstname':
                    generatedFirstName ||= getRandomValue(dataField);
                    address[field] = generatedFirstName;
                    break;

                case 'lastname':
                    generatedLastName ||= getRandomValue(dataField);
                    address[field] = generatedLastName;
                    break;

                case 'email':
                    generatedFirstName ||= getRandomElement(addressData.firstnames);
                    generatedLastName ||= getRandomElement(addressData.lastnames);
                    address[field] = `${generatedFirstName.toLowerCase()}.${generatedLastName.toLowerCase()}@example.com`;
                    break;


                case 'state':
                case 'province':
                case 'territory':
                case 'municipality':
                case 'county':
                case 'region':
                case 'community':
                case 'governorate':
                case 'prefecture':
                case 'district':
                case 'emirate':
                    address[field] = regionName || selectedRegion;
                    break;

                case 'city':
                    address[field] = cityName;
                    break;

                case 'zipcode':
                    address[field] = zipCode;
                    break;

                case 'phone':
                case 'phoneno':
                    address[field] = phoneNumber;
                    break;

                case 'streetname':
                    address[field] = getRandomElement(addressData.streetnames[addressT.toLowerCase()]);
                    break;

                case 'neighborhood':
                    address[field] = getTypeBasedValue(addressData.neighborhoods, addressT);
                    break;

                case 'landmark':
                    address[field] = getTypeBasedValue(landmarkData, addressT);
                    break;

                case 'streetnumber':
                case 'housenumber':
                case 'streetno':
                case 'houseno':
                case 'buildingno':
                case 'buildingnumber':
                    address[field] = Math.floor(Math.random() * 9999) + 1;
                    break;

                case 'housename':
                case 'buildingname':
                case 'building':
                    address[field] = getTypeBasedValue(houseNames, addressT);
                    break;
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

    return convertToFormat(addresses, format, separator);
}

export const getAddress = async (count, info = infoObject) => {
    return await generateAddress(count, info);
};