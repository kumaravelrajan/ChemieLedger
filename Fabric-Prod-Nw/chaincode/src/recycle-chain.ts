import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Product, ProductHistory, Trade, Unit } from './models';
import getUuid = require('uuid-by-string');

@Info({ title: 'RecycleChain', description: 'Smart contract for recycle chain'})
export class RecycleChainContract extends Contract {

    IDCounter = 0
    private nextID(): string {
        this.IDCounter += 1
        return getUuid(`${this.IDCounter}`)
    }

    private getIdentity(context: Context): string {
        return `${context.clientIdentity.getMSPID()}#${context.clientIdentity.getID()}`;
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
        return context.stub.putState(key, Buffer.from(JSON.stringify(value)));
    }

    @Transaction()
    public async addProduct(
        context: Context,
        productName: string,
        amount: number,
        unit: Unit,
        dateOfProduction: Date,
        locationOfProduction: {x: string, y: string},
        certificates?: string[],
        productMaterial?: {[ID: string]: number}): Promise<string> {
        const owner = this.getIdentity(context);
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
        return product.ID
    }

    @Transaction()
    public async addTrade(context: Context, productID: string, buyer: string, amountTransferred: number): Promise<string> {
        const seller = this.getIdentity(context);
        const product: Product = await this.readObjectFromState(context, productID);
        if (product.owner !== seller) {
            throw Error(`Product with ID ${productID} does not belong to this seller!`)
        }
        if (product.amount >= amountTransferred) {
            throw Error(`Product with ID ${productID} has a total available amount of ${product.amount}${product.unit}, but ${amountTransferred}}${product.unit} were requested!`)
        }
        const trade: Trade = {
            ID: this.nextID(),
            productID,
            seller,
            buyer,
            amountTransferred,
            amountAvailable: amountTransferred
        }
        product.amount = product.amount - amountTransferred;
        this.writeToState(context, productID, product.amount);
        this.writeToState(context, trade.ID, trade);
        return trade.ID
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
            productMaterial: []
        }
        for (const [tradeID, amount] of Object.entries(product.productMaterial || {})) {
            const trade: Trade = await this.readObjectFromState(context, tradeID);
            const material: Product = await this.readObjectFromState(context, tradeID);
            productHistory.productMaterial.push(await this.buildProductHistoryRec(context, material.ID));
        }
        return productHistory;
    }

}