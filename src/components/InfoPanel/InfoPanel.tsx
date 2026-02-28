import '../../styles/info-panel.css';

import HeadstoneInfo from './HeadstoneInfo';
import AddressInfo from './AddressInfo';
import DefaultInfo from './DefaultInfo';

import { isHeadstone, type Headstone } from 'src/types/headstones';
import type { Address } from 'src/types/addresses';

export interface InfoPanelProps {
    item?: Address | Headstone | null;
}

export default function InfoPanel({ item }: InfoPanelProps) {
    return (
        <div className="info-panel">
            {item ? (
                isHeadstone(item) ? (
                    <HeadstoneInfo headstone={item} />
                ) : (
                    <AddressInfo address={item} />
                )
            ) : (
                <DefaultInfo />
            )}
        </div>
    );
}
