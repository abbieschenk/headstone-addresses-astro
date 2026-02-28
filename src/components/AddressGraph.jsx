import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import InfoPanel from './InfoPanel';
import TimeSlider from './TimeSlider';
import '../styles/address-graph.css';

const HEIGHT = 250;
const WIDTH = 500;

const generatePathData = (origin, target, transform) => {
    const left = 0;
    const right = 1;
    const dirVal = origin.AddressObj ? left : right;

    const targetX =
        target.x * (dirVal === right && transform?.k ? transform.k : 1) +
        (dirVal === right && transform?.x ? transform.x : 0);
    const targetY =
        target.y * (dirVal === right && transform?.k ? transform.k : 1) +
        (dirVal === right && transform?.y ? transform.y : 0);
    const originX =
        origin.x * (dirVal === left && transform?.k ? transform.k : 1) +
        (dirVal === left && transform?.x ? transform.x : 0);
    const originY =
        origin.y * (dirVal === left && transform?.k ? transform.k : 1) +
        (dirVal === left && transform?.y ? transform.y : 0);

    const dx = targetX - originX;
    const dy = targetY - originY;
    const dr = Math.sqrt(dx * dx + dy * dy);

    return `M${originX},${originY}A${dr},${dr} 0 0,${dirVal} ${targetX},${targetY}`;
};

const toNumber = (value) => {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : 0;
};

const getFiniteYears = (rows, key) =>
    rows
        .map((row) => row[key]?.trim())
        .filter(Boolean)
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year));

