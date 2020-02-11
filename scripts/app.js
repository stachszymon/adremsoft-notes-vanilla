"use strict";

const
    LOCALSTORAGEKEY = "notes",
    NOTECREATIONMODAL = "noteCreationModal",
    NOTECREATIONSAVEBTN = "noteModalSaveBtn",
    NOTESCONTAINERID = "notes";

let notes = Array();

function printNotes(notes)
{
    const notesContainer = document.querySelector(`#${NOTESCONTAINERID}`);
    clearNotesContainer();
    notes.forEach(note => notesContainer.appendChild(createNoteDOM(note)));
    notesContainer.appendChild(createNewNoteDOM());
}

function clearNotesContainer()
{
    document.querySelector(`#${NOTESCONTAINERID}`).innerHTML = "";
}

function createNote()
{
    handleModal("CREATE");
}

function editNote(note)
{
    handleModal('EDIT', note);
}

function deleteNote(note)
{
    notes = notes.filter(n => n.id !== note.id);
    saveToLocalStorage(notes);
    printNotes(notes);
}

function storeNewNote(note)
{
    notes.push(note);
    saveToLocalStorage(notes);
    printNotes(notes);
}

function updateNote(note)
{
    const noteToEdit = notes.find(el => el.id === note.id);
    Object.assign(noteToEdit, note);
    saveToLocalStorage(notes);
    printNotes(notes);
}

function handleModal(action, data = {})
{
    const modal = document.querySelector(`#${NOTECREATIONMODAL}`);
    const saveBtn = document.querySelector(`#${NOTECREATIONSAVEBTN}`);

    function getAllNamedElQuery(){
        return `#${NOTECREATIONMODAL} [name]`;
    }

    function getNewNoteObject(){
        let obj = {};
        document.querySelectorAll(getAllNamedElQuery()).forEach(el => {
            obj[el.getAttribute('name')] = el.value;
        });
        return obj;
    }

    switch (action) {
        case "CREATE":
            modal.style.display = 'flex';
            saveBtn.onclick = _ => {
                storeNewNote(Object.assign(getNewNoteObject(), { id: uuid4() }));
                handleModal('CLOSE');
            };
            break;
        case "EDIT":
            modal.style.display = 'flex';
            document.querySelectorAll(getAllNamedElQuery()).forEach(el => {
                el.value = data[el.getAttribute('name')] || '';
            });
            saveBtn.onclick = _ => {
                updateNote(Object.assign(data, getNewNoteObject()));
                handleModal('CLOSE');
            };
            break;
        case "CLOSE":
            modal.style.display = 'none';
            document.querySelectorAll(getAllNamedElQuery()).forEach(el => el.value = '');
            break;
    }
}

function createNoteDOM(note)
{
    const noteDiv = document.createElement('div');
    noteDiv.classList += 'card col '+note.category;

    const cardHeader = document.createElement('div');
    cardHeader.classList += 'cardHeader';
    noteDiv.appendChild(cardHeader);

    const spanTitle = document.createElement('span');
    spanTitle.classList += 'title';
    spanTitle.setAttribute('title', note.title);
    spanTitle.innerText = note.title;
    cardHeader.appendChild(spanTitle);

    const buttonsContainer = document.createElement('div');
    cardHeader.appendChild(buttonsContainer);

    const editBtn = document.createElement('button');
    editBtn.classList += "btn btn-mid";
    editBtn.innerHTML = "&#x270E;";
    editBtn.onclick = _ => editNote(note);
    buttonsContainer.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.classList += "btn btn-red";
    delBtn.innerHTML = "&#x2716;";
    delBtn.onclick = _ => deleteNote(note);
    buttonsContainer.appendChild(delBtn);

    const cardBody = document.createElement('div');
    cardBody.classList += 'cardBody';
    cardBody.innerHTML = `${ note.subject ? `<p class='subject'>${note.subject}</p>` : "" }
                                <p class="content">${note.content}</p>`;
    noteDiv.appendChild(cardBody);

    return noteDiv;
}

function createNewNoteDOM()
{
    const noteDiv = document.createElement('div');
    noteDiv.classList += "addCart col";

    const createNoteButton = document.createElement('button');
    createNoteButton.classList += "addCartBtn";
    createNoteButton.onclick = _ => createNote();
    createNoteButton.innerText = "+";

    noteDiv.appendChild(createNoteButton);
    return noteDiv;
}

function saveToLocalStorage(notes)
{
    window.localStorage.setItem(LOCALSTORAGEKEY, JSON.stringify(notes));
}

function readFromLocalStorage()
{
    return JSON.parse(window.localStorage.getItem(LOCALSTORAGEKEY));
}

function uuid4()
{
    function hex (s, b)
    {
        return s +
            (b >>> 4 ).toString(16) +  // high nibble
            (b & 0b1111).toString(16);   // low nibble
    }

    let r = crypto.getRandomValues (new Uint8Array (16));

    r[6] = r[6] >>> 4 | 0b01000000; // Set type 4: 0100
    r[8] = r[8] >>> 3 | 0b10000000; // Set variant: 100

    return r.slice ( 0,  4).reduce(hex, '' ) +
        r.slice( 4,  6).reduce(hex, '-') +
        r.slice( 6,  8).reduce(hex, '-') +
        r.slice( 8, 10).reduce(hex, '-') +
        r.slice(10, 16).reduce(hex, '-');
}

document.addEventListener('DOMContentLoaded', _ => {
    notes = readFromLocalStorage() || [];
    printNotes(notes);

    document.querySelector('#search').addEventListener('change', e => {
        const v = e.target.value;
        if(v === ""){
            notes = readFromLocalStorage() || [];
            printNotes(notes);
        }else{
            notes = notes.filter(el => el.title.includes(v) || el.subject.includes(v) || el.content.includes(v));
            printNotes(notes);
        }
    });
});
