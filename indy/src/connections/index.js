'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const uuid = require('uuid');

/*
urn:jwm:sovrin.org/connections/v1/offer

 */

/**
 * Establece los tipos de mensajes
 */
const MESSAGE_TYPES = {
    OFFER : "urn:sovrin:agent:message_type:sovrin.org/connection_offer",
    REQUEST : "urn:sovrin:agent:message_type:sovrin.org/connection_request",
    RESPONSE : "urn:sovrin:agent:message_type:sovrin.org/connection_response",
    ACKNOWLEDGE : "urn:sovrin:agent:message_type:sovrin.org/connection_acknowledge"
};
exports.MESSAGE_TYPES = MESSAGE_TYPES;

exports.handlers = require('./handlers');

/**
 * Esta funcion es preparar un pedido y enviarselo al Did destino
 * @param {*} theirEndpointDid 
 * @param {*} connection_alias 
 * @returns 
 */
exports.prepareRequest = async function (theirEndpointDid, connection_alias) {
    // FALTA COMENTAR
    let [myNewDid, myNewVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});
    
    
    await indy.pool.sendNym(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), myNewDid, myNewVerkey);

    let nonce = uuid();


    indy.store.pendingRelationships.write(myNewDid, theirEndpointDid, nonce, connection_alias);

    //Se enviara un mensaje a la DID asignada al principio del codigo.
    //Este mensaje sera de tipo PEDIDO, Y no tendra texto
    return {
        type: MESSAGE_TYPES.REQUEST,
        message: {
            did: myNewDid,
            endpointDid: await indy.did.getEndpointDid(),
            nonce: nonce
        }
    }
};

/**
 * Funcion
 * @param {*} theirEndpointDid 
 * @param {*} theirDid 
 * @param {*} requestNonce 
 * @returns 
 */
exports.acceptRequest = async function (theirEndpointDid, theirDid, requestNonce) {
    let [myDid, myVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});

    let theirVerkey = await sdk.keyForDid(await indy.pool.get(), await indy.wallet.get(), theirDid);

    // await sdk.storeTheirDid(await indy.wallet.get(), {
    //     did: theirDid,
    //     verkey: theirVerkey
    // });


    let meta = JSON.stringify({
        theirEndpointDid: theirEndpointDid,
        verified: false // Indicates that the owner of the agent has confirmed they want to stay connected with this person.
    });

    //FIXME: Check to see if pairwise exists
    await sdk.createPairwise(await indy.wallet.get(), theirDid, myDid, meta);

    // Send connections response
    let connectionResponse = {
        did: myDid,
        verkey: myVerkey,
        nonce: requestNonce
    };

    //Crea el mensaje de respuesta
    let message = {
        aud: theirDid,
        type: MESSAGE_TYPES.RESPONSE,
        message: await indy.crypto.anonCrypt(theirDid, JSON.stringify(connectionResponse))
    };
    //Envia el mensaje de respuesta al DID de destino
    return indy.crypto.sendAnonCryptedMessage(theirEndpointDid, message);
};


/**
 * Funcion que aceptara la solicitud de respuesta
 * @param {*} myDid 
 * @param {*} rawMessage 
 */
exports.acceptResponse = async function (myDid, rawMessage) {
    //Comprobara todas las relaciones pendientes y las almacenara en pendingRelationships
    let pendingRelationships = indy.store.pendingRelationships.getAll();
    //Se crea la variable relationships
    let relationship;
    //Se recorre cada una de las relaciones de pendingRelationships
    for (let entry of pendingRelationships) {
        //Si la DID de la relacion coincide con la que hemos introducido en la funcion entonces cojeremos la variable de relationship y la combertiremos en esa relacion
        if (entry.myNewDid === myDid) {
            relationship = entry;
        }
    }
    //Si la relacion es nula (o lo que es lo mismo, si ninguna DID de pendingRelationships coincidia con la DID inicial) sacara un mensaje de error
    if (!relationship) {
        throw Error("RelationshipNotFound");
    } 
    //En caso de que si se haya encontrado la una relacion con la DID entonces...
    else {
        // base64 decode
        let base64DecodedMessage = Buffer.from(rawMessage, 'base64');
        // anon decrypt
        let message = await indy.crypto.anonDecrypt(myDid, base64DecodedMessage);
        // retrieve theirEndpointDid, theirDid, connection_request_nonce
        let theirDid = message.did;
        let theirVerKey = message.verkey;
        //Si el nonce de la relacion y del mensaje no coinciden se enviara un mensaje de error informativo
        if (relationship.nonce !== message.nonce) {
            throw Error("NoncesDontMatch");
        //En caso de que si se encuentre
        } else {
            
            await sdk.storeTheirDid(await indy.wallet.get(), {
                did: theirDid,
                verkey: theirVerKey
            });

            let meta = JSON.stringify({
                name: relationship.name,
                alias: relationship.alias,
                theirEndpointDid: relationship.theirEndpointDid
            });

            await sdk.createPairwise(await indy.wallet.get(), theirDid, relationship.myNewDid, meta);
            // send acknowledge
            await exports.sendAcknowledgement(relationship.myNewDid, theirDid, relationship.theirEndpointDid);
            //Se borrara la relacion seleccionada de las relaciones en espera
            indy.store.pendingRelationships.delete(relationship.id);
        }
    }
};

//This function sends an acknowlegement
exports.sendAcknowledgement = async function (myDid, theirDid, theirEndpointDid) {
    await indy.crypto.sendAnonCryptedMessage(theirEndpointDid, await indy.crypto.buildAuthcryptedMessage(myDid, theirDid, MESSAGE_TYPES.ACKNOWLEDGE, "Success"));
    // await indy.proofs.sendRequest(myDid, theirDid, 'General-Identity');
};

//This function accept an acknowlegement
exports.acceptAcknowledgement = async function (theirDid, encryptedMessage) {
    let myDid = await indy.pairwise.getMyDid(theirDid);

    let message = await indy.crypto.authDecrypt(myDid, encryptedMessage);
    console.log(message);

    // await indy.proofs.sendRequest(myDid, theirDid, 'General-Identity');
};

// accept identity proof request, send identity proof and own proof request on identity

// accept identity proof (use same above to respond to identity proof)

// show in UI unverified relationships to be verified by the user.

// Relationship must be verified in order to issue credential to them.
