import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Location, Product, ProductHistory, ProductMaterial, Trade, Unit } from './models';
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
        dateOfProduction: number,
        _locationOfProduction: string,
        _certificates?: string,
        _productMaterial?: string): Promise<Product> {

            const owner = this.getIdentity(context);
            
            if (productName.length === 0 || productName.length > 100) { throw new Error(`ProductName must have between 0 and 100 characters`) }
            amount = parseFloat('' + amount)
            if (amount <= 0.) { throw new Error(`Amount must be a positive float but was ${amount}`)}
            if (!Object.values(Unit).includes(unit)) { throw new Error(`Unit must be one of ${Object.values(Unit)}`) }
            dateOfProduction = parseFloat('' + dateOfProduction)
            if (dateOfProduction > Date.now()) { throw new Error(`Your date is in the future! ${dateOfProduction}`) }
            let locationOfProduction: Location = JSON.parse(_locationOfProduction);
            locationOfProduction = {x: locationOfProduction.x, y: locationOfProduction.y}
            let certificates: string[];
            if (_certificates !== undefined) {
                certificates = JSON.parse(_certificates);
                if (certificates.some(x => typeof x !== 'string')) { throw new Error(`Certificates must be a list of strings!`) }
            }
            let productMaterial: ProductMaterial;
            if(_productMaterial !== undefined) {
                productMaterial = JSON.parse(_productMaterial);
                for(let [material, req_amount] of Object.entries(productMaterial)) {
                    const trade: Trade = await this.readObjectFromState(context, material);
                    if (trade.buyer !== owner) { throw new Error(`The caller was not the buyer in the Trade ${material} referenced in the list of materials!`)  }
                    if (req_amount <= 0 || trade.amountAvailable < amount) { 
                        throw new Error(`Only ${trade.amountAvailable}${trade.unit} of trade ${material} are available, but ${req_amount}${trade.unit} were requested!`)
                    }
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
        if (product.owner !== seller) {
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

}