import '../styles/time-slider.css';

export default function TimeSlider({ min, max, start, end, onStartChange, onEndChange, className = '' }) {
    const span = Math.max(max - min, 1);
    const minPercent = ((start - min) / span) * 100;
    const maxPercent = ((end - min) / span) * 100;

    return (
        <div className={`timeslider ${className}`.trim()}>
            <input
                type="range"
                min={min}
                max={max}
                value={start}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), end - 1);
                    onStartChange?.(value);
                }}
                className="thumb thumb--left"
                style={{ zIndex: 5 }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={end}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), start + 1);
                    onEndChange?.(value);
                }}
                className="thumb thumb--right"
            />
            <div className="slider">
                <div className="slider__track" />
                <div
                    className="slider__range"
                    style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                />
                <div className="slider__values">
                    <div className="slider__left-value">Year of Birth {start}</div>
                    <div className="slider__right-value">Year of Death {end}</div>
                </div>
            </div>
        </div>
    );
}
