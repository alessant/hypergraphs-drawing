'use strict';

import Hypergraph from './Hypergraph';

export default class DrawableHypergraph extends Hypergraph{

    constructor(data){
        super(data);

        this.fakeNodes = [];
        this.edges = [];

        this._populateGraphData(this.fakeNodes, this.edges);

        console.log("Fake nodes: ", this.fakeNodes);
        console.log("Fake edges:", this.edges);
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