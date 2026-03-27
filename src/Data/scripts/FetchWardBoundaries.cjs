// fetching and processing ward boundaries data for tower hamlets from ONSGeoJSON
// https://findthatpostcode.uk/#api
// Run with: node src/Data/scripts/FetchWardBoundaries.cjs

const fs = require('fs').promises;

const TowerHamletCode= 'E09000030';
const GEOJSON_URL = `https://findthatpostcode.uk/areas/${TowerHamletCode}/children/ward.geojson`;
const OutputFilePath = 'Tower_Hamlet_ward_boundaries.json';

const ActiveWards = ({ properties }) => properties.active === true && properties.code?.startsWith('E05009');
const SimplifyWards = ({features}) => features.filter(ActiveWards).map(({ properties, geometry }) => ({
    type: 'Feature',
    properties: {
        code: properties.code,
        name: properties.name,
    },
    geometry,
}));

const buildOutputData = (simplifiedData, fetchedAt = new Date().toISOString()) => ({
    type: 'FeatureCollection',
    metaData: {
        source: 'ONS GeoJSON via FindThatPostcode API',
        license: 'Open Government Licence v3.0',
        area: 'Tower Hamlets',
        areaCode: TowerHamletCode,
        fetchedAt,
        wardCount: simplifiedData.length,
    },
    features: simplifiedData,
});

async function fetchAndSaveWardBoundaries(fetchImpl = fetch, writeFileImpl = fs.writeFile) {
    const response = await fetchImpl(GEOJSON_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const geojsonData = await response.json();
    const simplifiedData = SimplifyWards(geojsonData);
    const outputData = buildOutputData(simplifiedData);

    await writeFileImpl(OutputFilePath, JSON.stringify(outputData, null, 2));

    return { outputData, simplifiedData };
}

async function main() {
    try {
        const { simplifiedData } = await fetchAndSaveWardBoundaries();
        console.log(`Ward boundaries saved to ${OutputFilePath}`);
        simplifiedData.sort((a, b) => a.properties.name.localeCompare(b.properties.name)).forEach(f => {
            console.log(` - ${f.properties.name} (${f.properties.code})`)
        });
    }catch (error) {
        console.error('Error fetching or processing data:', error);
        process.exit(1);
    }
}

module.exports = {
    ActiveWards,
    SimplifyWards,
    buildOutputData,
    fetchAndSaveWardBoundaries,
};

if (require.main === module) {
    main();
}
