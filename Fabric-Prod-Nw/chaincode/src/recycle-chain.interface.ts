import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { LinkProposal, Location, Product, ProductHistory, ProductMaterial, Trade, Unit } from './models';

export interface RecycleChainV1 {
    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx (Automatically generated) The transaction context
     */
    instantiate(ctx: Context): Promise<void>;
    /**
     * Add a new Product with the given properties
     * @param {Context} context (Automatically generated) The transaction context
     * @param {string} productName Name of the product 
     * @param {number} producedAmount Total number that was produced in the given unit
     * @param {Unit} unit Unit the amount is measured in
     * @param {number} dateOfProduction number of milliseconds elapsed since January 1, 1970
     * @param {Location} _locationOfProduction longitude and latitude coordinates 
     * @param {string[]} _certificates List of certificates for that product
     * @param {ProductMaterial} _productMaterial List of source IDs and respective amounts 
     */
    addProduct(
        context: Context,
        productName: string,
        producedAmount: number,
        unit: Unit,
        dateOfProduction: number,
        _locationOfProduction: string,
        _certificates: string,
        _productMaterial: string
    ): Promise<Product>
    
    /**
     * Query the product with the given ID
     * @param {Context} context (Automatically generated) The transaction context
     * @param {string} productID the unique ID of the product
     * @returns {Product} product with the given ID.
     */
    getProduct(context: Context, productID: string): Promise<Product>;
    /**
     * Sets the available amount of this product to zero.
     * @param {Context} context (Automatically generated) The transaction context
     * @param {string} productID the unique ID of the product
     * @returns {Product} product with the given ID.
     */
    deleteProduct(context: Context, productID: string): Promise<Product>;
    /**
     * Register a trade of the specified product from the caller to the seller. If the transferred amount will be subtracted from the available amount of the product.
     * @param {Context} context (Automatically generated) The transaction context
     * @param {string} sourceID the unique ID of the product or trade
     * @param {string} buyer The unique user ID of the buyer
     * @param {number} amountTransferred The amount of the product that was transferred in the unit as specified by the product 
     * @returns {Trade} Trade object representing the trade
    */
    addTrade(context: Context, sourceID: string, buyer: string, amountTransferred: number): Promise<Trade>
    /**
     * Query the upstream history and the material of the product with the given ID
     * @param {Context} context (Automatically generated) The transaction context 
     * @param {string} sourceID the unique ID of the source
     * @returns {ProductHistory} A nested map of Products and the used amounts
     */
    queryProductHistory(context: Context, sourceID: string): Promise<ProductHistory>
    /**
     * Query a list of all identities that are linked with the caller 
     * @param {Context} context (Automatically generated) The transaction context 
     */
    queryWalletGroup(context: Context): Promise<[string | undefined, string[]]>
    /**
     * Register a temporary oneway link proposal to an identity.
     * Once the other user confirms this link, the identities wallets groups are merged.
     * A link proposal is only valid for the specified parties and must be confirm within 30min.
     * @param {Context} context (Automatically generated) The transaction context 
     * @returns {string} ID of the link proposal
     */
    registerLinkProposal(context: Context, userID: string): Promise<string>
    /**
     * Confirm a pending link proposal. After that, the caller's identity and the specified user will be linked together and share all assets.
     * Note that this is a transitive relationship.
     * @param {Context} context (Automatically generated) The transaction context 
     * @param {string} userID Unique ID of the user that the caller wants to link with 
     * @param {string} linkProposalID unique ID of the link proposal
     * @returns {string[]} List of linked identities
    */
    confirmLinkTo(context: Context, userID: string, linkProposalID: string): Promise<string[]>
    /**
     * Remove a user from the wallet group. This will revoke the user's access to the collective assets and the groups access to the user's assets
     * @param {Context} context (Automatically generated) The transaction context 
     * @param {string} userID Unique ID of the user that should be remove from the own wallet group
     * @returns {string[]} List of linked identities
     */
    removeUserFromWalletGroup(context: Context, userID: string): Promise<string[]>
    /**
     * Returns the unique ID of the caller
     * @param {Context} context (Automatically generated) The transaction context 
     * @returns {string} unique ID of the caller
     */
    getUserID(context: Context): Promise<string>;
}