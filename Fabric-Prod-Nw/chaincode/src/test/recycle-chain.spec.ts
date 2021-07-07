
import { expect, should } from 'chai';
import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { Location, Product, Trade, Unit } from '../models';
import { RecycleChainContract } from '../recycle-chain';
import { ClientIdentityMock, StubMock } from './mock-classes';

function parseArgs(p: object, keys: string[]): string[] {
  return keys.map(x => {
    x = p[x];
    if (typeof x === 'object') {
      return JSON.stringify(x);
    }
    return x.toString();
  })
}

describe('Recycle-Chain', () => {
  let cc: RecycleChainContract; 
  let ctx: Context;
  const userA = new ClientIdentityMock('org1MSP', '012345') as unknown as ClientIdentity;
  const userB = new ClientIdentityMock('org2MSP', '678910') as unknown as ClientIdentity;
  const userC = new ClientIdentityMock('orgFakeMSP', '111213') as unknown as ClientIdentity;

  beforeEach(()=> {
    cc = new RecycleChainContract();
    ctx = cc.createContext();
    ctx.stub = new StubMock() as unknown as ChaincodeStub;
    ctx.clientIdentity = userA;
  });

  describe('#Init', () => {

    it('Initialize Chaincode', async () => {
      const cc = new RecycleChainContract();
      should().exist(cc);
    });

  });

  describe('#addProduct', async () => {

    it('Add valid product / Get product', async () => {
      const p: Product = {
        ID: '',
        productName: 'Corn Toss',
        owner: '',
        amount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, Object.keys(p));
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);
      expect(JSON.stringify(parseArgs(product, Object.keys(p))) === JSON.stringify(params)).to.be.true;
    });

    it('Get valid product', async () => {
      const p: Product = {
        ID: '',
        productName: 'Corn Toss',
        owner: '',
        amount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, Object.keys(p));
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);
      expect(JSON.stringify(parseArgs(product, Object.keys(p))) === JSON.stringify(params)).to.be.true;
      const p2: Product = await cc.getProduct(ctx, product.ID);
      expect(JSON.stringify(product)).to.equal(JSON.stringify(p2));
    });

    

  });

  describe('#addTrade', async () => {
    it('Add valid Trade', async () => {
      const p: Product = {
        ID: '',
        productName: 'Corn Toss',
        owner: '',
        amount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, Object.keys(p));
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);

      const transferAmount = 36.2
      const trade: Trade = await cc.addTrade(ctx, product.ID,`${userB.getMSPID()}#${userB.getID()}`, transferAmount);
      expect(trade.ID.length).to.be.greaterThan(0);
      expect(trade.amountAvailable).to.equal(transferAmount);
      expect(trade.buyer).to.equal(`${userB.getMSPID()}#${userB.getID()}`);
      expect(trade.seller).to.equal(`${userA.getMSPID()}#${userA.getID()}`);
      expect(trade.amountTransferred).to.equal(transferAmount);
      expect(trade.unit).to.equal(p.unit);
      
      const p2: Product = await cc.getProduct(ctx, product.ID);
      expect(p2.amount).to.equal(product.amount - transferAmount);
    });
  });

  describe('#querryProductHistory', async () => {
    it('querry Product History', async () => {
      // TODO
    })
  });

});