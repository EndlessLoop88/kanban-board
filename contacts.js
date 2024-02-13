let contacts = [
    {
        "name": "Andreas Pflaum",
        "e-mail": "andy@gmail.com",
        "tel": "0157733562"
    },
    {
        "name":'Lydia Lehnert',
        "e-mail":'lydia@gmail.com',
        "tel":'0157742434'

    },
    {
        "name":'Dimitrios Kapetanis',
        "e-mail":'dimi@gmail.com',
        "tel": '0157745677'
    }
    
];
let contactName = contacts['name'];

let letters = contacts.map(contact => contact.name.charAt(0)); // Erster Buchstabe vom Array contacts['name'] wird übernommen!

let twolettersName = contacts.map(contact =>{                   // Zwei Buchstaben werden übergeben zb. May Musstermann = MM !
    const nameSplit = contact.name.split(' ');
    const twoNummber = nameSplit.map(teil => teil.charAt(0));
    return twoNummber.join('');
});

function init(){
    contactList();
}

function newContactOpen() {
    let backround = document.getElementById('backround');
    backround.classList.add('animate');

}

function closeContact() {
    let backround = document.getElementById('backround');
    backround.classList.remove('animate');
}

function contactList(){
    let list = document.getElementById('newContacts');
    list.innerHTML = '';
     for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        list.innerHTML +=`
        <div>
        <div class="name-letter">${letters[i]}</div>
        <div class="contact-parting-line">
            <hr>
        </div>
        <div class="contacts" onclick="pushContact(${i})">
            <button class="button-name">${twolettersName[i]}</button>
            <div class="names">
                <p>${contact['name']} <br> <p class="mail">${contact['e-mail']}</p>
            </div>

        </div>
            
        </div>`;
        
        
     }
     
     
}
function pushContact(i){
    let pushContact = document.getElementById('push_contacts');
    pushContact.innerHTML ='';
    transformNewContacts();
    
    
    pushContact.innerHTML =`
                <div class="contacts-list">
                    <button class="button-name-contacts">${twolettersName[i]}</button>
                    <div>
                        <p class="contacts-name">${contacts['name']}</p>
                        <div class="edit-delet">
                            <p><img src="./img/edit.png"> Edit </p>
                            <p><img src="./img/delete.png"> Delete</p>
                        </div>
                    </div>
                </div>
                <div>
                    <p class="contact-information">Contact Information</p>
                </div>
                <div class="email-phone">

                    <p class="name-email-phone">Email</p> <br>
                    <a href=""></a> <br> <br>


                    <p class="name-email-phone"> Phone</p> <br>
                    <p></p>

                </div>

            </div>
    `;
    
}

function  transformNewContacts(){
    let pushContacts = document.getElementById('push_contacts');
    pushContacts.classList.add('animate');
}

function  transformCloseContacts(){
    let pushContacts = document.getElementById('push_contacts');
    pushContacts.classList.remove('animate');
}