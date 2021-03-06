const express = require('express');
const router = express.Router();
const indy = require('../../indy/index');
const auth = require('../authentication');
let arraybloque;
let cripto;
let numero=1;

router.get('/', function (req, res, next) {
    res.send("Success");
});

router.post('/send_message', auth.isLoggedIn, async function (req, res) {
    let message = JSON.parse(req.body.message);
    message.did = req.body.did;

    await indy.crypto.sendAnonCryptedMessage(req.body.did, message);
    res.redirect('/#messages');
});

router.post('/send_connection_request', auth.isLoggedIn, async function (req, res) {
    let theirEndpointDid = req.body.did;
    let connectionRequest = await indy.connections.prepareRequest(theirEndpointDid);

    await indy.crypto.sendAnonCryptedMessage(theirEndpointDid, connectionRequest);
    res.redirect('/#relationships');
});

router.post('/issuer/create_schema', auth.isLoggedIn, async function (req, res) {
    await indy.issuer.createSchema(req.body.name_of_schema, req.body.version, req.body.attributes);

    
    res.redirect('/#issuing');
});

router.post('/issuer/create_cred_def', auth.isLoggedIn, async function (req, res) {
    await indy.issuer.createCredDef(req.body.schema_id, req.body.tag, req.body.cred_handler);
    res.redirect('/#issuing');
});

router.post('/issuer/send_credential_offer', auth.isLoggedIn, async function (req, res) {
    await indy.credentials.sendOffer(req.body.their_relationship_did, req.body.cred_def_id, req.body.cred_data);
            //Codigo del blockchain
            try {
                if (!arraybloque) {
                    cripto = await indy.blockchain.createGenesis();
                    arraybloque = await indy.blockchain.crearBlockchain(cripto);
                    //Arreglar esto
                    hashanterior = indy.blockchain.latestBlock(arraybloque) ;
                    let bloque = await indy.blockchain.creaBlock(numero, new Date().toLocaleDateString(), req.body.cred_data, cripto._hash);
                    //indy.blockchain.latestBlock(arraybloque);
                    //await indy.blockchain.computeHash(crypto);
                    await indy.blockchain.addBlock(arraybloque, bloque);
                    cripto = bloque;
                    numero=numero+1
                } else {
                    //Arreglar esto
                    //hashanterior = indy.blockchain.latestBlock(arraybloque) ;
                    
                    //indy.blockchain.latestBlock(arraybloque);
                    //await indy.blockchain.computeHash(crypto);
                    await indy.blockchain.addBlock(arraybloque, await indy.blockchain.creaBlock(numero, new Date().toLocaleDateString(), req.body.cred_data, cripto._hash));
                    cripto = await indy.blockchain.creaBlock(numero, new Date().toLocaleDateString(), req.body.cred_data, cripto._hash);
                    numero=numero+1;
                }
            } catch (error) {
                
            }
    res.redirect('/#issuing');
});

router.post('/credentials/accept_offer', auth.isLoggedIn, async function(req, res) {
    let message = indy.store.messages.getMessage(req.body.messageId);
    indy.store.messages.deleteMessage(req.body.messageId);
    await indy.credentials.sendRequest(message.message.origin, message.message.message);
    res.redirect('/#messages');
});

router.post('/credentials/reject_offer', auth.isLoggedIn, async function(req, res) {
    indy.store.messages.deleteMessage(req.body.messageId);
    res.redirect('/');
});

router.put('/connections/request', auth.isLoggedIn, async function (req, res) {
    let name = req.body.name;
    let messageId = req.body.messageId;
    let message = indy.store.messages.getMessage(messageId);
    indy.store.messages.deleteMessage(messageId);
    await indy.connections.acceptRequest(name, message.message.message.endpointDid, message.message.message.did, message.message.message.nonce);
    res.redirect('/#relationships');
});

router.delete('/connections/request', auth.isLoggedIn, async function (req, res) {
    // FIXME: Are we actually passing in the messageId yet?
    if (req.body.messageId) {
        indy.store.messages.deleteMessage(req.body.messageId);
    }
    res.redirect('/#relationships');
});

router.post('/messages/delete', auth.isLoggedIn, function(req, res) {
    indy.store.messages.deleteMessage(req.body.messageId);
    res.redirect('/#messages');
});

router.post('/proofs/accept', auth.isLoggedIn, async function(req, res) {
        await indy.proofs.acceptRequest(req.body.messageId);
        res.redirect('/#messages');
});

router.post('/proofs/send_request', auth.isLoggedIn, async function(req, res) {
    let myDid = await indy.pairwise.getMyDid(req.body.their_relationship_did);
    await indy.proofs.sendRequest(myDid, req.body.their_relationship_did, req.body.request_entry);
    res.redirect('/#proofs');
});

router.post('/proofs/validate', auth.isLoggedIn, async function(req, res) {
    try {
        let proof = req.body;
        if (await indy.proofs.validate(proof)) {
            res.status(200).send();
        } else {
            res.status(400).send();
        }
    } catch(err) {
        res.status(500).send();
    }
});

module.exports = router;
