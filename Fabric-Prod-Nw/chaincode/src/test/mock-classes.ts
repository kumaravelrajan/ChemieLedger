
export class ClientIdentityMock {
    MSPID: string;
    ID: string;
    constructor(MSPID: string, ID: string) {
        this.MSPID = MSPID;
        this.ID = ID
    }
    getMSPID(): string {
        return this.MSPID;
    }

    getID(): string {
        return this.ID;
    }
}

export class StubMock {
    db: {[key: string]: Buffer} = {}
    public async getState(key: string) {
        return this.db[key];
    }

    public async putState(key: string, value: Buffer) {
        return this.db[key] = value;
    }
}
