export const editNote = (message) => {
    let username = message.body.username
    let noteID = message.body.stickyNoteID
    // need to add actionIDs to operations
    if(actionID = "moveNotePos"){
        let newPos = message.body.newPos
        // handle the new pos update in the whiteboard 
        // => send update to clients
    }
    else if(actionID = "editNoteText"){
        let newText = message.body.newText
        // handle the new note text update in the whiteboard 
        // => send update to clients
    }

}

export const removeNote = (message) => {
    let username = message.body.username
    let noteID = message.body.stickyNoteID
    // check if note with noteID is present 
    // remove the note from the whiteboard 
    // send update

}