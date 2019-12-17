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
        config, optBind){
    console.log("Draw");
    console.log(hg);

    var graph = toJSNXGraph(hg);

    console.log(graph);

    jsnx.draw(graph, {
        //element: '#canvas',
        element: `#${element}`, 
        width: width,
        height: height,
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
        }
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

        fakeNodeId++;
    });

    console.log(graph.edges(true));

    
    // fakeNodes.forEach((fNode, i) => {
    //     console.log(fNode, i);

    //     graph.node.get(fNode).size = 1;
    //     graph.node.get(fNode).color = "fff";
    // });

    return graph;
}

// function toJSNXGraph(hg){
//     var graph = new jsnx.Graph();
//     var color = d3.scale.category20();

//     console.log(color);

//     Object.keys(hg.nodes).forEach(node => {
//         graph.addNode(parseInt(node));
//     });

//     graph.addNodesFrom(hg.fakeNodes);
//     console.log(graph.nodes());

//     console.log(hg.edges);
//     graph.addEdgesFrom(hg.edges);
//     console.log(graph.edges());

//     return graph;
// }