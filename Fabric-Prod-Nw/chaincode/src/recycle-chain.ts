import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { LinkProposal, Location, Product, ProductHistory, ProductMaterial, Trade, Unit } from './models';
import getUuid = require('uuid-by-string');
import * as crypto from 'crypto'
import { RecycleChainV1 } from './recycle-chainV1.model';

@Info({ title: 'RecycleChain', description: 'Smart contract for recycle chain'})
export class RecycleChainContract extends Contract implements RecycleChainV1 {

    @Transaction()
    public async instantiate(ctx: Context) {
        console.log('Instantiate the contract');
        await this.writeToState(ctx, '_ID_COUNTER', 0);
    }

    @Transaction()
    public async getUserID(context: Context): Promise<string> {
        return this.getIdentity(context);
    }

    private async nextID(context: Context): Promise<string> {
        let IDCounter = await this.safeReadStringFromState(context, '_ID_COUNTER');
        if (IDCounter === undefined) { IDCounter = '0' }
        await this.writeToState(context, '_ID_COUNTER', parseInt(IDCounter) + 1 );
        return getUuid(`${IDCounter}`);
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
        producedAmount: number,
        unit: Unit,
        dateOfProduction: number,
        _locationOfProduction: string,
        _certificates: string,
        _productMaterial: string): Promise<Product> {
            context.clientIdentity.getMSPID

            const owner = this.getIdentity(context);
            
            if (productName.length === 0 || productName.length > 100) { throw new Error(`ProductName must have between 0 and 100 characters`) }
            producedAmount = parseFloat('' + producedAmount)
            if (producedAmount <= 0.) { throw new Error(`Amount must be a positive float but was ${producedAmount}`)}
            if (!Object.values(Unit).includes(unit)) { throw new Error(`Unit must be one of ${Object.values(Unit)}`) }
            dateOfProduction = parseFloat('' + dateOfProduction)
            if (dateOfProduction > Date.now()) { throw new Error(`Your date is in the future! ${dateOfProduction}`) }
            let locationOfProduction: Location = JSON.parse(_locationOfProduction);
            locationOfProduction = {x: locationOfProduction.x, y: locationOfProduction.y}
            let certificates: string[] = JSON.parse(_certificates);
            if (certificates.some(x => typeof x !== 'string')) { throw new Error(`Certificates must be a list of strings!`) }
            let productMaterial: ProductMaterial = JSON.parse(_productMaterial);
            for(let [material, req_amount] of Object.entries(productMaterial)) {
                const source: Trade|Product = await this.readObjectFromState(context, material);
                const ownerOfSource: string = this.isProduct(source)? source.producer : source.buyer;
                const [_, eligibleIdentities] = await this.getWalletGroup(context, ownerOfSource);
                if (!eligibleIdentities.includes(owner)) { throw new Error(`The caller was not the buyer in the Trade ${material} referenced in the list of materials!`)  }
                if (req_amount <= 0 || source.availableAmount < req_amount) { 
                    throw new Error(`Only ${source.availableAmount}${source.unit} of trade ${material} are available, but ${req_amount}${source.unit} were requested!`)
                }
            }

            const product: Product = {
                ID: `P#${await this.nextID(context)}`,
                productName,
                producer: owner,
                producedAmount,
                availableAmount: producedAmount,
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
    public async deleteRemainingSource(context: Context, sourceID: string): Promise<Product | Trade> {
        const source: Product | Trade = await this.readObjectFromState(context, sourceID);
        if (!this.isProduct(source) || this.isTrade(source)) {
            throw new Error('The provided ID does not refer to a product!')
        }
        source.availableAmount = 0;
        await this.writeToState(context, source.ID, source);
        return source;
        
    }

    @Transaction()
    public async getProduct(context: Context, productID: string): Promise<Product> {
        const product = await this.readObjectFromState(context, productID) as Product;
        if (!this.isProduct(product)) {
            throw new Error('The provided ID does not refer to a product!')
        }
        return product;
    }

    @Transaction()
    public async addTrade(context: Context, sourceID: string, buyer: string, amountTransferred: number): Promise<Trade> {
        const seller = this.getIdentity(context);
        const source: Product | Trade = await this.readObjectFromState(context, sourceID);
        const ownerOfSource: string = this.isProduct(source)? source.producer : source.buyer;
        const [_, eligibleIdentities] = await this.getWalletGroup(context, ownerOfSource);
        if (!eligibleIdentities.includes(seller)) {
            throw Error(`Product with ID ${sourceID} does not belong to this seller!`)
        }
        if (source.availableAmount < amountTransferred) {
            throw Error(`Product with ID ${sourceID} has a total available amount of ${source.availableAmount}${source.unit}, but ${amountTransferred}${source.unit} were requested!`)
        }
        const trade: Trade = {
            ID: `T#${await this.nextID(context)}`,
            sourceID: sourceID,
            seller,
            buyer,
            amountTransferred,
            availableAmount: amountTransferred,
            unit: source.unit,
            date: Date.now()
        }
        source.availableAmount = source.availableAmount - amountTransferred;
        this.writeToState(context, sourceID, source);
        this.writeToState(context, trade.ID, trade);
        return trade
    }

    @Transaction()
    public async queryProductHistory(context: Context, sourceID: string): Promise<ProductHistory> {
        const productHistory: ProductHistory = await this.buildProductHistoryRec(context, sourceID, -1)
        return productHistory;
    }

    private async buildProductHistoryRec(context: Context, sourceID: string, amountFactor: number): Promise<ProductHistory> {
        let source: Product| Trade = await this.readObjectFromState(context, sourceID);
        const listOfOwnership: {owner: string, received: number}[] = [];
        while(!this.isProduct(source)) {
            listOfOwnership.push({owner: source.buyer, received: source.date });
            source = await this.readObjectFromState(context, source.sourceID);
        }
        const product: Product = source;
        listOfOwnership.push({owner: product.producer, received: product.dateOfProduction })
        if (amountFactor == -1) {amountFactor = product.producedAmount}
        amountFactor /=  product.producedAmount
        const productHistory: ProductHistory = {
            ...product,
            listOfOwnership,
            productMaterial: [] as {product: ProductHistory, usedAmount: number}[]
        }
        for (const [sourceID, amount] of Object.entries(product.productMaterial || {})) {
            const upstreamProductHistory = await this.buildProductHistoryRec(context, sourceID, amountFactor * amount);
            productHistory.productMaterial.push({ product: upstreamProductHistory, usedAmount: amountFactor * amount});
        }
        return productHistory;
    }

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

    @Transaction()
    public async registerLinkProposal(context: Context, userID: string): Promise<string> {
        const caller = this.getIdentity(context);
        const linkProposalID = `linkID#${await this.nextID(context)}`;
        const linkProposal: LinkProposal = {
            from: caller,
            to: userID,
            // Valid for 30min
            validUntil: Date.now() + 1.8e+6
        }
        this.writeToState(context, linkProposalID, linkProposal);
        return linkProposalID;
    }

    @Transaction()
    public async confirmLinkTo(context: Context, userID: string, linkProposalID: string): Promise<string[]> {
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

        const walletGroupId = `walletGroup#${await this.nextID(context)}`;
        this.writeToState(context, walletGroupId, newWalletGroup);
        newWalletGroup.forEach(userID => {
            this.writeToState(context, `linkToWalletGroup#${userID}`, walletGroupId);
        })
        return newWalletGroup;
    }

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

    private isProduct(source: Product | Trade): source is Product {
        return source.ID.startsWith('P#');
    }
    private isTrade(source: Product | Trade): source is Trade {
        return source.ID.startsWith('T#');
    }

}