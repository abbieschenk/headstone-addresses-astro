import type { Address } from './addresses';

export interface HeadstoneRow {
    CemeteryName: string;
    LastNameChinese: string;
    LastNameEnglish: string;
    FirstNameEnglish: string;
    BirthYear: string;
    DeathYear: string;
    Section: string;
    Block: string;
    Plot: string;
    Note: string;
    FullNameChinese: string;
    HeadstoneNotes: string;
    Province: string;
    City: string;
    Town: string;
    Village: string;
    Neighbourhood: string;
    LocX: string;
    LocY: string;
}

export interface Headstone extends HeadstoneRow {
    address: Address;
    x: number;
    y: number;
}
