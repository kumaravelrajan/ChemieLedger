import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { LinkProposal, Location, Product, ProductHistory, ProductMaterial, Trade, Unit } from './models';
import getUuid = require('uuid-by-string');
import * as crypto from 'crypto'

@Info({ title: 'RecycleChain', description: 'Smart contract for recycle chain'})
export class RecycleChainContract extends Contract {

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
     @Transaction()
    public async instantiate(ctx: Context) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    IDCounter = 0
    private nextID(): string {
        this.IDCounter += 1
        return getUuid(`${this.IDCounter}`)
    }

    private getIdentity(context: Context): string {
        const ID = crypto.createHash('md5').update(context.clientIdentity.getID()).digest('hex');
        return `${context.clientIdentity.getMSPID()}#${ID}`;
    }

    private async safeReadStringFromState(context: Context, key: string): Promise<string | undefined> {
        const valueJSON = await context.stub.getState(key);
        if (valueJSON !== undefined && valueJSON.length>0) {
            return valueJSON.toString();
        }
        return undefined;
    }

    private async readStringFromState(context: Context, key: string) {
        const valueJSON = await context.stub.getState(key);
        if (!valueJSON || valueJSON.length === 0) {
            throw new Error(`Asset with ID ${key} does not exist!`);
        }
        return valueJSON.toString();
    }

    private async readObjectFromState(context: Context, key: string) {
        const valueJSON = await context.stub.getState(key);
        if (!valueJSON || valueJSON.length === 0) {
            throw new Error(`Asset with ID ${key} does not exist!`);
        }
        return JSON.parse(valueJSON.toString());
    }

    private async writeToState(context: Context, key: string, value: any) {
        if (typeof value == 'string') {
            return context.stub.putState(key, Buffer.from(value))
        }
        return context.stub.putState(key, Buffer.from(JSON.stringify(value)));
    }

    @Transaction()
    public async addProduct(
        context: Context,
        productName: string,
        amount: number,
        unit: Unit,
        dateOfProduction: number,
        _locationOfProduction: string,
        _certificates: string,
        _productMaterial: string): Promise<Product> {
            context.clientIdentity.getMSPID

            const owner = this.getIdentity(context);
            
            if (productName.length === 0 || productName.length > 100) { throw new Error(`ProductName must have between 0 and 100 characters`) }
            amount = parseFloat('' + amount)
            if (amount <= 0.) { throw new Error(`Amount must be a positive float but was ${amount}`)}
            if (!Object.values(Unit).includes(unit)) { throw new Error(`Unit must be one of ${Object.values(Unit)}`) }
            dateOfProduction = parseFloat('' + dateOfProduction)
            if (dateOfProduction > Date.now()) { throw new Error(`Your date is in the future! ${dateOfProduction}`) }
            let locationOfProduction: Location = JSON.parse(_locationOfProduction);
            locationOfProduction = {x: locationOfProduction.x, y: locationOfProduction.y}
            let certificates: string[] = JSON.parse(_certificates);
            if (certificates.some(x => typeof x !== 'string')) { throw new Error(`Certificates must be a list of strings!`) }
            let productMaterial: ProductMaterial = JSON.parse(_productMaterial);
            for(let [material, req_amount] of Object.entries(productMaterial)) {
                const trade: Trade = await this.readObjectFromState(context, material);
                const [_, eligibleIdentities] = await this.getWalletGroup(context, trade.buyer);
                if (!eligibleIdentities.includes(owner)) { throw new Error(`The caller was not the buyer in the Trade ${material} referenced in the list of materials!`)  }
                if (req_amount <= 0 || trade.amountAvailable < amount) { 
                    throw new Error(`Only ${trade.amountAvailable}${trade.unit} of trade ${material} are available, but ${req_amount}${trade.unit} were requested!`)
                }
            }

            const product: Product = {
                ID: this.nextID(),
                productName,
                owner,
                amount,
                unit,
                dateOfProduction,
                locationOfProduction,
                certificates,
                productMaterial
            }
            this.writeToState(context, product.ID, product)
            return product
    }

    @Transaction()
    public async getProduct(context: Context, productID: string): Promise<Product> {
        return await this.readObjectFromState(context, productID) as Product;
    }

    @Transaction()
    public async addTrade(context: Context, productID: string, buyer: string, amountTransferred: number): Promise<Trade> {
        const seller = this.getIdentity(context);
        const product: Product = await this.readObjectFromState(context, productID);
        const [_, eligibleIdentities] = await this.getWalletGroup(context, product.owner);
        if (!eligibleIdentities.includes(seller)) {
            throw Error(`Product with ID ${productID} does not belong to this seller!`)
        }
        if (product.amount < amountTransferred) {
            throw Error(`Product with ID ${productID} has a total available amount of ${product.amount}${product.unit}, but ${amountTransferred}${product.unit} were requested!`)
        }
        const trade: Trade = {
            ID: this.nextID(),
            productID,
            seller,
            buyer,
            amountTransferred,
            amountAvailable: amountTransferred,
            unit: product.unit
        }
        product.amount = product.amount - amountTransferred;
        this.writeToState(context, productID, product);
        this.writeToState(context, trade.ID, trade);
        return trade
    }

