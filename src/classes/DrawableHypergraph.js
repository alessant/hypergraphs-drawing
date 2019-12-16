'use strict';

import Hypergraph from './Hypergraph';

export default class DrawableHypergraph extends Hypergraph{

    constructor(data){
        super(data);

        var fakeNodes = [];
        var edges = [];

        this._populateGraphData(fakeNodes, edges);

        console.log(fakeNodes);
        console.log(edges);
    }


    _populateGraphData(fakeNodes, edges){
        var fakeNodeId = Object.keys(this.nodes).length + 1

        Object.keys(this.hyperedges).forEach(element => {
            var heNodes = this.hyperedges[element]["nodes"];

            heNodes.forEach(node => {
                edges.push([node, fakeNodeId]);
            });

        });

        fakeNodes.push(fakeNodeId);
        fakeNodeId++;
    }

}//end class DrawableHypergraph