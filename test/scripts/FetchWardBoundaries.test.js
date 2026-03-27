import { createRequire } from 'module';
import { describe, it, expect, vi } from 'vitest';

const require = createRequire(import.meta.url);
const {
    ActiveWards,
    SimplifyWards,
    buildOutputData,
    fetchAndSaveWardBoundaries,
} = require('../../src/Data/scripts/FetchWardBoundaries.cjs');

describe('FetchWardBoundaries.cjs', () => {
    it('ActiveWards returns true only for active Tower Hamlets ward codes', () => {
        expect(ActiveWards({ properties: { active: true, code: 'E05009317' } })).toBe(true);
        expect(ActiveWards({ properties: { active: false, code: 'E05009317' } })).toBe(false);
        expect(ActiveWards({ properties: { active: true, code: 'E01000001' } })).toBe(false);
    });

    it('SimplifyWards filters and maps to minimal feature shape', () => {
        const geojson = {
            features: [
                {
                    properties: { active: true, code: 'E05009317', name: 'Ward A' },
                    geometry: { type: 'Polygon', coordinates: [] },
                },
                {
                    properties: { active: false, code: 'E05009318', name: 'Ward B' },
                    geometry: { type: 'Polygon', coordinates: [] },
                },
            ],
        };

        const out = SimplifyWards(geojson);

        expect(out).toHaveLength(1);
        expect(out[0]).toEqual({
            type: 'Feature',
            properties: { code: 'E05009317', name: 'Ward A' },
            geometry: { type: 'Polygon', coordinates: [] },
        });
    });

    it('buildOutputData sets wardCount and metadata', () => {
        const features = [{ type: 'Feature', properties: { code: 'E05009317', name: 'Ward A' }, geometry: {} }];
        const out = buildOutputData(features, '2026-03-27T00:00:00.000Z');

        expect(out.type).toBe('FeatureCollection');
        expect(out.metaData.areaCode).toBe('E09000030');
        expect(out.metaData.wardCount).toBe(1);
        expect(out.features).toHaveLength(1);
    });

    it('fetchAndSaveWardBoundaries writes processed JSON', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                features: [
                    {
                        properties: { active: true, code: 'E05009317', name: 'Ward A' },
                        geometry: { type: 'Polygon', coordinates: [] },
                    },
                ],
            }),
        });

        const writeFileMock = vi.fn().mockResolvedValue(undefined);

        const { outputData, simplifiedData } = await fetchAndSaveWardBoundaries(fetchMock, writeFileMock);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(writeFileMock).toHaveBeenCalledTimes(1);
        expect(simplifiedData).toHaveLength(1);
        expect(outputData.metaData.wardCount).toBe(1);
    });
});
