
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //get the submitted form
  document.querySelector('form').onsubmit = function () {
    send_mail()
    return false;
  }

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-view').innerHTML = `
    <ul class="list-group">
  <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
  <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
  <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
  <li class="list-group-item"><strong>TimeStamp:</strong>${email.timestamp}</li>
  <li class="list-group-item">${email.body}</li>
</ul>
    `;


      if (email.read) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: false
          })
        })

      }

      //archive button
      const btn = document.createElement('button');
      btn.innerHTML = email.archived ? "unarchive" : "archive";
      btn.className = email.archived ? "btn btn-danger" : "btn btn-success"
      btn.addEventListener('click', function () {

        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived:!email.archived
          })
        })
          .then(() => load_mailbox('archive'))


      });
      document.querySelector('#email-view').append(btn);

      //reply
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener('click', function () {
        compose_email();
        let subject = email.subject;
        if(subject.split(' ')[0] !="Re:")
        {
          subject="Re:"+subject;
        }
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `on ${email.timestamp} ${email.sender} wrote:${email.body}`;

      });
      document.querySelector('#email-view').append(btn_reply);


    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  //get the emails for the user
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      emails.forEach(singleemail => {

        const element = document.createElement('div');
        element.className = "list-group-item"
        element.innerHTML = `
<h5>${singleemail.recipients}</h5>
<h5>${singleemail.subject}</h5>
<p>${singleemail.timestamp}</p>

`;
        element.style = singleemail.read ? "background-color:gray;":"background-color:gray;";
        element.addEventListener('click', () => {
          view_email(singleemail.id);
        });
        document.querySelector('#emails-view').append(element);
      })
    }
    );
}

function send_mail() {
  //get the input data from the form
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //

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
      // Print result

      console.log(result);
      load_mailbox('sent')
    });

}