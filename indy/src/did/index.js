'use strict';
const sdk = require('indy-sdk');
const indy = require('../../index.js');
const config = require('../../../config');
let endpointDid;
let publicVerkey;
let stewardDid;
let stewardKey;
let stewardWallet;

//Crea el Did(identidad descentralizada)

exports.createDid = async function (didInfoParam) {
    let didInfo = didInfoParam || {};
    return await sdk.createAndStoreMyDid(await indy.wallet.get(), didInfo);
};

//Devuelve el EndpointDid

exports.getEndpointDid = async function() {
    if(!endpointDid) {
        let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
        for (let didinfo of dids) {
            let meta = JSON.parse(didinfo.metadata);
            if (meta && meta.primary) {
                endpointDid = didinfo.did;
            }
        }
        if(!endpointDid) {
            await exports.createEndpointDid();
        }
    }
    return endpointDid;
};

//Crea el EndpointDid

exports.createEndpointDid = async function () {
    await setupSteward();

    [endpointDid, publicVerkey] = await sdk.createAndStoreMyDid(await indy.wallet.get(), {});
    let didMeta = JSON.stringify({
        primary: true,
        schemas: [],
        credential_definitions: []
    });
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, didMeta);

    await indy.pool.sendNym(await indy.pool.get(), stewardWallet, stewardDid, endpointDid, publicVerkey, "TRUST_ANCHOR");
    await indy.pool.setEndpointForDid(endpointDid, config.endpointDidEndpoint);
    await indy.crypto.createMasterSecret();

    // await issueGovernmentIdCredential();
};

//Declara el EndpointDidAttribute 

exports.setEndpointDidAttribute = async function (attribute, item) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), endpointDid);
    metadata = JSON.parse(metadata);
    metadata[attribute] = item;
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, JSON.stringify(metadata));
};

//Asigna el EndpointDidAttribute

exports.pushEndpointDidAttribute = async function (attribute, item) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), endpointDid);
    metadata = JSON.parse(metadata);
    if (!metadata[attribute]) {
        metadata[attribute] = [];
    }
    metadata[attribute].push(item);
    await sdk.setDidMetadata(await indy.wallet.get(), endpointDid, JSON.stringify(metadata));
};

exports.getEndpointDidAttribute = async function (attribute) {
    let metadata = await sdk.getDidMetadata(await indy.wallet.get(), endpointDid);
    metadata = JSON.parse(metadata);
    return metadata[attribute];
};

exports.getTheirEndpointDid = async function (theirDid) {
    let pairwise = await sdk.getPairwise(await indy.wallet.get(), theirDid);
    let metadata = JSON.parse(pairwise.metadata);
    return metadata.theirEndpointDid;
};

async function setupSteward() {
    let stewardWalletName = `stewardWalletFor:${config.walletName}`;
    try {
        await sdk.createWallet({id: stewardWalletName}, {key: 'whatever'});
    } catch (e) {
        if (e.message !== 'WalletAlreadyExistsError') {
            console.warn('create wallet failed with message: ' + e.message);
            throw e;
        }
    } finally {
        console.info('wallet already exist, try to open wallet');
    }

    stewardWallet = await sdk.openWallet(
        {id: stewardWalletName},
        {key: 'whatever'}
    );

    let stewardDidInfo = {
        'seed': '000000000000000000000000Steward1'
    };

    [stewardDid, stewardKey] = await sdk.createAndStoreMyDid(stewardWallet, stewardDidInfo);

}

// exports.createGovCredDef = async function () {
//   let schemaName = 'Government-ID';
//   let schemaVersion = '1.1';
//   let signatureType = 'CL';
//   let govIdSchemaId;
//   let govIdSchema;
//   let govIdCredDefId;
//   let govIdCredDef;
//   try {
//     [govIdSchemaId, govIdSchema] = await sdk.issuerCreateSchema(stewardDid, schemaName, schemaVersion, [
//       'name',
//       'email',
//       'tax_id'
//     ]);
//
//     await indy.issuer.sendSchema(await indy.pool.get(), stewardWallet, stewardDid, govIdSchema);
//     govIdSchema = await indy.issuer.getSchema(govIdSchemaId);
//     [govIdCredDefId, govIdCredDef] = await sdk.issuerCreateAndStoreCredentialDef(stewardWallet, stewardDid, govIdSchema, 'GOVID', signatureType, '{"support_revocation": false}');
//     await indy.issuer.sendCredDef(await indy.pool.get(), stewardWallet, stewardDid, govIdCredDef);
//     await exports.pushEndpointDidAttribute('credential_definitions', govIdCredDef);
//
//     exports.setEndpointDidAttribute('govIdCredDefId', govIdCredDefId);
//   } catch(e) {
//     console.log(e);
//   }
// };

