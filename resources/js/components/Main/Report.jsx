import { useEffect, useContext, useState, useRef } from 'react';

import { isMobile, scaleEffect } from '@/components/HelpFunctions';

/* Report part in main */

export default function Report(props) {
    const context = useContext(props.context);

    const report = props.report;
    if (report == null) {
        return null;
    }

    let anonBox = document.querySelector('.annotation-box');
    const hightlineClass = "background-lime";

    let connections = [];

    let anonInterval = null;

    let lastAnonWidth = null;
    let lastAnonHeight = null;

    //let hightlined = null;
    let [hightlined, setHightlined] = useState(null);
    let [clicked, setClicked] = useState(null);
    const [showAllConnections, setShowAllConnections] = useState(false);

    let treeBox = null;
    const itemPositions = useRef([]);

    /// functions ///

    function renderChildren(children, parentId) {
        const parents = [];

        function renderChild(id) {

            children[id].parents = (typeof children[id].parents != 'undefined') ? children[id].parents : [];
            if (connections.filter((s) => s[1] == id).length == 0) {

                parents.push(
                    [
                        <div style={{ padding: '5px', }} key={`div-child${id}`}>
                            {rendertreeItem(id, children[id].parents)}
                            {children[id].c != null && !context.ifEmpty(children[id].c)
                                ? <div className='tree-any'>{renderChildren(children[id].c, id)}</div>
                                : null}

                        </div>
                    ]
                );

            }

            children[id].parents.forEach(p => {
                if (p.id != id && typeof allChilrenParents[children[id].id] == 'undefined') {
                    connections.push([p.id, children[id].id]);
                }
            });

            if (parentId != id && typeof allChilrenParents[id] == 'undefined') {
                connections.push([parentId, id]);
            }

        }

        function getCrossIsoKeys() {
            const childrenKeys = Object.keys(children);
            return [
                childrenKeys.filter(id => children[id].parents
                    .filter(s => s.id != parentId).length > 0),

                childrenKeys.filter(id => children[id].parents
                    .filter(s => s.id != parentId).length == 0)
            ];
        }

        const [crossKeys, isolationKeys] = getCrossIsoKeys();

        crossKeys.forEach(id => renderChild(id));
        isolationKeys.forEach(id => renderChild(id));
        return parents;
    }

    function removeLines() {
        const linesBefore = document.querySelectorAll(".connect-line");
        linesBefore.forEach((line) => {
            line.remove();
        });
    }

    function getChildrenParents(children, childrenIds) {
        let allChilrenParents = {};
        Object.keys(children).forEach((ck) => {
            Object.keys(children[ck].parents).forEach((pk) => {
                if (!childrenIds.includes(children[ck].parents[pk].id.toString())) {
                    allChilrenParents[children[ck].parents[pk].id] = children[ck].parents[pk];
                }
            });
            if (!context.ifEmpty(children[ck].c)) {
                allChilrenParents = Object.assign(allChilrenParents, getChildrenParents(children[ck].c, childrenIds), allChilrenParents);
            }
        });

        return allChilrenParents;
    }

    function getChildrenIds(children) {
        let ids = Object.keys(children);
        ids.forEach(id => {
            if (!context.ifEmpty(children[id].c)) {
                ids = ids.concat(getChildrenIds(children[id].c));
            }
        });
        return ids;
    }

    function gettreeBox() {
        return document.querySelector('.tree-box');
    }

    function recursiveFindParent(id, parents) {
        if (typeof parents[id] != 'undefined') {
            return true;
        } else {
            let result = false;
            Object.keys(parents).forEach(pid => {
                if (typeof parents[pid].c != 'undefined') {
                    if (recursiveFindParent(id, parents[pid].c)) {
                        result = true;
                    }
                }
            });
            return result;
        }
    }


    function renderParents(parents, childId) {
        const result = [];

        Object.keys(parents).forEach((id) => {
            if (connections.filter((s) => s[0] == id).length == 0) {

                result.push(
                    [
                        <div style={{ padding: '5px' }} key={`div-parent${id}`}>
                            {parents[id].c != null ? <div className="tree-any" key={`tree-any${id}`}>{renderParents(parents[id].c, id)}</div> : null}
                            {rendertreeItem(id, parents[id].c)}
                        </div>
                    ]
                );
            }
            connections.push([id, childId]);
        });
        return result;
    }


    function collectItemPositions() {

        itemPositions.current = [];
        document.querySelectorAll('.tree-item').forEach(item => {
            if (!item.classList.contains('gray-item')) {
                const rect = item.getBoundingClientRect();
                if (item.innerHTML.length == 0) {
                    console.error("Empty Name", item.innerHTML);
                }

                itemPositions.current.push({
                    x1: rect.left,
                    x2: rect.left + rect.width,
                    y1: rect.top,
                    y2: rect.top + rect.height,
                    name: item.innerHTML
                });
            }
        });

    }
    /*
        function checkItemConflicts(current, addedPositions, setCorrections) {
            //  let conflict = false;
            treeBox = gettreeBox();
            const theeboxRect = treeBox.getBoundingClientRect();
    
            if (current.x < theeboxRect.left) {
                if (setCorrections && current.correction.filter(s => s.x == theeboxRect.left && s.y == current.y).length == 0) {
                    current.correction.push({
                        x: theeboxRect.left,
                        y: current.y
                    });
    
                    console.log('out of x');
                }
                return false;
            }
    
            if (current.y < (theeboxRect.y + 5)) {
                if (setCorrections) {
                    current.correction.push({
                        x: current.x,
                        y: (theeboxRect.y + 5)
                    });
                    console.log('out of y1');
                }
    
    
                return false;
            }
            if (current.y > (theeboxRect.y + theeboxRect.height - 50)) {
                if (setCorrections) {
                    current.correction.push({
                        x: current.x,
                        y: theeboxRect.height - 50
                    });
                    console.log('out of y2');
                }
    
                return false;
            }
    
            const conflicted = itemPositions.current
                .concat(addedPositions)
                .filter(element => {
                    const eX1 = element.x1 - 20 + treeBox.scrollLeft;
                    const eX2 = element.x2 + treeBox.scrollLeft;
                    const eY1 = element.y1;
                    const eY2 = element.y2;
                    const cX1 = current.x;
                    const cX2 = current.x + current.width;
                    const cY1 = current.y;
                    const cY2 = current.y + current.height;
    
                    return (((eX1 >= cX1 && eX1 <= cX2) || (eX2 >= cX1 && eX2 <= cX2) || (cX1 >= eX1 && cX1 <= eX2) || (cX2 >= eX1 && cX2 <= eX2))
                        &&
                        ((eY1 >= cY1 && eY1 <= cY2) || (eY2 >= cY1 && eY2 <= cY2) || (cY2 >= eY1 && cY2 <= eY2)))
                })
                .filter((value, index, array) => {
                    return array.indexOf(value) === index;
                });
    
            return conflicted.length == 0;
    
        }*/

    function allPossiblePositions(targetRect, theeboxRect, potencialWidth, addedPositions) {
        treeBox = gettreeBox();

        let result = [];
        function itemConflicts(current) {

            const conflicted = itemPositions.current
                .concat(addedPositions)
                .filter(element => {
                    const eX1 = element.x1 - 20 + treeBox.scrollLeft;
                    const eX2 = element.x2 + treeBox.scrollLeft;
                    const eY1 = element.y1;
                    const eY2 = element.y2;
                    const cX1 = current.x;
                    const cX2 = current.x + current.width;
                    const cY1 = current.y;
                    const cY2 = current.y + current.height;

                    return (((eX1 >= cX1 && eX1 <= cX2) || (eX2 >= cX1 && eX2 <= cX2) || (cX1 >= eX1 && cX1 <= eX2) || (cX2 >= eX1 && cX2 <= eX2))
                        &&
                        ((eY1 >= cY1 && eY1 <= cY2) || (eY2 >= cY1 && eY2 <= cY2) || (cY2 >= eY1 && cY2 <= eY2)))
                })
                .filter((value, index, array) => {
                    return array.indexOf(value) === index;
                });

            return conflicted.length == 0;

        }

        const step = 5;
        const startX = parseInt(targetRect.left) - step;
        const startY = parseInt(theeboxRect.top);
        const endY = theeboxRect.bottom - targetRect.height;
        for (let x = startX; x > theeboxRect.left; x -= step) {

            for (let y = startY; y < endY; y += step) {

                const position = { x: x, y: y, width: potencialWidth, height: targetRect.height };

                if (itemConflicts(position)) {
                    result.push({
                        x1: position.x,
                        x2: position.x + position.width,
                        y1: position.y,
                        y2: position.y + position.height
                    });
                }


            }

        }


        if (result.length == 0) {
            //TODO
            for (let x = startX; x > theeboxRect.left; x -= step) {

                for (let y = startY; y < endY; y += step) {

                    const position = { x: x, y: y, width: potencialWidth, height: targetRect.height };


                    result.push({
                        x1: position.x,
                        x2: position.x + position.width,
                        y1: position.y,
                        y2: position.y + position.height
                    });



                }

            }
        }


        let filteredPosition = result.filter(p => p.x2 < targetRect.left - 10);

        if (filteredPosition.length != 0) {
            result = filteredPosition;
        }

        return result;
    }


    function getOptimalPositionQuanto(items, targetItem) {
        treeBox = gettreeBox();

        const targetRect = targetItem.getBoundingClientRect();
        const theeboxRect = treeBox.getBoundingClientRect();
        const targetHeight = targetRect.height;

        let top = targetRect.top;

        if (items.length > 1) {
            top -= (targetHeight * items.length / 2);
        }
        if (top < 0) {
            top = targetRect.top;
        }

        let result = {};


        const addedPositions = [];
        items.forEach(id => {
            const name = context.getName(id);
            const potencialWidth = name.length * 7 + 32;
            const positions = allPossiblePositions(targetRect, theeboxRect, potencialWidth, addedPositions);

            const posLen = {};
            positions.forEach(position => {

                const length = Math.sqrt(Math.pow(targetRect.x - position.x1, 2) + Math.pow(targetRect.y + (targetRect.height / 2) - position.y2 + (targetRect.height / 2), 2));
                posLen[length] = position;
            });
            const kk = Object.keys(posLen).map(s => parseFloat(s));
            const minKey = Math.min(...kk);
            const positionToAdd = posLen[minKey];
            console.log(positionToAdd);
            addedPositions.push(positionToAdd);

            result[id] = {
                top: positionToAdd.y1 - theeboxRect.top,
                left: positionToAdd.x1 - theeboxRect.left,

            };

        });

        return result;
    }

   

    function getFinalItems(excludeIds, elements) {
        let final = [];

        Object.keys(elements).forEach(elId => {
            if (elements[elId].c.length == 0) {
                if (excludeIds.includes(elId) == false) {
                    final.push(elId);
                }
            } else {
                excludeIds.push(elId);
                const recFinal = getFinalItems(excludeIds, elements[elId].c);
                final = final.concat(recFinal);
            }
        });

        return final;
    }


    function getDeepChildrenParents(excludeIds, elements) {
        let maxLength = 0;

        Object.keys(elements).forEach(elId => {
            excludeIds.push(parseInt(elId));
            const theLength = elements[elId].parents
                .map(s => s.id)
                .filter(s => !excludeIds.includes(parseInt(s)))
                .length;

            maxLength = Math.max(maxLength, theLength);
            const deepLength = getDeepChildrenParents(excludeIds, elements[elId].c);
            maxLength = Math.max(deepLength, maxLength);

        });
        return maxLength;
    }


    function throttleShowAllConnection(evt) {
        setShowAllConnections(evt.target.checked);
    }

    function renderMap(report) {

        if (report.children.length == 0 && report.parents.length == 0) {
            return null;
        }
        const parents = (report.parents == null) ? null : renderParents(report.parents, report.item.id);
        const children = (report.children == null) ? null : renderChildren(report.children, report.item.id);

        const sectors = [null, null, null];

        let maxChildrenParents = getDeepChildrenParents([report.item.id], report.children);

        if (maxChildrenParents == 1) {
            maxChildrenParents = 2;
        }
        const maxChildren = getFinalItems([report.item.id], report.children).length;
        const maxParents = getFinalItems([report.item.id], report.parents).length;
        const maxElements = Math.max(maxChildren, maxParents);

        if (!context.ifEmpty(allChilrenParents)) {

            if (showAllConnections == false) {

                if (hightlined != null) {
                    collectItemPositions();

                    const target = document.getElementById(`item${hightlined}`);
                    const notRealizedParents = Object.keys(allChilrenParents)
                        .filter(s => recursiveFindParent(s, report.parents) == false)
                        .map(s => parseInt(s));

                    const vParents = JSON.parse(target.dataset.vparents)
                        .filter(s => notRealizedParents.includes(s.id));

                    // const positions = getOptimalPosition(vParents.map(s => s.id), target);
                    const positions = getOptimalPositionQuanto(vParents.map(s => s.id), target);

                    sectors[3] = vParents.map(s => <div style={{ position: 'absolute', top: `${positions[s.id].top}px`, left: `${positions[s.id].left}px` }} key={`div-child${s.id}`}>
                        {rendertreeItem(s.id, [], 'gray-item')}
                    </div>);


                    const additionalConnections = [];
                    vParents.forEach(s => {
                        additionalConnections.push([s.id, parseInt(hightlined)]);
                    });
                    setTimeout(() => {
                        connectLines2(gettreeBox(), additionalConnections);
                    }, 100);

                }

            } else {

                const notRealizedParents = Object.keys(allChilrenParents).filter(s => recursiveFindParent(s, report.parents) == false);

                sectors[(parents.length == 0) ? 1 : 0] = notRealizedParents.map(id => <div style={{ padding: '5px', }} key={`div-child${id}`}>
                    {rendertreeItem(id, null, 'gray-item')}
                </div>);
            }

        }

        const height = maxChildrenParents >= maxElements ? `${maxChildrenParents * 130}px` : '100%';
        //  {maxChildrenParents > 0 ? showChildrenParents : null}
        return <div>
            {maxChildrenParents > 0 ? <div className='show-all-connection-form'>
                <input type="checkbox" id="show-all-connections" defaultChecked={showAllConnections} onChange={throttleShowAllConnection} />
                <label htmlFor="show-all-connections"> show all connections</label>
            </div> : null}
            <div className='tree-box'>
                <table className='tree' style={{ height: height }}>
                    <tbody>
                        <tr>
                            <td>
                                {parents}
                                {sectors[0]}
                            </td>
                            <td>
                                {rendertreeItem(report.item.id, report.parents, 'block red')}
                                {sectors[1]}
                            </td>
                            <td>
                                {children}
                            </td>
                        </tr>
                    </tbody>
                </table>
                {sectors[3]}
            </div>
        </div>
            ;
    }


    function renderCats(item) {
        return <div className='nowrap font-size-0-7 strain-cats marginl valign-text-top'>
            <i>
                {context
                    .categories
                    .filter(c => item.cats.includes(c.id))
                    .map(c => c.genus + " " + c.name)
                    .join(', ')}
            </i>
        </div>
    }


    function renderCultivation(item) {
        if (item.cultivation == 0) {
            return null;
        }
        const texts = {
            '1': 'Simple', '2': 'Average', '3': 'Difficult'
        };
        return <div className='nowrap font-size-0-7'>
            <i>Cultivation: {texts[item.cultivation]}</i>
        </div >
    }

    function rendertreeItem(id, parents = null, className = null) {
        let title = null;
        if (parents != null) {
            title = Object.keys(parents).map(k => context.getName(parents[k].id)).join(', ');
        }
        const vparents = (parents == null) ? null : JSON.stringify(Object.values(parents));

        className = (className == null) ? 'tree-item' : `tree-item ${className}`;
        return <div className={className} key={`child${id}`} data-vparents={vparents} data-id={id} id={`item${id}`} onClick={throttleHightLine} title={title}>
            {context.getName(id)}
        </div>
    }

    function throttleHightLine(evt) {
        if (detectDoubleClick(evt)) {
            hightlined = null;
            setHightlined(null);
            context.reportForm.show(evt);
            return;
        }
        if (evt.target.classList.contains('gray-item')) {
            return;
        }
        document.querySelectorAll(`.${hightlineClass}`).forEach((line) => {
            line.classList.remove(hightlineClass);
        });

        if (hightlined == null || hightlined != evt.target.dataset.id) {
            let itemsConnected = [];
            document.querySelectorAll(`.line-${evt.target.dataset.id}`).forEach((line) => {
                const classes = line.classList.value.split(' ').filter((s) => s.substring(0, 4) == 'line');
                classes.forEach((c) => {
                    itemsConnected.push(c.substring(5));
                });

                line.classList.add(hightlineClass);
            });
            itemsConnected = [...new Set(itemsConnected)].map(s => `#item${s}`);
            if (itemsConnected.length > 0) {
                document.querySelectorAll(itemsConnected.join(',')).forEach(item => {
                    item.classList.add(hightlineClass);
                });
            }
            setHightlined(evt.target.dataset.id);
            hightlined = evt.target.dataset.id;
        } else {
            setHightlined(null);
            hightlined = null;
        }

    }

    function getOffset(el) {
        const treeBox = gettreeBox();
        var rect = el.getBoundingClientRect();
        var parentRect = treeBox.getBoundingClientRect();

        return {
            left: rect.left - parentRect.left + treeBox.scrollLeft,
            top: rect.top - parentRect.top,
            width: rect.width || el.offsetWidth,
            height: rect.height || el.offsetHeight
        };
    };

    function connectLines2(treeBox, connections) {

        document.querySelectorAll('.connect-line-custom').forEach(line => {
            line.parentNode.removeChild(line);
        });

        const connect2 = (div1, div2, color, thickness) => { // draw a line connecting elements
            var off1 = getOffset(div1);
            var off2 = getOffset(div2);

            // bottom right
            var x1 = off1.left + off1.width;
            var y1 = off1.top + (off1.height / 2);
            // top right
            //var x2 = off2.left + off2.width;
            var x2 = off2.left;
            var y2 = off2.top + (off2.height / 2);


            // distance
            var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
            // center
            var cx = ((x1 + x2) / 2) - (length / 2);
            var cy = ((y1 + y2) / 2) - (thickness / 2);

            // angle
            var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
            // make hr            
            const vparents = (typeof div2.dataset.vparents != 'undefined') ? JSON.parse(div2.dataset.vparents) : [];
            color = "red";
            if (vparents.length > 0) {
                color = "blue";
            }

            var element = document.createElement('div');
            element.style.cssText = `height:${thickness}px;left:${cx}px; top:${cy}px; width:${length}px;transform:rotate(${angle}deg);`;
            element.className = `connect-line connect-line-custom ${hightlineClass} line-${div1.dataset.id} line-${div2.dataset.id}`;

            return element;
        };

        const lines = [];

        connections.forEach((item) => {
            const div0 = document.getElementById(`item${item[0]}`);
            const div1 = document.getElementById(`item${item[1]}`);
            if (div0 != null && div1 != null) {
                lines.push(connect2(div0, div1, 'lime', 2));
            }
        });

        lines.forEach((line) => {
            treeBox.append(line);
        });

    }

    function addLines(cssClass) {

        function connect(div1, div2, thickness) { // draw a line connecting elements
            var off1 = getOffset(div1);
            var off2 = getOffset(div2);

            // bottom right
            var x1 = off1.left + off1.width;
            var y1 = off1.top + (off1.height / 2);
            // top right
            //var x2 = off2.left + off2.width;
            var x2 = off2.left;
            var y2 = off2.top + (off2.height / 2);


            // distance
            var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
            // center
            var cx = ((x1 + x2) / 2) - (length / 2);
            var cy = ((y1 + y2) / 2) - (thickness / 2);

            // angle
            var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
            // make hr            

            const element = document.createElement('div');
            element.style.cssText = `height:${thickness}px; left:${cx}px; top:${cy}px; width:${length}px; transform:rotate(${angle}deg);`;
            element.className = `connect-line line-${div1.dataset.id} line-${div2.dataset.id} background-blue`;
            return element;
        }

        document.querySelectorAll(".connect-line")
            .forEach((line) => {
                line.remove();
            });

        const lines = [];

        connections.forEach((item) => {
            const div0 = document.getElementById(`item${item[0]}`);
            const div1 = document.getElementById(`item${item[1]}`);
            if (div0 != null && div1 != null) {
                lines.push(connect(div0, div1, 2));
            }
        });

        lines.forEach((line) => {
            gettreeBox().append(line);
        });

        connections = [];
    }


    function connectLines() {

        const connect = (div1, div2, color, thickness) => { // draw a line connecting elements
            var off1 = getOffset(div1);
            var off2 = getOffset(div2);

            // bottom right
            var x1 = off1.left + off1.width;
            var y1 = off1.top + (off1.height / 2);
            // top right
            //var x2 = off2.left + off2.width;
            var x2 = off2.left;
            var y2 = off2.top + (off2.height / 2);


            // distance
            var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
            // center
            var cx = ((x1 + x2) / 2) - (length / 2);
            var cy = ((y1 + y2) / 2) - (thickness / 2);

            // angle
            var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
            // make hr            
            const vparents = (typeof div2.dataset.vparents != 'undefined') ? JSON.parse(div2.dataset.vparents) : [];
            color = "red";
            if (vparents.length > 0) {
                color = "blue";
            }

            var element = document.createElement('div');
            element.style.cssText = `height:${thickness}px;left:${cx}px; top:${cy}px; width:${length}px;transform:rotate(${angle}deg);`;
            element.className = `connect-line line-${div1.dataset.id} line-${div2.dataset.id} background-${color}`;
            return element;
        };

        const linesBefore = document.querySelectorAll(".connect-line");
        linesBefore.forEach((line) => {
            line.remove();
        });

        const lines = [];

        connections.forEach((item) => {
            const div0 = document.getElementById(`item${item[0]}`);
            const div1 = document.getElementById(`item${item[1]}`);
            if (div0 != null && div1 != null) {
                lines.push(connect(div0, div1, 'lime', 2));
            }
        });

        lines.forEach((line) => {
            gettreeBox().append(line);
        });

        connections = [];
    }

    function prepareLines() {


        if (anonInterval == null) {
            anonInterval = setInterval(() => {
                if (anonBox != null) {
                    const anonRect = anonBox.getBoundingClientRect();
                    const anonWidth = anonRect.width;
                    const anonHeight = anonRect.height;
                    const anonImage = anonBox.querySelector('.annotation-image');
                    const complete = anonImage == null ? true : anonImage.complete;
                    if (lastAnonWidth == anonWidth && lastAnonHeight == anonHeight && complete) {
                        clearInterval(anonInterval);

                        if ((anonWidth / anonHeight) < 0.6) {
                            let correctWidth = anonHeight;
                            if (correctWidth > window.innerWidth) {
                                correctWidth = window.innerWidth - 40;
                            }
                            anonBox.style.width = `${correctWidth}px`;

                        }

                        anonInterval = null;
                        addLines();
                        //connectLines();
                        if (!isMobile()) {
                            const treeWidth = (treeBox != null ? treeBox.getBoundingClientRect().width : 300);
                            anonBox.style.width = `${treeWidth + 300 + 30}px`;
                        }

                        scaleEffect.show(anonBox);
                    }
                    lastAnonWidth = anonWidth;
                    lastAnonHeight = anonHeight;
                }

            }, 100);
        }
    }

    function detectDoubleClick(evt) {
        if (clicked != null && evt.target.dataset.id == clicked.id && (new Date().getTime() - clicked.time) < 300) {
            clicked = null;
            setClicked(null);
            return true;
        }

        clicked = { id: evt.target.dataset.id, time: new Date().getTime() };
        setClicked(clicked);

        return false;
    }




    /// functions eof ////
    useEffect(() => {
        anonBox = document.querySelector('.annotation-box');
        treeBox = gettreeBox();
        prepareLines();
        return () => {

            removeLines();
        }
    }, [showAllConnections]);

    useEffect(() => {
        let lastScrollPercent = window.scrollY * 100 / document.documentElement.scrollHeight;
        window.addEventListener('scroll', () => {
            lastScrollPercent = window.scrollY * 100 / document.documentElement.scrollHeight;
        });
        window.addEventListener('resize', () => {
            window.scrollTo(0, document.documentElement.scrollHeight / 100 * lastScrollPercent);
        });


        return () => {
            context.resetPage();
        }
    }, []);


    const childrenIds = getChildrenIds(report.children);
    childrenIds.push(report.item.id.toString());

    const allChilrenParents = getChildrenParents(report.children, childrenIds);
    const img = report.item.image != null && report.item.image != '' && report.item.image != '/storage/uploads/'
        ? <img src={report.item.image} className="annotation-image" />
        : null;

    const elmnts = isMobile() ? [img, renderMap(report)] : [renderMap(report), img];

    return <div
        className="annotation-box"
        key={`annotation-box${report.item.id}`}
        style={{ visibility: 'hidden' }}>
        <div key="div-header">
            <table style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '40px' }} className='valign-text-top'>
                            <div onClick={context.editForm.show} className='floatl color-gray margin-5 material-symbols-outlined js-no-touch cursor-pointer' key={`editReport${report.item.id}`} data-id={report.item.id} title="Edit content">settings</div>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                            <h1 className='report-title'>{report.item.name}</h1>
                            {renderCats(report.item)}
                        </td>
                        <td style={{ width: '30px' }} className='valign-text-top'>
                            <button onClick={() => context.reportForm.hide()} className='floatr material-symbols-outlined js-no-touch'>close</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div key="div-report" className='div-report padding-5'>
            {elmnts}
            {renderCultivation(report.item)}
            <pre className='description' key="report-description">{report.item.description}</pre>
        </div>
    </div>;
}