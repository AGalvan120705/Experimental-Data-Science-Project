// fetching and processing ward boundaries data for tower hamlets from ONSGeoJSON
// https://findthatpostcode.uk/#api
// Run with: node src/Data/scripts/FetchWardBoundaries.cjs

const fs = require('fs').promises;
const { meta } = require('eslint-plugin-react-hooks');
const path = require('path');

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

(async () => {
    try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const geojsonData = await response.json();
        const simplifiedData = SimplifyWards(geojsonData);

        const outputData = {
            type: 'FeatureCollection',
            metaData: {
                source: 'ONS GeoJSON via FindThatPostcode API',
                license: 'Open Government Licence v3.0',
                area: 'Tower Hamlets',
                areaCode: TowerHamletCode,
                fetchedAt: new Date().toISOString(),
                wardCount: simplifiedData.length,
            },
            features: simplifiedData,
        };

        await fs.writeFile(OutputFilePath, JSON.stringify(outputData, null, 2));
        console.log(`Ward boundaries saved to ${OutputFilePath}`);
        simplifiedData.sort((a, b) => a.properties.name.localeCompare(b.properties.name)).forEach(f => {
            console.log(` - ${f.properties.name} (${f.properties.code})`)
        });
    }catch (error) {
        console.error('Error fetching or processing data:', error);
        process.exit(1);
    }
})();
