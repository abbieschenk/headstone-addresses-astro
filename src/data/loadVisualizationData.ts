import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as d3 from 'd3';
import type { Headstone, HeadstoneRow } from 'src/types/headstones';
import type { Address, AddressRow } from 'src/types/addresses';
import type { AddressGraphProps } from 'src/components/AddressGraph';

const readCsv = async <T extends object>(relativePath: string): Promise<T[]> => {
    const filePath = fileURLToPath(new URL(relativePath, import.meta.url));
    const csvText = await readFile(filePath, 'utf-8');

    return d3.csvParse(csvText).map((row) => ({ ...row }) as T);
};

const normalizeValue = (value: string | undefined): string => value?.trim() ?? '';

const toNumber = (value: string): number => {
    const number = Number.parseInt(value, 10);

    return Number.isFinite(number) ? number : 0;
};

const getFiniteYears = (rows: Headstone[], key: 'BirthYear' | 'DeathYear') =>
    rows
        .map((row) => row[key]?.trim())
        .filter(Boolean)
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year));

export const loadVisualizationData = async (): Promise<AddressGraphProps> => {
    const [headstoneRows, addressRows] = await Promise.all([
        readCsv<HeadstoneRow>('../../public/data/headstones.csv'),
        readCsv<AddressRow>('../../public/data/addresses.csv'),
    ]);

    const addresses = addressRows.map<Address>((address) => ({
        ...address,
        NameEnglish: normalizeValue(address.NameEnglish),
        x: toNumber(address.LocX),
        y: toNumber(address.LocY),
    }));

    const addressMap = new Map(addresses.map((address) => [address.NameEnglish, address]));

    const maxLocX = Math.max(...headstoneRows.map((headstone) => toNumber(headstone.LocX)));
    const maxLocY = Math.max(...headstoneRows.map((headstone) => toNumber(headstone.LocY)));
    const maxLoc = Math.max(maxLocX, maxLocY);
    const yScale = d3.scaleLinear().domain([0, maxLoc]).range([maxLoc, 0]);
    const xScale = d3.scaleLinear().domain([0, maxLoc]).range([0, maxLoc]);

    const headstones = headstoneRows
        .map<Headstone | null>((headstone) => {
            const address = addressMap.get(headstone.City);

            if (!address) {
                return null;
            }

            let x = toNumber(headstone.LocX) * 5;
            let y = toNumber(headstone.LocY) * 5;

            if (headstone.CemeteryName === 'Beechmount') {
                x += 600;
                y += 400;
            } else if (headstone.CemeteryName === 'Mount Pleasant') {
                x += 400;
            } else if (headstone.CemeteryName === 'Edmonton') {
                y += 400;
            }

            return {
                ...headstone,
                address,
                x: xScale(x),
                y: yScale(y),

                City: normalizeValue(headstone.City),
                Town: normalizeValue(headstone.Town),
                Village: normalizeValue(headstone.Village),
                Neighbourhood: normalizeValue(headstone.Neighbourhood),
                BirthYear: normalizeValue(headstone.BirthYear),
                DeathYear: normalizeValue(headstone.DeathYear),
            };
        })
        .filter((headstone): headstone is Headstone => Boolean(headstone));

    const birthYears = getFiniteYears(headstones, 'BirthYear');
    const deathYears = getFiniteYears(headstones, 'DeathYear');

    const min = birthYears.length > 0 ? Math.min(...birthYears) : 0;
    const max = deathYears.length > 0 ? Math.max(...deathYears) : 0;

    return { addresses, dateRange: { min, max }, headstones };
};
