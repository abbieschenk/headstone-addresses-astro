export interface AddressRow {
    NameEnglish: string;
    NameChinese: string;
    LocX: string;
    LocY: string;
    Color: string;
}

export interface Address extends AddressRow {
    x: number;
    y: number;
}
