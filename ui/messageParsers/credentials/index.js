'use strict';
const indy = require('../../../indy');

//Este método se encarga de responder cuando nos piden una credencial, puede aceptar y enviarsela o denegar y no enviarla.

exports.credentialOffer = async function (message) {
    let theirDid = message.message.origin;
    message.relationshipName = await indy.pairwise.getAttr(theirDid, 'name');
    message.links = [
        {
            name: "Accept",
            href: "/api/credentials/accept_offer",
            method: "POST",
            message: JSON.stringify({
                messageId: message.id
            })
        },
        {
            name: "Reject",
            href: "/api/credentials/reject_offer",
            method: "POST",
            message: JSON.stringify({
                messageId: message.id
            })
        }
    ];

    return message;
};
