export enum Unit {
    Kilogram = 'kg',
    Liter = 'l',
    Pieces = 'pcs'
};
export type ProductMaterial = {[ID: string]: number};
export type Location = {x: number, y: number};

export interface Product {
    /** Id of the product */
    ID: string,
    /** Name of the product */
    productName: string,
    /** ID of the original owner / producer of the product  */
    producer: string,
    /** Total amount that was produced of this product */
    producedAmount: number;
    /** Total available amount of the product */
    availableAmount: number,
    /** Unit in which the amount is given */
    unit: 'kg' | 'l' | 'pcs',
    /** Date of production / harvest */
    dateOfProduction: number,
    /** Location where the product was produced */
    locationOfProduction: Location
    /** List of official certificates applicable to this product */
    certificates: string[],
    /** List of tradeIDs referring to a received prodcut and their respective amount that were used to create his product. */
    productMaterial: ProductMaterial
}

export interface ProductHistory extends Omit<Product, 'productMaterial'> {
    /** List of used Materials for that product. */
    listOfOwnership: {owner: string, received: number}[]
    productMaterial: {product: ProductHistory, usedAmount: number}[];
}