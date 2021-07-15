import dotenv from 'dotenv'
import { updateUser } from '../services/user.service'
import  { Wallets } from 'fabric-network'
const fs = require('fs')
const crypto = require('crypto')
'use strict';

const FabricCAServices = require('fabric-ca-client');
const path = require('path');

dotenv.config()
const caAdminUserId = process.env.CA_ADMIN_USER_ID;
const caAdminUserPasswd = process.env.CA_ADMIN_PW;
const mspID = process.env.MSP_ORG;
const caHostName=process.env.CA_HOST_NAME
const walletPath = path.join(__dirname, 'wallet');
const ccpPath = path.join(__dirname, '..', '..', 'assets', 'connectionProfile.json');
const algorithm = 'aes-256-ctr';
export let ccp;
export let caClient;
export let wallet;
let adminUser;

export async function setup () {
	// build an in memory object with the network configuration (also known as a connection profile)
    buildCCP();

    // build an instance of the fabric ca services client based on
    // the information in the network configuration
    buildCAClient(FabricCAServices, ccp, caHostName);

    // setup the wallet to hold the credentials of the application user
    await buildWallet(Wallets, walletPath);
}

const buildCCP = () => {
    // load the common connection configuration file
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`no such file or directory: ${ccpPath}`);
    }

    // build a JSON object from the file contents
	ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))
    // ccp = yaml.load(fs.readFileSync(ccpPath, 'utf8'));

    console.log(`Loaded the network configuration located at ${ccpPath}`);
};

const buildCAClient = (FabricCAServices, ccp, caHostName) => {
	// Create a new CA client for interacting with the CA.
	const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
	// const ca_cert = fs.readFileSync(pem_path, 'utf8')
	caClient = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify: false }, caInfo.caName);
	console.log(`Built a CA Client named ${caHostName}`);
}


const buildWallet = async () => {
	wallet = await Wallets.newInMemoryWallet();
	console.log(`Wallet path: ${walletPath}`);
	const identity = await wallet.get(caAdminUserId);
	if (!identity) {
		await enrollAdmin()
	}
}

 const enrollAdmin = async () => {
	// in a real application this would be done on an administrative flow, and only once
	try {
		// Check to see if we've already enrolled the admin user.
		const identity = await wallet.get(caAdminUserId);
		if (identity) {
			console.log('An identity for the admin user already exists in the wallet');
			return;
		}

		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: caAdminUserId, enrollmentSecret: caAdminUserPasswd });
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: mspID,
			type: 'X.509',
		};
		await wallet.put(caAdminUserId, x509Identity);
		console.log('Successfully enrolled admin user and imported it into the wallet');
	} catch (error) {
		console.error(`Failed to enroll admin user : ${error}`);
	}
};

export async function enrollUser(user) {
	const userID = user._id.toString()
	console.log(`Enrolling user ${userID}`);
	if(!wallet) {
		await setup()
	}
	// Check to see if we've already enrolled the user
	const userIdentity = await wallet.get(userID);
	if (!!userIdentity) {
		console.log(`An identity for the user ${userID} already exists in the wallet`);
		return;
	}

	// Must use an admin to register a new user
	if (!adminUser) {
		const adminIdentity = await wallet.get(caAdminUserId);
		if (!adminIdentity) {
			enrollAdmin()
		}
		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		adminUser = await provider.getUserContext(adminIdentity, caAdminUserId);
	}

	// Register the user
	const enrollmentSecret = await caClient.register({
		affiliation: 'org1.department1',
		enrollmentID: userID,
		role: 'client'
	}, adminUser)
	
	const enrollment = await caClient.enroll({enrollmentID: userID, enrollmentSecret})

	const x509Identity = {
		credentials: {
			certificate: enrollment.certificate,
			privateKey: enrollment.key.toBytes(),
		},
		mspId: mspID ,
		type: 'X.509',
	};
	await wallet.put(userID, x509Identity);
	console.log(`Successfully enrolled user ${userID} and stored in wallet`)

	// Store x509Identity in DB
	const encryptedIdentity = encryptX509Identity(x509Identity);
	user.x509Identity = encryptedIdentity.content
	user.x509IdentityIV = encryptedIdentity.iv
	updateUser(user)
	console.log('Successfully stored encrypted x509Identity in database')
	return user;
}

function encryptX509Identity(x509Identity) {
	const iv = crypto.randomBytes(16);
	const value = JSON.stringify(x509Identity)
	const cipher = crypto.createCipheriv(algorithm, process.env.WALLET_MASTER_KEY, iv);
	const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
	return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
}

export function decryptX509Identity(user) {
	const decipher = crypto.createDecipheriv(algorithm, process.env.WALLET_MASTER_KEY, Buffer.from(user.x509IdentityIV, 'hex'))
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(user.x509Identity, 'hex')), decipher.final()])
    const x509Identity = JSON.parse(decrpyted.toString())
	return x509Identity
}
