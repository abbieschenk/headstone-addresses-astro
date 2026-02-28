export default function DefaultInfo() {
    return (
        <div className="info empty">
            <div className="section">
                Chinese headstones often document ancestral hometown addresses. This visualization links headstones to
                their addresses.
            </div>
            <div className="section">
                Select a headstone on the right or hometown on the left to see their links. Zoom by scrolling and pan by
                dragging.
            </div>
            <div className="section">
                Drag the slider to filter by birth date and burial date. Headstones without birth dates will be hidden.
            </div>
            <div className="section">
                Best viewed on a larger screen. See <a href="/about">About</a> for more information.
            </div>
        </div>
    );
}
