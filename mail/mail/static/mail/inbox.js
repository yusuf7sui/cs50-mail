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
      email_div.className = `border rounded my-2 ${email.read ? 'bg-white' : 'bg-light text-muted'}`;
      email_div.style.cursor = 'pointer';

      const display_line = mailbox === 'sent' ? `To ${email.recipients.join(',')}` : `From ${email.sender}`;

      email_div.innerHTML = `
      <div class="d-flex justify-content-between">
        <div class="flex-grow-1">${display_line}</div>
        <div class="flex-grow-3 text-truncate mx-3">${email.subject}</div>
        <div class="flex-grow-1 text-right">${email.timestamp}</div>
      </div>
      `;

      email_div.addEventListener('click', () => load_email(email.id, mailbox));
      document.querySelector('#emails-view').append(email_div);
    });
  });
}

function load_email(email_id, mailbox){
  fetch(`emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
      document.querySelector('#emails-view').innerHTML = `
      <h3>${email.subject}</h3>
      <div class="d-flex justify-content-between">
        <div>
           <div> <strong>From:</strong> ${email.sender}</div>
           <div> <strong>To:</strong> ${email.recipients.join(', ')}</div>
        </div>
        <div>${email.timestamp}</div>
      </div>
      <p class="mt-3">${email.body}</p>
      `;

      if (mailbox ==='inbox' || mailbox === 'archive') {
        const archive_button = document.createElement('button');
        archive_button.className ='btn btn-primary';
        archive_button.innerText = email.archived ? 'Unarchive' : 'Archive';

        archive_button.addEventListener('click', () => {
          fetch(`emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
          })
          .then(() => load_mailbox('inbox'))
        })        
        document.querySelector('#emails-view').appendChild(archive_button);
      }
      mark_read(email_id);
  })
}

function mark_read(email_id) {
  fetch(`emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}