import React from 'react'

const ContactsList = ({contacts}) => {
 return (
    <div className="contact-list">

      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="contact-row"
        >

          <div className="avatar">
            {contact.first_name[0]}
          </div>

          <div className="contact-info">
            <h3>
              {contact.first_name} {contact.last_name}
            </h3>

            <p>{contact.role}</p>

            <small>{contact.organization}</small>
          </div>

          <div className="contact-details">
            <span>{contact.email}</span>
            <span>{contact.phone}</span>
          </div>

        </div>
      ))}

    </div>
  );
}

export default ContactsList