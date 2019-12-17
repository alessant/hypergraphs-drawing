'use strict';

import * as utils from './utils.js';

export default class Hypergraph{

    constructor(data){
        if(!(this instanceof Hypergraph)){
            return new Hypergraph(data);
        }

        this.nodes = {};
        this.hyperedges = {}

        if (data != null){
            //utils._convertToHypergraph(this, data)
            this.nodes = data["nodes"];
            this.hyperedges = data["hyperedges"];
        }
    }
  
}//end Hypergraph class
