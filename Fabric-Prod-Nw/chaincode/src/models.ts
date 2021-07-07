export enum Unit {
    Kilogram = 'kg',
    Liter = 'l'
};
export type ProductMaterial = {[ID: string]: number};
export type Location = {x: number, y: number};

export interface Product {
    /** Id of the product */
    ID: string,
    /** Name of the product */
    productName: string,
    /** ID of the original owner / producer of the product  */
    owner: string,
    /** Total available amount of the product */
    amount: number,
    /** Unit in which the amount is given */
    unit: Unit,
    /** Date of production / harvest */
    dateOfProduction: number,
    /** Location where the product was produced */
    locationOfProduction: Location
    /** List of official certificates applicable to this product */
    certificates?: string[],
    /** List of tradeIDs referring to a received prodcut and their respective amount that were used to create his product. */
    productMaterial?: ProductMaterial
}

export interface Trade {
    /** unique Trade ID */
    ID: string,
    /** ID of transferred product */
    productID: string,
    /** ID of seller */
    seller: string,
    /** ID of buyer */
    buyer: string,
    /** Amount of product that was transferred in the specified unit. This amount must be less or equal to the product's total amount */
    amountTransferred: number,
    /** The amount the product that is still available for referencing. Initially equal to amount Transferred. */
    amountAvailable: number,
    /** The unit the product is measured in. */
    unit: Unit
}

export interface ProductHistory {
    /** Product */
    product: Product,
    /** List of used Materials for that product. */
    productMaterial: [ProductHistory, number][];
}