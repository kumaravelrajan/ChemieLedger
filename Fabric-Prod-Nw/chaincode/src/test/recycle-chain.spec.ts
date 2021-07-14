
import { expect, should } from 'chai';
import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { Product, Trade, Unit } from '../models';
import { RecycleChainContract } from '../recycle-chain';
import { ClientIdentityMock, StubMock } from './mock-classes';
import * as crypto from 'crypto'

const keys = ['productName', 'amount', 'unit', 'dateOfProduction', 'locationOfProduction', 'certificates', 'productMaterial']

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
  const userC = new ClientIdentityMock('orgFakeMSP', '111213') as unknown as ClientIdentity;
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
        owner: '',
        amount: 52.4,
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
        owner: '',
        amount: 52.4,
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
        owner: '',
        amount: 52.4,
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
      expect(trade.amountAvailable).to.equal(transferAmount);
      expect(trade.buyer).to.equal(userBID);
      expect(trade.seller).to.equal(userAID);
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