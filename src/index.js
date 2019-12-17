// exports.printMsg = function() {
//     console.log("This is a message from the demo package");
// }

// import _ from 'lodash'

// function component(){
//     const element = document.createElement('div');

//     element.innerHTML = _.join(['Hello', 'webpack', 'alee'], ' ');

//     return element;
// }

// document.body.appendChild(component());

'use strict'

import * as classes from './classes';
import * as drawing from './drawing';

export{
    classes,
    drawing
};

export * from './classes';
export * from './drawing';
