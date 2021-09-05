'use strict';
const sdk = require('indy-sdk');
//const blockchain = require('../../../ui/blockchain/blockchain.js');
const indy = require('../../index.js');
const blockchain = require('../blockchain/index.js');
const { obtenerCompra } = require('../blockchain/index.js');
var i=1;


exports.createSchema = async function (name, version, attributes) {

    try {

        BlockChain =  indy.blockchain.crearBlockchain();
        bloque =  indy.blockchain.creaBlock(1,Date.now,attributes,"816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
        indy.blockchain.addBlock(BlockChain,bloque);
    } catch (error) {
        
    }
    
  
    let [id, schema] = await sdk.issuerCreateSchema(await indy.did.getEndpointDid(), name, version, [attributes]);
    let schemaRequest = await sdk.buildSchemaRequest(await indy.did.getEndpointDid(), schema);
    await sdk.signAndSubmitRequest(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), schemaRequest);
    await indy.did.pushEndpointDidAttribute('schemas', id);
};

exports.getSchemas = async function () {
    let metadata = JSON.parse(await sdk.getDidMetadata(await indy.wallet.get(), await indy.did.getEndpointDid()));
    let schemas = [];
    for (let schemaId of metadata.schemas) {
        let schema = await indy.issuer.getSchema(schemaId);
        schemas.push(schema);
    }
    return schemas;
};

exports.createCredDef = async function (schemaId, tag) {
    let schema = await exports.getSchema(schemaId);
    let [credDefId, credDefJson] = await sdk.issuerCreateAndStoreCredentialDef(await indy.wallet.get(), await indy.did.getEndpointDid(), schema, tag, 'CL', '{"support_revocation": false}');
    let credDefRequest = await sdk.buildCredDefRequest(await indy.did.getEndpointDid(), credDefJson);
    await sdk.signAndSubmitRequest(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), credDefRequest);
    credDefJson.schemaId_long = schemaId;
    await indy.did.pushEndpointDidAttribute('credential_definitions', credDefJson);
};

exports.sendSchema = async function(poolHandle, walletHandle, Did, schema) {
    let schemaRequest = await sdk.buildSchemaRequest(Did, schema);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
};

exports.sendCredDef = async function (poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await sdk.buildCredDefRequest(did, credDef);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
};

exports.getSchema = async function(schemaId) {
    let getSchemaRequest = await sdk.buildGetSchemaRequest(await indy.did.getEndpointDid(), schemaId);
    let getSchemaResponse = await sdk.submitRequest(await indy.pool.get(), getSchemaRequest);
    let [, schema] = await sdk.parseGetSchemaResponse(getSchemaResponse);
    return schema;
};

exports.getCredDef = async function(poolHandle, did, credDefId) {
    let getCredDefRequest = await sdk.buildGetCredDefRequest(did, credDefId);
    let getCredDefResponse = await sdk.submitRequest(poolHandle, getCredDefRequest);
    return await sdk.parseGetCredDefResponse(getCredDefResponse);
};

exports.getCredDefByTag = async function(credDefTag) {
    let credDefs = await indy.did.getEndpointDidAttribute('credential_definitions');
    for(let credDef of credDefs) {
        if(credDef.tag === credDefTag) {
            return credDef;
        }
    }
};
/*'use strict';
const sdk = require('indy-sdk');
//const blockchain = require('../../../ui/blockchain/blockchain.js');
const indy = require('../../index.js');
const blockchain = require('../blockchain/index.js');
const { obtenerCompra } = require('../blockchain/index.js');
var i=1;
var crear=0;


exports.createSchema = async function (name, version, attributes) {
    if(crear < 3){
        //Blockchain = await blockchain.crearBlockchain();
        crear += 1;
        console.info("Este es el numero ",crear);
    }
    //try {

        //BlockChain =  indy.blockchain.crearBlockchain();
        //bloque =  indy.blockchain.creaBlock(1,Date.now,attributes,"816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
        //indy.blockchain.addBlock(BlockChain,bloque);
    //} catch (error) {
    //    
    //}
    
    
    let [id, schema] = await sdk.issuerCreateSchema(await indy.did.getEndpointDid(), name, version, [attributes]);
    let schemaRequest = await sdk.buildSchemaRequest(await indy.did.getEndpointDid(), schema);
    await sdk.signAndSubmitRequest(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), schemaRequest);
    await indy.did.pushEndpointDidAttribute('schemas', id);
    
};

exports.getSchemas = async function () {
    let metadata = JSON.parse(await sdk.getDidMetadata(await indy.wallet.get(), await indy.did.getEndpointDid()));
    let schemas = [];
    for (let schemaId of metadata.schemas) {
        let schema = await indy.issuer.getSchema(schemaId);
        schemas.push(schema);
    }
    return schemas;
};

exports.createCredDef = async function (schemaId, tag) {
    let schema = await exports.getSchema(schemaId);
    let [credDefId, credDefJson] = await sdk.issuerCreateAndStoreCredentialDef(await indy.wallet.get(), await indy.did.getEndpointDid(), schema, tag, 'CL', '{"support_revocation": false}');
    let credDefRequest = await sdk.buildCredDefRequest(await indy.did.getEndpointDid(), credDefJson);
    await sdk.signAndSubmitRequest(await indy.pool.get(), await indy.wallet.get(), await indy.did.getEndpointDid(), credDefRequest);
    credDefJson.schemaId_long = schemaId;
    await indy.did.pushEndpointDidAttribute('credential_definitions', credDefJson);
};

exports.sendSchema = async function(poolHandle, walletHandle, Did, schema) {
    let schemaRequest = await sdk.buildSchemaRequest(Did, schema);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
};

exports.sendCredDef = async function (poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await sdk.buildCredDefRequest(did, credDef);
    await sdk.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
};

exports.getSchema = async function(schemaId) {
    let getSchemaRequest = await sdk.buildGetSchemaRequest(await indy.did.getEndpointDid(), schemaId);
    let getSchemaResponse = await sdk.submitRequest(await indy.pool.get(), getSchemaRequest);
    let [, schema] = await sdk.parseGetSchemaResponse(getSchemaResponse);
    return schema;
};

exports.getCredDef = async function(poolHandle, did, credDefId) {
    let getCredDefRequest = await sdk.buildGetCredDefRequest(did, credDefId);
    let getCredDefResponse = await sdk.submitRequest(poolHandle, getCredDefRequest);
    return await sdk.parseGetCredDefResponse(getCredDefResponse);
};

exports.getCredDefByTag = async function(credDefTag) {
    let credDefs = await indy.did.getEndpointDidAttribute('credential_definitions');
    for(let credDef of credDefs) {
        if(credDef.tag === credDefTag) {
            return credDef;
        }
    }
};*/
