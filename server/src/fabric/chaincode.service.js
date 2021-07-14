import dotenv from 'dotenv'
dotenv.config()
import  { Gateway } from 'fabric-network'
import { ccp, wallet, enrollUser } from './fabric.service'
const CHANNEL_NAME = process.env.CHANNEL_NAME
const CHAINCODE_ID = process.env.CHAINCODE_ID
let gateway
let contract

async function connectToGateway(userId) {
    const gatewayOptions = {
        identity: userId, // Previously imported identity
        wallet,
		discovery: { enabled:true, asLocalhost: true }
    };
    gateway = new Gateway();
    await gateway.connect(ccp, gatewayOptions);

    try {
        // Obtain the smart contract with which our application wants to interact
        const network = await gateway.getNetwork(CHANNEL_NAME);
        contract = network.getContract(CHAINCODE_ID);
        console.log('Sucessfully loaded Contract')
        return contract
    } catch(error) {
        console.error('Failed to connect to gateway!', gatewayOptions)
        console.error(error)
        return undefined;
    }
}

function disconnectFromGateway() {
    gateway.disconnect();
}

export async function callChainCode(user, chaincode_args) {
	const userIdentity = await wallet.get(user._id.toString());
	if (!userIdentity) {
        if (!user.x509Identity) {
            user = await enrollUser(user)
        } else {
            userIdentity = decryptX509Identity(user)
            await wallet.put(user._id.toString(), userIdentity);
        }
	}
    const contract = await connectToGateway(user._id.toString())
    const response = (await contract.submitTransaction(...chaincode_args)).toString();
    disconnectFromGateway();
    return response
}