export default function AddressGraph({ headstones = [], addresses = [] }) {
    const [timeFilterEnabled, setTimeFilterEnabled] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [selected, setSelected] = useState({});

    const d3ref = useRef(null);
    const timeToggle = useRef(null);

    const yearDomain = useMemo(() => {
        const birthYears = getFiniteYears(headstones, 'BirthYear');
        const deathYears = getFiniteYears(headstones, 'DeathYear');

        if (!birthYears.length || !deathYears.length) {
            return { min: 0, max: 0 };
        }

        return {
            min: Math.min(...birthYears),
            max: Math.max(...deathYears),
        };
    }, [headstones]);
    const [selectedRange, setSelectedRange] = useState(() => yearDomain);
    const hasRenderableData =
        headstones.length > 0 && addresses.length > 0 && yearDomain.min !== 0 && yearDomain.max !== 0;

    const isInDateRange = useCallback(
        (headstone) =>
            !timeFilterEnabled ||
            (Number(headstone.BirthYear) >= selectedRange.min && Number(headstone.DeathYear) <= selectedRange.max),
        [selectedRange.max, selectedRange.min, timeFilterEnabled]
    );

    const drawPath = useCallback((path) => {
        if (path.attr('opacity') === '0') {
            const totalLength = path.node().getTotalLength();

            path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                .attr('stroke-dashoffset', totalLength)
                .attr('opacity', 1)
                .transition()
                .duration(300)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        }
    }, []);

    const graphData = useMemo(() => {
        if (!headstones.length || !addresses.length) {
            return { plottedHeadstones: [], plottedAddresses: [] };
        }

        const plottedAddresses = addresses.map((address) => ({
            ...address,
            x: toNumber(address.LocX),
            y: toNumber(address.LocY),
        }));
        const addressMap = new Map(plottedAddresses.map((address) => [address.NameEnglish, address]));
        const maxLocX = Math.max(...headstones.map((headstone) => toNumber(headstone.LocX)));
        const maxLocY = Math.max(...headstones.map((headstone) => toNumber(headstone.LocY)));
        const max = Math.max(maxLocX, maxLocY);
        const yScale = d3.scaleLinear().domain([0, max]).range([max, 0]);
        const xScale = d3.scaleLinear().domain([0, max]).range([0, max]);

        const plottedHeadstones = headstones
            .map((headstone) => {
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
                    AddressObj: address,
                    x: xScale(x),
                    y: yScale(y),
                };
            })
            .filter(Boolean);

        return { plottedHeadstones, plottedAddresses };
    }, [addresses, headstones]);

    useEffect(() => {
        const svg = d3.select(d3ref.current);
        svg.selectAll('*').remove();

        svg.append('rect')
            .attr('class', 'background')
            .on('click', () => setSelected({}));
    }, []);

    useEffect(() => {
        if (!graphData.plottedHeadstones.length || !graphData.plottedAddresses.length) {
            return;
        }

        const svg = d3.select(d3ref.current);
        svg.selectAll('.address,.headstone,.connection,.china,.edmonton').remove();

        svg.append('path')
            .attr('class', 'edmonton cemetery mount-pleasant')
            .attr('d', 'M687.741,489.144l0,305.885l-142.15,0l-55.003,-100.127l171.653,-205.758l25.5,0Z');

        svg.append('path')
            .attr('class', 'edmonton cemetery edmonton-cemetery')
            .attr(
                'd',
                'M220.976,389.48l-153.841,-0l-1.642,-261.584l244.84,0l0,105.364l-68.718,0l-22.281,15.377l1.642,140.843Z'
            );

        svg.append('path')
            .attr('class', 'edmonton cemetery beechmount')
            .attr('d', 'M697.708,54.604l69.952,0l0,262.687l-69.928,-0l-0.024,-262.687Z');

        svg.append('path')
            .attr('class', 'edmonton river')
            .attr('d', 'M11.25,727.718l211.36,-267.912l296.494,-16.665l344.548,-76.374');

        svg.selectAll('.headstone')
            .data(graphData.plottedHeadstones)
            .enter()
            .append('circle')
            .attr('class', 'node headstone')
            .style('fill', (headstone) => headstone.AddressObj.Color)
            .attr('cx', (headstone) => headstone.x)
            .attr('cy', (headstone) => headstone.y)
            .attr('r', 2)
            .on('click', (_, headstone) => {
                if (isInDateRange(headstone)) {
                    setSelected({ headstone });
                }
            });

        svg.append('path')
            .attr('class', 'china')
            .attr(
                'd',
                'M0,223.418l18.078,0.397l51.785,-14.48l26.282,-22.325l20.839,-44.059l-20.991,-41.825l22.792,-23.148l-27.123,-3.895l10.219,-23.652l29.294,1.628l27.345,-24.365l6.12,-27.694l-164.64,-0l0,223.418Z'
            );

        svg.append('path')
            .attr('class', 'china hainan')
            .attr('fill', 'none')
            .attr('d', 'M19.753,232.191l-11.115,6.938l5.712,10.871l10.437,-6.539l3.089,-8.37l-8.123,-2.9Z');

        svg.selectAll('.headstone-to-address')
            .data(graphData.plottedHeadstones)
            .enter()
            .append('path')
            .attr('class', 'connection headstone-to-address')
            .style('stroke', (headstone) => headstone.AddressObj.Color)
            .style('stroke-width', 0.6)
            .style('fill', 'none')
            .attr('d', (headstone) => generatePathData(headstone, headstone.AddressObj))
            .attr('opacity', 0);

        svg.selectAll('.address-to-headstone')
            .data(graphData.plottedHeadstones)
            .enter()
            .append('path')
            .attr('class', 'connection address-to-headstone')
            .style('stroke', (headstone) => headstone.AddressObj.Color)
            .style('stroke-width', 0.6)
            .style('fill', 'none')
            .attr('d', (headstone) => generatePathData(headstone.AddressObj, headstone))
            .attr('opacity', 0);

        svg.selectAll('.address')
            .data(graphData.plottedAddresses)
            .enter()
            .append('rect')
            .attr('class', 'node address')
            .style('fill', (address) => address.Color)
            .attr('x', (address) => address.x - 5)
            .attr('y', (address) => address.y)
            .attr('width', 7)
            .attr('height', 7)
            .on('click', (_, address) => setSelected({ address }));

        const zoom = d3
            .zoom()
            .scaleExtent([0.3, 8])
            .translateExtent([
                [-1000, -750],
                [1000, 200],
            ])
            .on('zoom', (event) => {
                svg.selectAll('.headstone,.edmonton').attr('transform', event.transform);

                svg.selectAll('.edmonton').attr(
                    'transform',
                    `translate(${-86.5 * (event.transform.k || 1) + (event.transform.x || 0)} ${-730 * (event.transform.k || 1) + (event.transform.y || 0)}) scale(${event.transform.k || 0})`
                );

                svg.selectAll('.headstone-to-address').attr('d', (headstone) =>
                    generatePathData(headstone, headstone.AddressObj, event.transform)
                );

                svg.selectAll('.address-to-headstone').attr('d', (headstone) =>
                    generatePathData(headstone.AddressObj, headstone, event.transform)
                );

                svg.selectAll("path[opacity='1']").attr('stroke-dasharray', (_, index, nodes) => {
                    const totalLength = nodes[index].getTotalLength();
                    return `${totalLength} ${totalLength}`;
                });
            });

        zoom.scaleTo(svg, 0.3);
        zoom.translateTo(svg, 0, -275);
        svg.call(zoom);
    }, [graphData, isInDateRange]);

    useEffect(() => {
        if (!graphData.plottedHeadstones.length) {
            return;
        }

        const svg = d3.select(d3ref.current);

        svg.selectAll('.address,.headstone')
            .filter((datum) => datum.City && isInDateRange(datum))
            .attr('opacity', 1)
            .style('cursor', 'pointer');

        svg.selectAll('.address,.headstone')
            .filter((datum) => datum.City && !isInDateRange(datum))
            .attr('opacity', 0.3)
            .style('cursor', 'default');
    }, [graphData, isInDateRange]);

    useEffect(() => {
        const svg = d3.select(d3ref.current);
        svg.selectAll('.node').classed('selected', false);

        if (selected.headstone) {
            if (!isInDateRange(selected.headstone)) {
                setSelected({});
            } else {
                d3.selectAll('.headstone')
                    .filter((headstone) => headstone === selected.headstone)
                    .classed('selected', true);
            }
        } else if (selected.address) {
            d3.selectAll('.address')
                .filter((address) => address === selected.address)
                .classed('selected', true);
        }
    }, [isInDateRange, selected]);

    useEffect(() => {
        const svg = d3.select(d3ref.current);

        if (showAll) {
            svg.selectAll('.address-to-headstone,.headstone-to-address')
                .filter((headstone) => !isInDateRange(headstone))
                .attr('opacity', 0);

            svg.selectAll('.address-to-headstone')
                .filter((headstone) => isInDateRange(headstone))
                .each((_, index, nodes) => drawPath(d3.select(nodes[index])));
        } else if (selected.headstone) {
            svg.selectAll('.connection')
                .filter((headstone) => selected.headstone !== headstone)
                .attr('opacity', 0);

            svg.selectAll('.headstone-to-address')
                .filter((headstone) => selected.headstone === headstone)
                .each((_, index, nodes) => drawPath(d3.select(nodes[index])));
        } else if (selected.address) {
            svg.selectAll('.connection')
                .filter((headstone) => selected.address !== headstone.AddressObj || !isInDateRange(headstone))
                .attr('opacity', 0);

            svg.selectAll('.address-to-headstone')
                .filter((headstone) => selected.address === headstone.AddressObj && isInDateRange(headstone))
                .each((_, index, nodes) => drawPath(d3.select(nodes[index])));
        } else {
            svg.selectAll('.connection').attr('opacity', 0);
        }
    }, [drawPath, isInDateRange, selected, showAll]);

    if (!hasRenderableData) {
        return <section className="fade-in">Visualization data is unavailable.</section>;
    }

    return (
        <div id="address-graph" className="fade-in">
            <div className="center-column">
                <svg id="d3" ref={d3ref} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} />
                <div className="toggle-panel">
                    <div className="toggle-button" id="time-toggle-button">
                        <input
                            id="time-toggle"
                            className="toggle"
                            type="checkbox"
                            ref={timeToggle}
                            onChange={(event) => setTimeFilterEnabled(event.target.checked)}
                        />
                        <label htmlFor="time-toggle">Filter by Date</label>
                        <div className="toggle-text">Filter by Date</div>
                    </div>
                    <div className="toggle-button" id="connections-toggle-button">
                        <input
                            id="connections-toggle"
                            className="toggle"
                            type="checkbox"
                            onChange={(event) => setShowAll(event.target.checked)}
                        />
                        <label htmlFor="connections-toggle">Show All Connections</label>
                        <div className="toggle-text">Show All Connections</div>
                    </div>
                </div>
                <TimeSlider
                    className={timeFilterEnabled ? 'active' : 'disabled'}
                    min={yearDomain.min}
                    max={yearDomain.max}
                    start={selectedRange.min}
                    end={selectedRange.max}
                    onStartChange={(value) => {
                        setSelectedRange((current) => ({ ...current, min: value }));
                        if (timeToggle.current) {
                            timeToggle.current.checked = true;
                        }
                        setTimeFilterEnabled(true);
                    }}
                    onEndChange={(value) => {
                        setSelectedRange((current) => ({ ...current, max: value }));
                        if (timeToggle.current) {
                            timeToggle.current.checked = true;
                        }
                        setTimeFilterEnabled(true);
                    }}
                />
            </div>
            <InfoPanel headstone={selected.headstone} address={selected.address} />
        </div>
    );
}