    @Transaction()
    public async querryProductHistory(context: Context, productID: string): Promise<ProductHistory> {
        const productHistory: ProductHistory = await this.buildProductHistoryRec(context, productID)
        return productHistory;
    }

    private async buildProductHistoryRec(context: Context, productID: string): Promise<ProductHistory> {
        const product: Product = await this.readObjectFromState(context, productID);
        const productHistory: ProductHistory = {
            product,
            productMaterial: [] as [ProductHistory, number][]
        }
        for (const [tradeID, amount] of Object.entries(product.productMaterial || {})) {
            const trade: Trade = await this.readObjectFromState(context, tradeID);
            productHistory.productMaterial.push([await this.buildProductHistoryRec(context, trade.productID), trade.amountTransferred]);
        }
        return productHistory;
    }

    /**
     * Queries all identites that share a wallet with the user's identity
     * @param context 
     * @param userID ID of the user
     * @returns Array of length two with the linkToWalletGroup id and the set of linked identities
     */
    @Transaction()
    public async queryWalletGroup(context: Context) : Promise<[string | undefined, string[]]> {
        return this.getWalletGroup(context, this.getIdentity(context));
    }

    private async getWalletGroup(context: Context, userID: string): Promise<[string | undefined, string[]]> {
        const linkToWalletGroup = await this.safeReadStringFromState(context, `linkToWalletGroup#${userID}`)
        if (linkToWalletGroup === undefined) {
            return [undefined, Array.from(new Set([userID]))];
        }
        const callerAuthorizedIdentities = await this.safeReadStringFromState(context, linkToWalletGroup);
        if (callerAuthorizedIdentities === undefined) {
            return [undefined, Array.from(new Set([userID]))];
        }
        return [linkToWalletGroup, JSON.parse(callerAuthorizedIdentities)];
    }

    /**
     * Register a temporary oneway link proposal to an identity.
     * Once the other user confirms this link, the identities wallets groups are merged.
     * A link proposal is only valid for the specified parties and must be confirm within 30min.
     * @param context 
     * @param userID ID of the user a link should be established to
     * @returns Id of the link proposal. This ID must be presented when calling this.confirmLinkTo()
     */
    @Transaction()
    public async registerLinkProposal(context: Context, userID: string): Promise<string>{
        const caller = this.getIdentity(context);
        const linkProposalID = `linkID#${this.nextID()}`;
        const linkProposal: LinkProposal = {
            from: caller,
            to: userID,
            // Valid for 30min
            validUntil: Date.now() + 1.8e+6
        }
        this.writeToState(context, linkProposalID, linkProposal);
        return linkProposalID;
    }

    /**
     * Confirm a link proposal and therefore merge the users' wallet groups.
     * @param context 
     * @param userID : UserID of the identity the user want to link his wallet with
     * @param linkProposalID : ID of the previously created link proposal
     * @returns The new set of linked identities
     */
    @Transaction()
    public async confirmLinkTo(context: Context, userID: string, linkProposalID: string): Promise<string[]>{
        const caller = this.getIdentity(context);
        let tmp = await this.safeReadStringFromState(context, linkProposalID);
        if (tmp === undefined) {
            throw new Error('Provided linkID not valid!')
        }
        const linkProposal: LinkProposal = JSON.parse(await this.readStringFromState(context, linkProposalID));
        if (linkProposal.from !== userID || linkProposal.to !== caller || linkProposal.validUntil < Date.now()) {
            throw new Error('Provided link is not valid!')
        }
        // Merge link groups
        const [_, callerWalletGroup] = await this.getWalletGroup(context, caller);
        const [__, userWalletGroup] = await this.getWalletGroup(context, userID);
        const newWalletGroup = Array.from(new Set([...callerWalletGroup, ...userWalletGroup]));

        const walletGroupId = `walletGroup#${this.nextID()}`;
        this.writeToState(context, walletGroupId, newWalletGroup);
        newWalletGroup.forEach(userID => {
            this.writeToState(context, `linkToWalletGroup#${userID}`, walletGroupId);
        })
        return newWalletGroup;
    }

    /**
     * Remove a user from the wallet group. This will revoke the user's access to the collective assets and the groups access to the user's assets
     * @param context 
     * @param userID : Id of the user that should be removed
     * @returns The new set of linked identities
     */
    @Transaction() 
    public async removeUserFromWalletGroup(context: Context, userID: string): Promise<string[]> {
        const caller = this.getIdentity(context);
        const [linkToWalletGroup, callerWalletGroup] = await this.getWalletGroup(context, caller);
        if(linkToWalletGroup !== undefined && callerWalletGroup.includes(userID) && caller !== userID) {
            this.writeToState(context, linkToWalletGroup, callerWalletGroup.splice(callerWalletGroup.indexOf(userID), 1));
            return callerWalletGroup
        }
        throw new Error(`The provided userID does not exist in the user's wallet group.`)

    }

}