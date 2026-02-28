import type { Headstone } from 'src/types/headstones';

export interface HeadstoneInfoProps {
    headstone: Headstone;
}

export default function HeadstoneInfo({ headstone }: HeadstoneInfoProps) {
    const {
        BirthYear,
        Block,
        CemeteryName,
        City,
        DeathYear,
        FirstNameEnglish,
        FullNameChinese,
        HeadstoneNotes,
        LastNameEnglish,
        Neighbourhood,
        Note,
        Plot,
        Province,
        Section,
        Town,
        Village,
    } = headstone;

    return (
        <div className="info headstone">
            <div className="section">
                <div>
                    <strong>{FullNameChinese}</strong> {FirstNameEnglish} {LastNameEnglish}
                </div>
                <div>
                    {BirthYear}
                    {BirthYear ? '–' : 'Buried '}
                    {DeathYear}
                </div>
            </div>
            <div className="section">
                <div>
                    <strong>Address</strong>
                </div>
                <div>{HeadstoneNotes}</div>
                <div>
                    {Province && `${Province}, `}
                    {City}
                    {Town && `, ${Town}`}
                    {Village && `, ${Village}`}
                    {Neighbourhood && `, ${Neighbourhood}`}
                </div>
            </div>
            <div className="section">
                <div>
                    <strong>Cemetery</strong>
                </div>
                <div>{CemeteryName} Cemetery</div>
                <div>
                    {Section} {Block} {Plot}
                </div>
            </div>
            {Note && (
                <div className="section">
                    <i>{Note}</i>
                </div>
            )}
        </div>
    );
}
