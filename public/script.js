// Handle Form Submission 
document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    console.log('the name is:',name,'the email is: ',email, 'the message is: ',message);

    // Send data to the backend
    const response = await fetch('/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
    });

    console.log('The response return: ',response);

    const result = await response.json();
    alert(result.message);
});



// the code is cool so far *_*
