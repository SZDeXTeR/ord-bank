document.addEventListener('DOMContentLoaded', function() {
    let menuToggle = document.querySelector('.toggle');
    let SideNavBar = document.querySelector('.navigation');

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        SideNavBar.classList.toggle('activeSideBar');
    })

    // Select the necessary elements
const copyButton = document.getElementById('copy-button');
const accountValue = document.getElementById('account-value');
const copyStatus = document.getElementById('copy-status');

// Add click event listener to the copy button
copyButton.addEventListener('click', () => {
  // Create a temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = accountValue.innerText;

  // Append the textarea to the document
  document.body.appendChild(textarea);

  // Select the content of the textarea
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand('copy');

  // Remove the temporary textarea
  document.body.removeChild(textarea);

  // Show the copy status message
  // copyStatus.textContent = 'Account copied !';
  alert('Copied !')
});

});