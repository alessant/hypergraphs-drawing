'use strict';

export function _convertToHypergraph(hg, data){
    hg.nodes = data["nodes"];
    hg.hyperedges = data["hyperedges"];

    return hg;
}  