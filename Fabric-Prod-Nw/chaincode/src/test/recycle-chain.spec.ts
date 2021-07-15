
import { expect, should } from 'chai';
import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { Product, ProductHistory, Trade, Unit } from '../models';
import { RecycleChainContract } from '../recycle-chain';
import { ClientIdentityMock, StubMock } from './mock-classes';
import * as crypto from 'crypto'

const keys = ['productName', 'availableAmount', 'unit', 'dateOfProduction', 'locationOfProduction', 'certificates', 'productMaterial']

function parseArgs(p: object, keys: string[]): string[] {
  return keys.map(x => {
    const y = p[x];
    if (typeof y === 'object') {
      return JSON.stringify(y);
    }
    return y.toString();
  })
}

describe('Recycle-Chain', () => {
  let cc: RecycleChainContract; 
  let ctx: Context;
  const userA = new ClientIdentityMock('org1MSP', '012345') as unknown as ClientIdentity;
  const userB = new ClientIdentityMock('org2MSP', '678910') as unknown as ClientIdentity;
  const userC = new ClientIdentityMock('org3MSP', '111213') as unknown as ClientIdentity;
  const userAID = `${userA.getMSPID()}#${crypto.createHash('md5').update(userA.getID()).digest('hex')}`;
  const userBID = `${userB.getMSPID()}#${crypto.createHash('md5').update(userB.getID()).digest('hex')}`;
  const userCID = `${userC.getMSPID()}#${crypto.createHash('md5').update(userC.getID()).digest('hex')}`;

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
        producer: '',
        producedAmount: 0,
        availableAmount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, keys);
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);
      expect(JSON.stringify(parseArgs(product, keys)) === JSON.stringify(params)).to.be.true;
    });

    it('Get valid product', async () => {
      const p: Product = {
        ID: '',
        productName: 'Corn Toss',
        producer: '',
        producedAmount: 0,
        availableAmount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, keys);
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);
      expect(JSON.stringify(parseArgs(product, keys)) === JSON.stringify(params)).to.be.true;
      const p2: Product = await cc.getProduct(ctx, product.ID);
      expect(JSON.stringify(product)).to.equal(JSON.stringify(p2));
    });

    

  });

  describe('#addTrade', async () => {
    it('Add valid Trade', async () => {
      const p: Product = {
        ID: '',
        productName: 'Corn Toss',
        producer: '',
        producedAmount: 0,
        availableAmount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      const params = parseArgs(p, keys);
      const product: Product = await cc.addProduct(ctx, ...params as [string, number, Unit, number, string, string, string]);

      const transferAmount = 36.2
      const trade: Trade = await cc.addTrade(ctx, product.ID, userBID, transferAmount);
      expect(trade.ID.length).to.be.greaterThan(0);
      expect(trade.availableAmount).to.equal(transferAmount);
      expect(trade.buyer).to.equal(userBID);
      expect(trade.seller).to.equal(userAID);
      expect(trade.amountTransferred).to.equal(transferAmount);
      expect(trade.unit).to.equal(p.unit);
      
      const p2: Product = await cc.getProduct(ctx, product.ID);
      expect(p2.availableAmount).to.equal(product.availableAmount - transferAmount);
    });
  });

  describe('#queryProductHistory', async () => {
    it('query Product History', async () => {
      let p1: Product = {
        ID: '',
        productName: 'Product1',
        producer: '',
        producedAmount: 0,
        availableAmount: 52.4,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: ['Bio'],
        productMaterial: {}
      }
      p1 = await cc.addProduct(ctx, ...parseArgs(p1, keys) as [string, number, Unit, number, string, string, string])
      let p2: Product = {
        ID: '',
        productName: 'Product2',
        producer: '',
        producedAmount: 0,
        availableAmount: 2,
        unit: Unit.Pieces,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: ['WWF'],
        productMaterial: {}
      }
      p2 = await cc.addProduct(ctx, ...parseArgs(p2, keys) as [string, number, Unit, number, string, string, string])
      let p3: Product = {
        ID: '',
        productName: 'Product3',
        producer: '',
        producedAmount: 0,
        availableAmount: 5.89,
        unit: Unit.Liter,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: ['Bio'],
        productMaterial: {}
      }
      p3.productMaterial[p1.ID] = 34.21;
      p3.productMaterial[p2.ID] = 2;
      p3 = await cc.addProduct(ctx, ...parseArgs(p3, keys) as [string, number, Unit, number, string, string, string])
      let trade3: Trade = await cc.addTrade(ctx, p3.ID, userCID, 4.7);
      let p4: Product = {
        ID: '',
        productName: 'Product4',
        producer: '',
        availableAmount: 0.5,
        producedAmount: 0,
        unit: Unit.Liter,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      ctx.clientIdentity = userB
      p4 = await cc.addProduct(ctx, ...parseArgs(p4, keys) as [string, number, Unit, number, string, string, string])
      let trade4: Trade = await cc.addTrade(ctx, p4.ID, userCID, 0.4);
      let p5: Product = {
        ID: '',
        productName: 'Product5',
        producer: '',
        availableAmount: 0.42,
        producedAmount: 0,
        unit: Unit.Kilogram,
        dateOfProduction: Date.now(),
        locationOfProduction: {x: 0, y: 0},
        certificates: [],
        productMaterial: {}
      }
      p5.productMaterial[trade3.ID] = 3.5
      p5.productMaterial[trade4.ID] = 0.2
      ctx.clientIdentity = userC
      p5 = await cc.addProduct(ctx, ...parseArgs(p5, keys) as [string, number, Unit, number, string, string, string])
      
      const productHistory: ProductHistory = await cc.queryProductHistory(ctx, p5.ID);
      console.log(JSON.stringify(productHistory))
      expect(productHistory.ID).to.equal(p5.ID);
      expect(productHistory.productMaterial[0].product.ID).to.equal(p3.ID);
      expect(productHistory.productMaterial[0].usedAmount).to.equal(3.5);
      expect(productHistory.productMaterial[1].product.ID).to.equal(p4.ID);
      expect(productHistory.productMaterial[1].usedAmount).to.equal(0.2);
      expect(productHistory.productMaterial[0].product.productMaterial[0].product.ID).to.equal(p1.ID);
      expect(productHistory.productMaterial[0].product.productMaterial[0].usedAmount).to.equal((3.5/p3.producedAmount)*p3.productMaterial[p1.ID]);
      expect(productHistory.productMaterial[0].product.productMaterial[1].product.ID).to.equal(p2.ID);
      expect(productHistory.productMaterial[0].product.productMaterial[1].usedAmount).to.equal((3.5/p3.producedAmount)*p3.productMaterial[p2.ID]);
    })
  });

  describe('walletGroup', async () => {
    it('create LinkProposal', async () => {
      const linkProposal = await cc.registerLinkProposal(ctx, userBID);
      expect(linkProposal.startsWith('linkID')).to.be.true;
    });

    it('confirm LinkProposal', async () => {
      let linkProposal = await cc.registerLinkProposal(ctx, userBID);
      ctx.clientIdentity = userB
      let walletGroup = await cc.confirmLinkTo(ctx, userAID, linkProposal);
      expect(walletGroup.includes(userAID)).to.be.true;
      expect(walletGroup.includes(userBID)).to.be.true;
      
      linkProposal = await cc.registerLinkProposal(ctx, userCID);
      ctx.clientIdentity = userC;
      walletGroup = await cc.confirmLinkTo(ctx, userBID, linkProposal);
      expect(walletGroup.includes(userAID)).to.be.true;
      expect(walletGroup.includes(userBID)).to.be.true;
      expect(walletGroup.includes(userCID)).to.be.true;
    })

    it('remove identity from walletGroup', async () => {
      let linkProposal = await cc.registerLinkProposal(ctx, userBID);
      ctx.clientIdentity = userB
      let walletGroup = await cc.confirmLinkTo(ctx, userAID, linkProposal);
      linkProposal = await cc.registerLinkProposal(ctx, userCID);
      ctx.clientIdentity = userC;
      walletGroup = await cc.confirmLinkTo(ctx, userBID, linkProposal);

      walletGroup = await cc.removeUserFromWalletGroup(ctx, userAID);
      expect(walletGroup.includes(userAID)).to.be.false;
      expect(walletGroup.includes(userBID)).to.be.true;
      expect(walletGroup.includes(userCID)).to.be.true;
    })
  })

});