let data = {
  highlights: [],
  colors: [],
};
let id = 0;

let initialize = () => {
  return;
};

//Listen for a request from the popup to highlight
chrome.runtime.onMessage.addListener((req, _sender, respond) => {
  //If the request is to highlight:
  if (req.type === 'highlight') {
    //Get the selected text
    let selectedText = window.getSelection();
    let selection = selectedText.toString();
    //If it is an empty selection, Return
    if (selection === '') return;

    let success = makeHighlitedNode(selectedText, req.color, id);
    if (success) {
      data.highlights.push(selection);
      data.colors.push(req.color);
      id++;
    } else {
      alert('Cannot highlight already highligted text');
    }
    //Responding is important, Otherwise It throws 'Recieving end does not exists' error

    respond({ color: 'Highlight Succesful!!' });
  } else if (req.type === 'initialize') {
    respond(data);
  } else if (req.type === 'download') {
    console.log('Request to download');
    let txt = '';
    for (let str of data.highlights) {
      txt = txt + str + '\n\n\n';
    }
    respond(txt);
  }
  //   console.log(data);
  //   saveInstant(data);
});
