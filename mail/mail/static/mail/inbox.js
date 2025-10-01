document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    emails.forEach(email => {
      const email_div = document.createElement('div');
      email_div.className= `border rounded my-2 ${email.read ? 'bg-light' : 'bg-white'}`
      email_div.style.cursor = 'pointer';

      const display_line = mailbox === 'sent' ? `To ${email.recipients.join(',')}` : `From ${email.sender}`

      email_div.innerHTML = `
      <div class="d-flex justify-content-between">
        <div class="flex-grow-1">${display_line}</div>
        <div class="flex-grow-3 text-truncate mx-3">${email.subject}</div>
        <div class="flex-grow-1 text-right">${email.timestamp}</div>
      </div>
      `;

      email_div.addEventListener('click', () => load_email(email.id))
      document.querySelector('#emails-view').append(email_div);
    });
  });
}

function load_email(mail_id){
  //TODO:
  //First make a get request to show mail data
  //Afterwards via put request mark as read.
}