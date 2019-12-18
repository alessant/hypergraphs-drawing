const d3 = require('d3');
const jsnx = require('jsnetworkx');

export function draw(
        hg, 
        element, 
        width=1000, 
        height=1000,
        charge=-120,
        linkDistance=40,
        nodeShape='circle',
        withLabels=false,
        withEdgeLabels=false,
        labelStyle='none',
        edgeLabelStyle='none',
        weighted=false,
        optBind)
{

    console.log("Draw");
    console.log(hg);

    var graph = toJSNXGraph(hg);

    console.log(graph);

    if (labelStyle=='none'){
        labelStyle = {
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'cursor': 'pointer',
            '-webkit-user-select': 'none',
            'fill': '#000'
        }
    }
    if (edgeLabelStyle=='none'){
        edgeLabelStyle = {
            'font-size': '0.8em',
            'dominant-baseline': 'central',
            'text-anchor': 'middle',
            '-webkit-user-select': 'none'
        }
    }

    jsnx.draw(graph, {
        element: `#${element}`, 
        width: width,
        height: height,
        weighted: weighted,
        withLabels: withLabels,
        withEdgeLabels: withEdgeLabels,
        layoutAttr: {
            charge: charge,
            linkDistance: linkDistance
        },
        nodeShape: nodeShape,
        nodeAttr: {
            r: function(d){
                return d.data.size || 8;
            }
        },
        nodeStyle: {
            fill: function(d) { 
                return d.data.color || '#999'; 
            },
            stroke: function(d) { 
                return d.data.stroke || 'none'; 
            },
            'stroke-width': function(d) { 
                return d.data.strokeWidth || 0; 
            },
            cursor: function(d) { 
                return d.data.cursor || 'pointer'; 
            },
            opacity: function(d) { 
                return d.data.opacity || 1; 
            },
            'stroke-opacity': function(d) { 
                return d.data.strokeOpacity || 1; 
            }
        },
        edgeStyle: {
            fill: function(d) { 
                return d.data.color || '#999';
            },
            stroke: function(d) { 
                return d.data.stroke || '#000'; 
            },
            'stroke-width': function(d) { 
                return d.data.strokeWidth || 2; 
            },
            opacity: function(d) { 
                return d.data.opacity || 1; 
            },
            'stroke-opacity': function(d) { 
                return d.data.strokeOpacity || 1; 
            },
        },
        labels: function(d) { 
            console.log(d.data);
            return d.data.label || d.node; 
        },
        edgeLabels: function(d) { 
            return d.data.label || d.edge; 
        },
        labelStyle: labelStyle,
        edgeLabelStyle: edgeLabelStyle,
        weights: function(d) { 
            return d.data.weight || "weight"; 
        },
    });
}

function toJSNXGraph(hg){
    var graph = new jsnx.Graph();
    var colorScale = d3.scale.category20();

    var fakeNodes = [];
    var fakeNodeId = Object.keys(hg.nodes).length + 1

    //console.log("Nodes ", Object.keys(hg.nodes).length);

    //generate edges
    Object.keys(hg.hyperedges).forEach((element, i) => {
        var heNodes = hg.hyperedges[element]["nodes"];
        //console.log(element, i);

        //add check if a he has a color

        var r = Math.floor((Math.random() * 50) + 1);
        var colorIndex = (i + r) % 20;
        var color = colorScale(colorIndex);

        //console.log(color, "-", colorIndex);

        heNodes.forEach(node => {
            graph.addEdge(node, fakeNodeId, {color: color});
        });

        fakeNodes.push(fakeNodeId);

        //handle fake nodes appearance
        graph.node.get(fakeNodeId).size = 1;
        graph.node.get(fakeNodeId).color = color;
        graph.node.get(fakeNodeId).label = " ";

        fakeNodeId++;
    });

    console.log(graph.edges(true));

    return graph;
}

