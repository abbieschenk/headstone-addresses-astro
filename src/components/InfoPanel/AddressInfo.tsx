import type { Address } from 'src/types/addresses';

export interface AddressInfoProps {
    address: Address;
}

export default function AddressInfo({ address }: AddressInfoProps) {
    const { NameChinese, NameEnglish } = address;

    return (
        <div className="info-panel">
            <div className="info address">
                <div>
                    <strong>{NameChinese}</strong> {NameEnglish}
                </div>
            </div>
        </div>
    );
}
