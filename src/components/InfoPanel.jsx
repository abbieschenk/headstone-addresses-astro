import '../styles/info-panel.css';

export default function InfoPanel({ headstone, address }) {
  if (headstone) {
    return (
      <div className="info-panel">
        <div className="info headstone">
          <div className="section">
            <div>
              <strong>{headstone.FullNameChinese}</strong> {headstone.FirstNameEnglish} {headstone.LastNameEnglish}
            </div>
            <div>
              {headstone.BirthYear}
              {headstone.BirthYear ? '–' : 'Buried '}
              {headstone.DeathYear}
            </div>
          </div>
          <div className="section">
            <div><strong>Address</strong></div>
            <div>{headstone.HeadstoneNotes}</div>
            <div>
              {headstone.Province && `${headstone.Province}, `}
              {headstone.City}
              {headstone.Town && `, ${headstone.Town}`}
              {headstone.Village && `, ${headstone.Village}`}
              {headstone.Neighbourhood && `, ${headstone.Neighbourhood}`}
            </div>
          </div>
          <div className="section">
            <div><strong>Cemetery</strong></div>
            <div>{headstone.CemeteryName} Cemetery</div>
            <div>{headstone.Section} {headstone.Block} {headstone.Plot}</div>
          </div>
          {headstone.Note ? (
            <div className="section">
              <i>{headstone.Note}</i>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (address) {
    return (
      <div className="info-panel">
        <div className="info address">
          <div>
            <strong>{address.NameChinese}</strong> {address.NameEnglish}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <div className="info empty">
        <div className="section">
          Chinese headstones often document ancestral hometown addresses. This visualization links headstones to their addresses.
        </div>
        <div className="section">
          Select a headstone on the right or hometown on the left to see their links. Zoom by scrolling and pan by dragging.
        </div>
        <div className="section">
          Drag the slider to filter by birth date and burial date. Headstones without birth dates will be hidden.
        </div>
        <div className="section">
          Best viewed on a larger screen. See <a href="/about">About</a> for more information.
        </div>
      </div>
    </div>
  );
}
