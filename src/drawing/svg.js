const d3 = require('d3');

export function draw(
    hg, 
    element,
    width=600,
    height=600,
    strength=-60,
    linkDistance=40,
    linkStrength=1,
    theta=0.8,
    radius=10,
    nodeColor="#999",
    nodeColors=null,
    nodeStroke=null,
    nodeStrokes=null,
    strokeWidth=0,
    strokeWidths=null,
    nodeOpacity=1,
    nodeOpacities=null,
    strokeOpacity=1,
    strokeOpacities=null,
    withNodeLabels=true,
    nodeLabels=null,
    nodeLabelsAttr=null,
    nodeLabelsStyle=null,
    withNodeMetadataOnHover=false,
    withNodeWeight=false,
    edgeColors=null, 
    withEdgeLabels=false, 
    withHyperedgesMetadataOnHover=false)
{
    var hypergraph = function (links,nodes) {
        var obj;
        var hyper = [];
        var	i;
        var	j;
        var	k;
        var nodesSelfloop={};

        links.forEach((d, index) => {
            
            var color = (edgeColors != null) ? edgeColors[index] : getRandomColor();
   
            //if link length >2 there's an Hyperlink: i need to create a connection node
            if (d.link.length > 2) {
            //connection node id creation
                var	id = 'ln';
                for(k = 0; k < d.link.length; k++) {
                    id += d.link[k];
                }
            //connection node creation
                i = {id: id, link: true, heid: (index+1)};
            //add the connection node to the node array
                nodes.push(i);
            //creation of the link from every node of the connection set to the connection node
                for (j = 0; j < d.link.length; j++) {
               
                    hyper.push({source: d.link[j], target: i.id, he: d.he, heid:(index+1), color: color});
                }
            }else{
                if (d.link.length == 1) {
                    
                    if(nodesSelfloop[d.link[0]] == undefined)
                    {
                        nodesSelfloop[d.link[0]] = 10;
                 
                    }
                    nodesSelfloop[d.link[0]]=nodesSelfloop[d.link[0]]+13;
                    link = {source: d.link[0], target: d.link[0], size : nodesSelfloop[d.link[0]], he: d.he, heid: (index+1), color: color}
                    hyper.push(link);
                    
                }else
            //if link < 2 then the connection is the traditional one w/o connection node
                hyper.push({source: d.link[0], target: d.link[1], he: d.he, heid: (index+1), color: color});
            }

        });
       
         var obj  = {links:hyper,nodes:nodes};
         return obj;
    }
    
    var dataMarker = { id: 0, name: 'circle', path: 'M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0', viewbox: '-6 -6 12 12' };
    var nodeId = 0;
    var fakeNodeRadius=0;

    //zoom handler
    var zoom = d3.zoom()
        .scaleExtent([1/2, 10])
        .on("zoom", zoomed);
    
    //drag handler
    var drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    
    //svg creation	
    var svg = d3.select(`#${element}`)
                .append("svg:svg")
                .attr("width", width)
                .attr("height", height)
                .call(zoom)
                .append("g");
        
    //defs creation for markers
    var defs = svg.append("defs");
    
    //force layout definition	
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().distance(linkDistance).strength(linkStrength))//id(function(d) { return d.id; }))//.distance(80).strength(1))
        .force("charge", d3.forceManyBody().theta(theta).strength(strength).distanceMin(30).distanceMax(200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(50));
    
    //data reading from json file 
        
    var graph = {"nodes":[],"links":[]};
     


    Object.keys(hg.vertices).forEach((element, i) => {
        //console.log(element);
        graph.nodes.push( 
            {
                id : element,
                hvertex : hg.vertices[element]
            });
        
    });

    Object.values(hg.hyperedges).forEach((element, i) => {
        var l = {link:null,he:element}
        
        var link = []
        l.link = link
        Object.keys(element.vertices).forEach( (element) => {
            link.push(element)
        });
        graph.links.push(l);
    });


    var nodes = graph.nodes,
        links = graph.links,
        bilinks = [];
    //d3.hypergraph invocation passing links and nodes 
    var data = hypergraph(links,nodes);


    //d3.hypergraph links
    links = data.links;
    //d3.hypergraph nodes
    nodes = data.nodes;

    // console.log(nodes);
    // console.log(links);

    //node mapping by id
    var nodeById = d3.map(nodes, function(d) { return d.id; });
    var intermediates = 0;
    
    links.forEach(function (link){
    var s = link.source = nodeById.get(link.source),
        t = link.target = nodeById.get(link.target),
        i = {}; // intermediate node

        if (s.id == t.id) {
            t.self = true;
            i.size = link.size;
            
        }
        i.he = link.he
        i.weight = link.he.vertices[link.source.id];
        i.iid = intermediates++;
        i.heid = link.heid;

        nodes.push(i);

        t.color = link.color;
        i.color = link.color;
    
        links.push({source: s, target: i, color: link.color}, {source: i, target: t, color:link.color});
        bilinks.push([s, i, t]);
    });

    //console.log(intermediates);

    /*
    * VISUALIZATION
    */

    var pathIds = {}

    /*
    * LINK CREATION
    */
    var link = svg.selectAll(".link")
        .data(bilinks)
        .enter().append("path")
        .attr("id", function(d){
            //console.log(d);
            var label = false;
            if (d[0].id == d[2].id || !d[2].link)
                label = true;
            pathIds["path" + d[0].id + d[1].iid + d[2].id] = {weight: d[1].weight, heid: d[1].heid, label: label};
            return "path" + d[0].id + d[1].iid + d[2].id;
        })
        .attr("class", "link")
        .style("stroke", function(d){
            return d[1].color;
        })
        .attr("stroke-width", "3px")
        .attr("fill", "none");

    //console.log(pathIds)
    if (withHyperedgesMetadataOnHover){
        link.append("title")
            .text(function(d) { 
                return d[1].he.metadata
        });
    }

       
    var path = svg.selectAll("g")
            .data(Object.keys(pathIds))
            .enter()
            .append("text")
            .append("textPath")
            .attr("xlink:href", function(d){
                return "#" + d;
            })
            .style("font-size", "14px")  
            .style("text-anchor","middle") //place the text halfway on the arc
            .attr("startOffset", "50%")
            .text(function(d) { 
                    //console.log(pathIds[d]);
                    // if (withEdgeLabels && withNodeWeigth)
                    //     return pathIds[d].heid + " - " + pathIds[d].weight;
                    // if (withEdgeLabels)
                    //     return pathIds[d].heid;
                    if (withNodeWeight)
                        return pathIds[d].weight;
            });
            //.style("font-weight", "bold");


    svg.selectAll("g")
        .data(Object.keys(pathIds))
        .enter()
        .append("text")
        .append("textPath")
        .attr("xlink:href", function(d){
            return "#" + d;
        })
        .style("font-size", "14px") 
        .style("text-anchor","middle") //place the text halfway on the arc
        .style("dominant-baseline", "text-before-edge")
        .attr("startOffset", "50%")
        .text(function(d) { 
            //console.log(d);
                //console.log(pathIds[d]);
                // if (withEdgeLabels && withNodeWeigth)
                //     return pathIds[d].heid + " - " + pathIds[d].weight;
                if (withEdgeLabels)
                    if (pathIds[d].label)
                        return pathIds[d].heid;
                // if (withNodeWeigth)
                //     return pathIds[d].weight;
        })
        .style("font-weight", "bold");

    /*
    * NODE CREATION
    */
    var node = svg.selectAll(".node")
        .data(nodes.filter(function(d) { 
                return d.id;
            }))
        .enter().append("g")
        .attr("class", "node");

    node.append("circle")
        .attr("class", function(d){
            if (d.link){
                return "linknode";
            }else{
                return "node";
            }
        })
        .attr("r", function(d){
            if (d.link){
                return fakeNodeRadius;
            }else{
                return radius;
            }
        })
        .attr("fill", function(d) {
            if (d.link)
                return "rgb(100,100,100)";
            else
                return (nodeColors != null) ? nodeColors[d.id-1] : nodeColor;    
            })
        .attr("stroke", function(d) {
            if (d.link)
                return undefined;
            else
                return (nodeStrokes != null) ? nodeStrokes[d.id-1] : nodeStroke;    
        })
        .attr("stroke-width", function(d) {
            if (d.link)
                return 0;
            else
                return (strokeWidths != null) ? strokeWidths[d.id-1] : strokeWidth;    
        })
        .attr("opacity", function(d) {
            if (d.link)
                return 0;
            else
                return (nodeOpacities != null) ? nodeOpacities[d.id-1] : nodeOpacity;    
        })
        .attr("stroke-opacity", function(d) {
            if (d.link)
                return 0;
            else
                return (strokeOpacities != null) ? strokeOpacities[d.id-1] : strokeOpacity;    
        })
        .attr('cursor', 'pointer');
 
    if (withNodeLabels){
        var labelAttr = {
            'font-size': 14,
        };

        var labelStyle = {
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'cursor': 'pointer',
            '-webkit-user-select': 'none',
            'fill': '#000'
        }

        if (nodeLabelsAttr != null)
            labelAttr = nodeLabelsAttr;
        
        if (nodeLabelsStyle != null)
            labelStyle = nodeLabelsStyle;

        node.append("text")
            .text(function(d) { 
                if (!d.link)
                    return (nodeLabels != null) ? nodeLabels[d.id - 1] : d.id; 
                return null;		
            });

        Object.keys(labelAttr).forEach(elem => {
            node.selectAll("text")
                .attr(elem, labelAttr[elem]);
        });

        Object.keys(labelStyle).forEach(elem => {
            node.selectAll("text")
                .style(elem, labelStyle[elem]);
        });
    }
       
              
    if (withNodeMetadataOnHover){
        node.append("title")
            .text(function(d) { 
                if (!d.link) return d.hvertex.metadata; 
                    return null;
            });
    }	  


    node.call(drag);

    /* link data */
    if (withEdgeLabels){
        //at least three vertices in the hyperedge
        node.append("text")
            .text(function(d) { 
                //console.log(d);
                if (d.link)
                    return d.heid;		
        })
        .style("font-weight", "bold")
        .style("font-size", "14px") ;   
        
        //two or only a single node in the
        // svg.selectAll("g")
        // .data(Object.keys(pathIds))
        // .enter()
        // .append("text")
        // .append("textPath")
        // .attr("xlink:href", function(d){
        //     return "#" + d;
        // })
        // .style("font-size", "10px")  
        // .style("text-anchor","middle") //place the text halfway on the arc
        // .attr("startOffset", "50%")
        // .text(function(d) { 
        //         //console.log(pathIds[d]);
        //         return pathIds[d];
        // })
        // .style("font-weight", "bold");
    }

      
    //sphere marker
    var marker = defs.append("marker")
        .attr("id","circleMarker")
        .attr("markerHeight", 5)
        .attr("markerWidth", 5)
        .attr("markerUnits", "strokeWidth")
        .attr("orient", "auto")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("viewBox", "-6 -6 12 12")
        .append("path")
        .attr("d","M 0, 0  m -5, 0  a 5,5 0 1,0 10,0  a 5,5 0 1,0 -10,0")
        .attr("fill","black");
            
    simulation
        .nodes(nodes)
        .on("tick", ticked)
        .force("link")
        .links(links);
    
    
    /*
    * HELPER FUNCTIONS
    */
    function ticked() {
        link.attr("d", positionLink);
        node.attr("transform", positionNode);
        //intermediate.attr("transform", positionNode);
    }
   
    function positionLink(d) {

        var
        x1 = d[1].x,
        y1 = d[1].y,
        x2 = d[1].x,
        y2 = d[1].y;

        //console.log(x1, " ", x2);

        if (d[2].self) {
     
            var
                x1 = d[0].x,
                y1 = d[0].y,
                x2 = d[0].x,
                y2 = d[0].y,
                dx = x2 - x1,
                dy = y2 - y1,
                dr = Math.sqrt(dx * dx + dy * dy),
                drx = dr,
                dry = dr,
                xRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0

            // Self edge.
            if (x1 === x2 && y1 === y2) {
                xRotation = -45;
                largeArc = 1;
                drx = d[1].size;//d[2].size //d[2].linkid * 10;
                dry = d[1].size;//d[2].size //d[2].linkid * 10;
                x2 = x2 + 1;
                y2 = y2 + 10;
                x1 = x1 + 10;
                y1 = y1 + 1;
            }
            return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + xRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
        }
        var diffX0, diffY0, diffX2, diffY2, pathLength01, pathLength12, offsetX0, offsetY0, offsetX2, offsetY2;

        diffX0 = d[0].x - d[1].x;
        diffY0 = d[0].y - d[1].y;
        diffX2 = d[2].x - d[1].x;
        diffY2 = d[2].y - d[1].y;

        pathLength01 = Math.sqrt((diffX0 * diffX0) + (diffY0 * diffY0));
        pathLength12 = Math.sqrt((diffX2 * diffX2) + (diffY2 * diffY2));

        offsetX0 = (diffX0 * radius) / pathLength01;
        offsetY0 = (diffY0 * radius) / pathLength01;
        if (!d[2].link) {
            offsetX2 = (diffX2 * radius) / pathLength12;
            offsetY2 = (diffY2 * radius) / pathLength12;
        } else {
            offsetX2 = (diffX2 * fakeNodeRadius) / pathLength12;
            offsetY2 = (diffY2 * fakeNodeRadius) / pathLength12;
        }

        var x0Pos, y0Pos, x2Pos, y2Pos;

        if (d[0].link) {
            x0Pos = d[0].x;
            y0Pos = d[0].y;
        } else {
            x0Pos = d[0].x - offsetX0;
            y0Pos = d[0].y - offsetY0;
        }
        if (d[2].link) {
            x2Pos = d[2].x;
            y2Pos = d[2].y;
        } else {
            x2Pos = d[2].x - offsetX2;
            y2Pos = d[2].y - offsetY2;
        }


        return "M" + x0Pos + "," + y0Pos
            + "S" + d[1].x + "," + d[1].y
            + " " + x2Pos + "," + y2Pos;
    }
    
    function positionNode(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
    
    function dragstarted(d) {
        
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x, d.fy = d.y;
      d3.event.sourceEvent.stopPropagation();
    }
    
    function dragged(d) {
      d.fx = d3.event.x, d.fy = d3.event.y;
    }
    
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null, d.fy = null;
    }
    
    function zoomed() {
      svg.attr("transform", d3.event.transform);
    }   

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';

        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)]; 
        }
        return color;
    }
}