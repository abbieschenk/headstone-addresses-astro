import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as d3 from 'd3';

const readCsv = async (relativePath: string) => {
    const filePath = fileURLToPath(new URL(relativePath, import.meta.url));
    const csvText = await readFile(filePath, 'utf-8');

    return d3.csvParse(csvText).map((row) => ({ ...row }));
};

export const loadVisualizationData = async () => {
    const [headstones, addresses] = await Promise.all([
        readCsv('../../public/data/headstones.csv'),
        readCsv('../../public/data/addresses.csv'),
    ]);

    return { headstones, addresses };
};
