//initialization function, Runs everytime the pop up opens
//This is neccesary as everytime the pop up opens, It is entirely new
let initialize = () => {
  let request = {
    type: 'initialize',
  };
  sendRequest(request, (response) => {
    console.log(response);
    let col =
      response.colors.length > 0
        ? response.colors[response.colors.length - 1]
        : '#ffff00';
    document.getElementById('highlight-color').value = col;
    document.getElementById('Highlight').style.backgroundColor = col;
    // document.getElementById('highlight-color').value;
  });
};

//This utility function sends the given request/message to the popup
let sendRequest = (request, callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
      callback(response);
    });
  });
};

//This function sends a message to the cntent script and requests to highlight
let requestHighlight = () => {
  let color = document.getElementById('highlight-color').value;
  //TODO Add additional parameters to the request for colour
  let request = {
    type: 'highlight',
    color: color,
  };
  //Send the request to content script
  sendRequest(request, (response) => {
    return;
  });
};

let downloadTxt = () => {
  let request = {
    type: 'download',
  };
  sendRequest(request, (txt) => {
    let data = new Blob([txt], { type: 'text/plain' });
    let btn = document.createElement('a');
    btn.href = window.URL.createObjectURL(data);
    btn.download = 'highlights.txt';
    btn.click();
  });
};
let copyTxt = () => {
  sendRequest({ type: 'download' }, (txt) => {
    navigator.clipboard.writeText(txt);
  });
  document
    .getElementById('clipboard')
    .setAttribute('src', '/assets/icons/check.png');
};

//Add the onClick event listner to our button
document
  .getElementById('Highlight')
  .addEventListener('click', requestHighlight);
document.getElementById('download').addEventListener('click', downloadTxt);

document.getElementById('copy').addEventListener('click', copyTxt);

document.getElementById('highlight-color').addEventListener('input', () => {
  document.getElementById('Highlight').style.backgroundColor =
    document.getElementById('highlight-color').value;
});
initialize();
