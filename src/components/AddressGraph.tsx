import '../styles/address-graph.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

import type { Headstone } from 'src/types/headstones';
import type { Address } from 'src/types/addresses';

import TimeSlider from './TimeSlider';
import InfoPanel from './InfoPanel';

const HEIGHT = 250;
const WIDTH = 500;

const generatePathData = (origin: Headstone | Address, target: Headstone | Address, transform?: d3.ZoomTransform) => {
    const left = 0;
    const right = 1;
    const dirVal = 'address' in origin ? left : right;

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

const toNumber = (value: string) => {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) ? number : 0;
};

export type AddressGraphProps = {
    addresses: Address[];
    dateRange: { min: number; max: number };
    headstones: Headstone[];
};

export default function AddressGraph({ addresses, dateRange, headstones }: AddressGraphProps) {
    const [timeFilterEnabled, setTimeFilterEnabled] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [selected, setSelected] = useState<{
        headstone?: Headstone;
        address?: Address;
    }>({});

    const d3ref = useRef<SVGSVGElement | null>(null);
    const timeToggle = useRef<HTMLInputElement | null>(null);

    const [selectedRange, setSelectedRange] = useState(dateRange);

    const hasRenderableData =
        headstones.length > 0 && addresses.length > 0 && dateRange.min !== 0 && dateRange.max !== 0;

    const isInDateRange = useCallback(
        (headstone: Headstone) =>
            !timeFilterEnabled ||
            (Number(headstone.BirthYear) >= selectedRange.min && Number(headstone.DeathYear) <= selectedRange.max),
        [selectedRange.max, selectedRange.min, timeFilterEnabled]
    );

    const drawPath = useCallback((path: d3.Selection<SVGPathElement, Headstone, d3.BaseType, unknown>) => {
        if (path.attr('opacity') === '0') {
            const pathNode = path.node();

            if (!pathNode) {
                return;
            }

            const totalLength = pathNode.getTotalLength();

            path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                .attr('stroke-dashoffset', totalLength)
                .attr('opacity', 1)
                .transition()
                .duration(300)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);
        }
    }, []);

    useEffect(() => {
        if (!d3ref.current) {
            return;
        }

        const svg = d3.select<SVGSVGElement, undefined>(d3ref.current);
        svg.selectAll('*').remove();

        svg.append('rect')
            .attr('class', 'background')
            .on('click', () => setSelected({}));
    }, []);

    useEffect(() => {
        if (!headstones.length || !addresses.length) {
            return;
        }

        if (!d3ref.current) {
            return;
        }

        const svg = d3.select<SVGSVGElement, undefined>(d3ref.current);
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

        svg.selectAll<SVGCircleElement, Headstone>('.headstone')
            .data(headstones)
            .enter()
            .append('circle')
            .attr('class', 'node headstone')
            .style('fill', (headstone) => headstone.address.Color)
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

        svg.selectAll<SVGPathElement, Headstone>('.headstone-to-address')
            .data(headstones)
            .enter()
            .append('path')
            .attr('class', 'connection headstone-to-address')
            .style('stroke', (headstone) => headstone.address.Color)
            .style('stroke-width', 0.6)
            .style('fill', 'none')
            .attr('d', (headstone) => generatePathData(headstone, headstone.address))
            .attr('opacity', 0);

        svg.selectAll<SVGPathElement, Headstone>('.address-to-headstone')
            .data(headstones)
            .enter()
            .append('path')
            .attr('class', 'connection address-to-headstone')
            .style('stroke', (headstone) => headstone.address.Color)
            .style('stroke-width', 0.6)
            .style('fill', 'none')
            .attr('d', (headstone) => generatePathData(headstone.address, headstone))
            .attr('opacity', 0);

        svg.selectAll<SVGRectElement, Address>('.address')
            .data(addresses)
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
            .zoom<SVGSVGElement, undefined>()
            .scaleExtent([0.3, 8])
            .translateExtent([
                [-1000, -750],
                [1000, 200],
            ])
            .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, undefined>) => {
                svg.selectAll<SVGElement, unknown>('.headstone,.edmonton').attr(
                    'transform',
                    event.transform.toString()
                );

                svg.selectAll<SVGPathElement, unknown>('.edmonton').attr(
                    'transform',
                    `translate(${-86.5 * (event.transform.k || 1) + (event.transform.x || 0)} ${-730 * (event.transform.k || 1) + (event.transform.y || 0)}) scale(${event.transform.k || 0})`
                );

                svg.selectAll<SVGPathElement, Headstone>('.headstone-to-address').attr('d', (headstone) =>
                    generatePathData(headstone, headstone.address, event.transform)
                );

                svg.selectAll<SVGPathElement, Headstone>('.address-to-headstone').attr('d', (headstone) =>
                    generatePathData(headstone.address, headstone, event.transform)
                );

                svg.selectAll<SVGPathElement, unknown>("path[opacity='1']").each(function () {
                    const totalLength = this.getTotalLength();
                    d3.select(this).attr('stroke-dasharray', `${totalLength} ${totalLength}`);
                });
            });

        zoom.scaleTo(svg, 0.3);
        zoom.translateTo(svg, 0, -275);
        svg.call(zoom);
    }, [isInDateRange]);

    useEffect(() => {
        if (!headstones.length) {
            return;
        }

        if (!d3ref.current) {
            return;
        }

        const svg = d3.select<SVGSVGElement, undefined>(d3ref.current);

        svg.selectAll<SVGCircleElement, Headstone>('.headstone')
            .filter((datum) => isInDateRange(datum))
            .attr('opacity', 1)
            .style('cursor', 'pointer');

        svg.selectAll<SVGCircleElement, Headstone>('.headstone')
            .filter((datum) => !isInDateRange(datum))
            .attr('opacity', 0.3)
            .style('cursor', 'default');
    }, [isInDateRange]);

    useEffect(() => {
        if (!d3ref.current) {
            return;
        }

        const svg = d3.select<SVGSVGElement, undefined>(d3ref.current);
        svg.selectAll('.node').classed('selected', false);

        if (selected.headstone) {
            if (!isInDateRange(selected.headstone)) {
                setSelected({});
            } else {
                d3.selectAll<SVGCircleElement, Headstone>('.headstone')
                    .filter((headstone) => headstone === selected.headstone)
                    .classed('selected', true);
            }
        } else if (selected.address) {
            d3.selectAll<SVGRectElement, Address>('.address')
                .filter((address) => address === selected.address)
                .classed('selected', true);
        }
    }, [isInDateRange, selected]);

    useEffect(() => {
        if (!d3ref.current) {
            return;
        }

        const svg = d3.select<SVGSVGElement, undefined>(d3ref.current);

        if (showAll) {
            svg.selectAll<SVGPathElement, Headstone>('.address-to-headstone,.headstone-to-address')
                .filter((headstone) => !isInDateRange(headstone))
                .attr('opacity', 0);

            svg.selectAll<SVGPathElement, Headstone>('.address-to-headstone')
                .filter((headstone) => isInDateRange(headstone))
                .each((_, index, nodes) =>
                    drawPath(d3.select(nodes[index]) as d3.Selection<SVGPathElement, Headstone, d3.BaseType, unknown>)
                );
        } else if (selected.headstone) {
            svg.selectAll<SVGPathElement, Headstone>('.connection')
                .filter((headstone) => selected.headstone !== headstone)
                .attr('opacity', 0);

            svg.selectAll<SVGPathElement, Headstone>('.headstone-to-address')
                .filter((headstone) => selected.headstone === headstone)
                .each((_, index, nodes) =>
                    drawPath(d3.select(nodes[index]) as d3.Selection<SVGPathElement, Headstone, d3.BaseType, unknown>)
                );
        } else if (selected.address) {
            svg.selectAll<SVGPathElement, Headstone>('.connection')
                .filter((headstone) => selected.address !== headstone.address || !isInDateRange(headstone))
                .attr('opacity', 0);

            svg.selectAll<SVGPathElement, Headstone>('.address-to-headstone')
                .filter((headstone) => selected.address === headstone.address && isInDateRange(headstone))
                .each((_, index, nodes) =>
                    drawPath(d3.select(nodes[index]) as d3.Selection<SVGPathElement, Headstone, d3.BaseType, unknown>)
                );
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
                    min={dateRange.min}
                    max={dateRange.max}
                    start={selectedRange.min}
                    end={selectedRange.max}
                    onStartChange={(value: number) => {
                        setSelectedRange((current) => ({ ...current, min: value }));
                        if (timeToggle.current) {
                            timeToggle.current.checked = true;
                        }
                        setTimeFilterEnabled(true);
                    }}
                    onEndChange={(value: number) => {
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
