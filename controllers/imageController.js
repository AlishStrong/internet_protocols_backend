export const addImage = (message) => {
    let username = message.body.username
    let imageID = message.body.stickyNoteID
    let img = message.body.image
    let newPos = message.body.newPos
    // add the image to the whiteboard
    // => update to clients
}


export const editImage = (message) => {
    let username = message.body.username
    let imageID = message.body.stickyNoteID
    // need to add actionIDs to operations
    if(actionID = "moveImage"){
        let newPos = message.body.newPos
        // handle the new pos update in the whiteboard 
        // => send update to clients
    }
    else if(actionID = "editImageComment"){
        let newText = message.body.newText
        if(newText.length < 1){
            // remove the comment from the image
             // => send update to clients
        }
        else{
            // handle the new comment text update in the whiteboard 
            // => send update to clients
        }

    }

}

export const removeImage = (message) => {
    let username = message.body.username
    let imageID = message.body.stickyNoteID
    // check if image with imageID is present 
    // remove the imageID from the whiteboard 
    // send update

}