// exports.setGovCredDefID = async function (govCredDefId) {
//   try {
//     await exports.setEndpointDidAttribute('govIdCredDefId', govCredDefId);
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.issueGovCred = async function () {
//   try {
//     let [govIdCredDefId, govIdCredDef] = await indy.issuer.getCredDef(await indy.pool.get(), stewardDid, await exports.getGovIdCredDefId());
//
//
//     // let govIdCredDef = await indy.issuer.getCredDefByTag('GOVID');
//
//     let govIdCredOffer = await sdk.issuerCreateCredentialOffer(stewardWallet, govIdCredDefId);
//     let [govIdCredRequest, govIdRequestMetadata] = await sdk.proverCreateCredentialReq(await indy.wallet.get(), endpointDid, govIdCredOffer, govIdCredDef, await indy.did.getEndpointDidAttribute('master_secret_id'));
//
//
//     let govIdValues = {
//       name: {"raw": config.userInformation.name, "encoded": indy.credentials.encode(config.userInformation.name)},
//       email: {"raw": config.userInformation.email, "encoded": indy.credentials.encode(config.userInformation.email)},
//       tax_id: {"raw": config.userInformation.tax_id, "encoded": indy.credentials.encode(config.userInformation.tax_id)},
//     };
//
//     let [govIdCredential] = await sdk.issuerCreateCredential(stewardWallet, govIdCredOffer, govIdCredRequest, govIdValues);
//     let res = await sdk.proverStoreCredential(await indy.wallet.get(), null, govIdRequestMetadata, govIdCredential, govIdCredDef);
//   } catch (e) {
//     console.log(e);
//   }
// };

// async function issueGovernmentIdCredential() {
//     let schemaName = 'Government-ID';
//     let schemaVersion = '1.1';
//     let signatureType = 'CL';
//     let govIdSchema;
//     let govIdSchemaId = `${stewardDid}:2:${schemaName}:${schemaVersion}`;
//     let govIdCredDefId;
//     let govIdCredDef;
//
//     try {
//         govIdSchema = await indy.issuer.getSchema(govIdSchemaId);
//     } catch(e) {
//         [govIdSchemaId, govIdSchema] = await sdk.issuerCreateSchema(stewardDid, schemaName, schemaVersion, [
//             'name',
//             'email',
//             'tax_id'
//         ]);
//
//         await indy.issuer.sendSchema(await indy.pool.get(), stewardWallet, stewardDid, govIdSchema);
//         govIdSchema = await indy.issuer.getSchema(govIdSchemaId);
//     }
//
//     [govIdCredDefId, govIdCredDef] = await sdk.issuerCreateAndStoreCredentialDef(stewardWallet, stewardDid, govIdSchema, 'GOVID', signatureType, '{"support_revocation": false}');
//     await indy.issuer.sendCredDef(await indy.pool.get(), stewardWallet, stewardDid, govIdCredDef);
//
//     exports.setEndpointDidAttribute('govIdCredDefId', govIdCredDefId);
//
//
//     let govIdCredOffer = await sdk.issuerCreateCredentialOffer(stewardWallet, govIdCredDefId);
//     let [govIdCredRequest, govIdRequestMetadata] = await sdk.proverCreateCredentialReq(await indy.wallet.get(), endpointDid, govIdCredOffer, govIdCredDef, await indy.did.getEndpointDidAttribute('master_secret_id'));
//
//
//     let govIdValues = {
//         name: {"raw": config.userInformation.name, "encoded": indy.credentials.encode(config.userInformation.name)},
//         email: {"raw": config.userInformation.email, "encoded": indy.credentials.encode(config.userInformation.email)},
//         tax_id: {"raw": config.userInformation.tax_id, "encoded": indy.credentials.encode(config.userInformation.tax_id)},
//     };
//
//     let [govIdCredential] = await sdk.issuerCreateCredential(stewardWallet, govIdCredOffer, govIdCredRequest, govIdValues);
//     let res = await sdk.proverStoreCredential(await indy.wallet.get(), null, govIdRequestMetadata, govIdCredential, govIdCredDef);
// }

// exports.getGovIdCredDefId = async function() {
//     return await exports.getEndpointDidAttribute('govIdCredDefId');
// };
