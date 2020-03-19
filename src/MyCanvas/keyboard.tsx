import React from "react";
import {Redo, Undo} from '../Common/UndoAndRedo';


const onClick = (e: KeyboardEvent) =>{
    if(e.ctrlKey){
        switch(e.code){
            case "KeyZ":Undo();break;
            case "KeyY":Redo();break;
        }
    }
    //console.log(e.code)
}


export{
    onClick
}