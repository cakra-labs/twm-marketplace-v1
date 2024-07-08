import { Configuration } from "./config";
import { BigNumber, Contract, ethers } from "ethers";
import { Promise } from "bluebird";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";
import { getDefaultProvider } from "../utils/provider";
import { NftInfo, ReturnInfo } from "./types";
// import { getContract } from "../utils/contractHelpers";
import { balanceToDecimal } from "./ether-utils";
import { whiteList } from "./whitelist";
import axios from "axios";
/**
 * An API module of TWM Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */

export class TWMFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  serverUrl: string;
  contracts: { [name: string]: Contract };
  leafNodes: string[];
  merkleTree: MerkleTree;
  rootHash: Buffer;
  constructor(cfg: Configuration) {
    const { deployments, serverUrl } = cfg;
    const provider = getDefaultProvider();
    this.myAccount = "";
    this.serverUrl = serverUrl;

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(
        deployment.address,
        deployment.abi,
        provider
      );
    }

    this.config = cfg;
    this.provider = provider;
    this.leafNodes = whiteList.map((addr) =>
      keccak256(addr).toString('hex')
    );
    this.merkleTree = new MerkleTree(this.leafNodes, keccak256, {
      sortPairs: true,
    });
    this.rootHash = this.merkleTree.getRoot();
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */

  unlockWallet(provider: any, account: string) {
    this.signer = provider.getSigner(0);
    this.myAccount = account;
    if (this.signer) {
      for (const [name, contract] of Object.entries(this.contracts)) {
        this.contracts[name] = contract.connect(this.signer);
      }
    }
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  async getUnstakedNFTs(): Promise<NftInfo[]> {
    const { TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    // const myNftBalance = await TWM_NFT.counterOfOwner(this.myAccount);
    let myNfts: BigNumber[] = await TWM_NFT.walletOfOwner(this.myAccount);
    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < myNfts.length; i++) {
      IntNfts.push(myNfts[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }
    await Promise.map(myNfts, async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: obj.trait,
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async getStakedNFTs(): Promise<NftInfo[]> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    // const myNftBalance = await TWM_NFT.counterOfOwner(this.myAccount);
    let myNfts: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < (myNfts[0]).length; i++) {
      IntNfts.push((myNfts[0])[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }

    await Promise.map(myNfts[0], async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: obj.trait,
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async isApprovedForAll(address: string): Promise<boolean> {
    const { TWM_NFT, TWM_BANK } = this.contracts;
    if (await TWM_NFT.isApprovedForAll(address, TWM_BANK.address)) {
      return true;
    }
    return false;
  }

  async isApprovedForAllUtility(address: string): Promise<boolean> {
    const { TWM_PARTS, TWM_BANK } = this.contracts;
    if (await TWM_PARTS.isApprovedForAll(address, TWM_BANK.address)) {
      return true;
    }
    return false;
  }

  async setApproveForAll(): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    try {
      const txx = await TWM_NFT.setApprovalForAll(TWM_BANK.address, true);
      const receipt = await txx.wait();
      console.log(
        `setApprovalForAll tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "V1 APPROVE TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "V1 APPROVE TRANSACTION FAIL",
      };
    }
  }

  async setApproveForAllUtility(): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_PARTS } = this.contracts;
    try {
      const txx = await TWM_PARTS.setApprovalForAll(TWM_BANK.address, true);
      const receipt = await txx.wait();
      console.log(
        `setApprovalForAll tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "V2 APPROVE TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "V2 APPROVE TRANSACTION FAIL",
      };
    }
  }

  async getTWTBalance(): Promise<string> {
    const { TWM_TOKEN } = this.contracts;
    if (this.myAccount === "") return "0";
    try {
      let balance = await TWM_TOKEN.balanceOf(this.myAccount);
      return balanceToDecimal(balance.toString());
    } catch (error) {
      return "0";
    }
  }

  async getAccumulatedAmount(): Promise<string> {
    const { TWM_BANK } = this.contracts;
    if (this.myAccount === "") return "0";
    let accumulatedAmount: BigNumber = await TWM_BANK.getAccumulatedAmount(
      this.myAccount
    );
    return balanceToDecimal(accumulatedAmount.toString());
  }

  async withdraw(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let hexNums: string[] = [];

    if (nums.length === 0) {
      return {
        success: false,
        reason: "PLEASE SELECT OVER ONE NFTS",
      };
    }

    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });
    let tokens: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
    tokens[0].forEach(async (token) => {
      let flag = false;
      for (let i = 0; i < nums.length; i++) {
        if (token.toNumber() === nums[i]) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        return {
          success: false,
          reason: "PLEASE SELECT CORRECT NFTS FOR UNSTAKING",
        };
      }
    });

    try {
      const txx = await TWM_BANK.withdraw(TWM_NFT.address, hexNums);
      const receipt = await txx.wait();
      console.log(
        `withdraw tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "UNSTAKE TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "UNSTAKE TRANSACTION FAIL",
      };
    }
  }

  async withdrawUtility(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_PARTS } = this.contracts;
    let hexNums: string[] = [];

    if (nums.length === 0) {
      return {
        success: false,
        reason: "PLEASE SELECT OVER ONE NFTS",
      };
    }

    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });
    let tokens: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
    tokens[0].forEach(async (token) => {
      let flag = false;
      for (let i = 0; i < nums.length; i++) {
        if (token.toNumber() === nums[i]) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        return {
          success: false,
          reason: "PLEASE SELECT CORRECT NFTS FOR UNSTAKING",
        };
      }
    });

    try {
      const txx = await TWM_BANK.withdraw(TWM_PARTS.address, hexNums);
      const receipt = await txx.wait();
      console.log(
        `withdraw tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "UNSTAKE TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "UNSTAKE TRANSACTION FAIL",
      };
    }
  }

  async depositNFTs(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let hexNums: string[] = [];

    if (nums.length === 0) {
      return {
        success: false,
        reason: "Please select some NFTs!",
      };
    }

    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });

    if ((await TWM_BANK.stakingLaunched()) === false) {
      return {
        success: false,
        reason: "Bank is disable now!",
      };
    } else {
      if (await this.isApprovedForAll(this.myAccount)) {
        let res: any;
        try {
          res = await axios.get(
            this.serverUrl + "traits/deposit/" + JSON.stringify(nums),
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                  "GET,PUT,POST,DELETE,PATCH,OPTIONS",
              },
            }
          );
        } catch (error) {
          return {
            success: false,
            reason: "SERVER FAIL",
          };
        }
        try {
          const txx = await TWM_BANK.deposit(
            TWM_NFT.address,
            res.data.hexNums,
            res.data.traits,
            res.data.signature
          );
          const receipt = await txx.wait();
          console.log(
            `deposit tx: https://etherscan.io/tx/${receipt.transactionHash}`
          );
          return {
            success: true,
            reason: "STAKE TRANSACTION SUCCESS",
          };
        } catch (error) {
          return {
            success: false,
            reason: "STAKE TRANSACTION FAIL",
          };
        }
      } else {
        return {
          success: false,
          reason: "STAKE TRANSACTION FAIL",
        };
      }
    }
  }

  async depositUtilities(nums: number[]): Promise<ReturnInfo> {
    const { TWM_BANK, TWM_PARTS } = this.contracts;
    let hexNums: string[] = [];

    if (nums.length === 0) {
      return {
        success: false,
        reason: "Please select some NFTs!",
      };
    }

    nums.forEach((num) => {
      hexNums.push(ethers.utils.hexlify(num));
    });
    if ((await TWM_BANK.stakingLaunched()) === false) {
      return {
        success: false,
        reason: "Staking is disable now!",
      };
    } else {
      if (await this.isApprovedForAllUtility(this.myAccount)) {
        let res: any;
        try {
          res = await axios.get(
            this.serverUrl + "traits/depositUtility/" + JSON.stringify(nums),
            {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                  "GET,PUT,POST,DELETE,PATCH,OPTIONS",
              },
            }
          );
        } catch (error) {
          return {
            success: false,
            reason: "SERVER FAIL",
          };
        }
        try {
          const txx = await TWM_BANK.deposit(
            TWM_PARTS.address,
            res.data.hexNums,
            res.data.traits,
            res.data.signature
          );
          const receipt = await txx.wait();
          console.log(
            `deposit tx: https://etherscan.io/tx/${receipt.transactionHash}`
          );
          return {
            success: true,
            reason: "STAKE TRANSACTION SUCCESS",
          };
        } catch (error) {
          return {
            success: false,
            reason: "STAKE TRANSACTION FAIL",
          };
        }
      } else {
        return {
          success: false,
          reason: "The Bank is not approved for All Utilities!",
        };
      }
    }
  }

  async stakeAll(): Promise<ReturnInfo> {
    const { TWM_NFT } = this.contracts;
    let unstakedNFTs: number[] = [];
    if (this.myAccount === "")
      return {
        success: false,
        reason: "NOT CONNECTED WALLET",
      };

    try {
      let myNfts: BigNumber[] = await TWM_NFT.walletOfOwner(this.myAccount);
      if (myNfts.length === 0) {
        return {
          success: false,
          reason: "Nothing for staking!",
        };
      }
      myNfts.forEach(async (value, index) => {
        unstakedNFTs.push(value.toNumber());
      });
      let res: ReturnInfo = await this.depositNFTs(unstakedNFTs);
      return res;
    } catch (error) {
      return {
        success: false,
        reason: "Stake All Fail!",
      };
    }
  }

  async withdrawAll(): Promise<ReturnInfo> {
    const { TWM_BANK } = this.contracts;
    let stakedNFTs: number[] = [];
    if (this.myAccount === "")
      return {
        success: false,
        reason: "NOT CONNECTED WALLET",
      };

    try {
      let myNfts: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
      if (myNfts[0].length === 0) {
        return {
          success: false,
          reason: "Nothing staked!",
        };
      }
      myNfts[0].forEach(async (value, index) => {
        stakedNFTs.push(value.toNumber());
      });
      let res: ReturnInfo = await this.withdraw(stakedNFTs);
      return res;
    } catch (error) {
      return {
        success: false,
        reason: "Unstake All Fail!",
      };
    }
  }

  async withdrawAllTWMT(): Promise<ReturnInfo> {
    const { TWM_TOKEN } = this.contracts;
    if (this.myAccount === "")
      return {
        success: false,
        reason: "NOT CONNECTED WALLET",
      };
    let userBalance: BigNumber = await TWM_TOKEN.getUserBalance(this.myAccount);
    try {
      const txx = await TWM_TOKEN.withdrawTWMT(userBalance);
      const receipt = await txx.wait();
      console.log(
        `withdrawTWMT tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "TWMT WITHDRAW TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "TWMT WITHDRAW TRANSACTION FAIL",
      };
    }
  }

  async fetchUserRewardBalance(): Promise<string> {
    const { TWM_TOKEN } = this.contracts;
    if (this.myAccount === "") return "0";
    try {
      let balance = await TWM_TOKEN.getUserBalance(this.myAccount);
      return balanceToDecimal(balance.toString());
    } catch (error) {
      return "0";
    }
  }

  async progressInfo(): Promise<number> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let balance: BigNumber = await TWM_NFT.balanceOf(TWM_BANK.address);
    return balance.toNumber();
  }

  async publicMintForSecond(amount: number): Promise<ReturnInfo> {
    const { TWM_PARTS } = this.contracts;
    if (this.myAccount === "") return {
      success: false,
      reason: "NOT CONNECTED WALLET",
    };
    let hexProof: string[] = [];
    try {
      let price: BigNumber;
      if (await this.isV1Holder()) {
        price = await TWM_PARTS._guestPriceForHolder();
      } else if (await this.isWhitelist()) {
        price = await TWM_PARTS._guestPriceForHolder();
        hexProof = this.merkleTree.getHexProof(keccak256(this.myAccount).toString("hex"));
      } else {
        price = await TWM_PARTS._publicPrice();
      }
      const txx = await TWM_PARTS.publicMint(amount, hexProof, {
        value: price.mul(amount),
      });
      const receipt = await txx.wait();
      console.log(
        `publicMint tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "V2 MINT TRANSACTION SUCCESS",
      };
    } catch (error) {
      console.log(error)
      return {
        success: false,
        reason: "V2 MINT TRANSACTION FAIL",
      };
    }
  }

  async totalSupply(): Promise<number> {
    const { TWM_PARTS } = this.contracts;
    try {
      let res = await TWM_PARTS.totalSupply();
      return res.toNumber();
    } catch (error) {
      return 0;
    }
  }

  async maxSupply(): Promise<number> {
    const { TWM_PARTS } = this.contracts;
    try {
      let res = await TWM_PARTS.MAX_SUPPLY();
      return res.toNumber();
    } catch (error) {
      return 0;
    }
  }

  async isV1Holder(): Promise<boolean> {
    const { TWM_PARTS } = this.contracts;
    if (this.myAccount === "") {
      return false;
    }

    try {
      return await TWM_PARTS.isV1Holder(this.myAccount);
    } catch (error) {
      return false;
    }
  }

  async isWhitelist(): Promise<boolean> {
    const { TWM_PARTS } = this.contracts;
    if (this.myAccount === "") {
      return false;
    }

    try {
      const hexProof = this.merkleTree.getHexProof(keccak256(this.myAccount).toString("hex"));
      return await TWM_PARTS.isWhitelist(this.myAccount, hexProof);
    } catch (error) {
      return false;
    }
  }

  async mintableAmount(): Promise<number> {
    try {
      let maxSupply = await this.maxSupply();
      let totalSupply = await this.totalSupply();
      return maxSupply - totalSupply;
    } catch (error) {
      return 0;
    }
  }

  async getMintedNFTsForSecond(): Promise<NftInfo[]> {
    const { TWM_PARTS } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    let myNfts: BigNumber[] = await TWM_PARTS.tokensOfOwner(this.myAccount);
    await Promise.map(myNfts, async (value) => {
      let url = await TWM_PARTS.tokenURI(value);
      let res = await axios.get(url);
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: 0,
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async fetchUnstakedTWMs(): Promise<NftInfo[]> {
    const { TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    let myNfts: BigNumber[] = await TWM_NFT.walletOfOwner(this.myAccount);

    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < myNfts.length; i++) {
      IntNfts.push(myNfts[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }

    await Promise.map(myNfts, async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: Number(Number(obj.trait).toFixed(0)),
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async fetchUnstakedUtilities(): Promise<NftInfo[]> {
    const { TWM_PARTS } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    let myNfts: BigNumber[] = await TWM_PARTS.tokensOfOwner(this.myAccount);

    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < myNfts.length; i++) {
      IntNfts.push(myNfts[i].toNumber());
    }
    try {
      let res = await axios.get(
        this.serverUrl + "traits/utility/" + JSON.stringify(IntNfts),
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          },
        }
      );
      traits = res.data;
    } catch (error) {
      return myNftsInfo;
    }

    await Promise.map(myNfts, async (value) => {
      let url = await TWM_PARTS.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: Number(Number(obj.trait).toFixed(0)),
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async fetchStakedTWMs(): Promise<NftInfo[]> {
    const { TWM_BANK, TWM_NFT } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    let myNfts: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);

    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < (myNfts[0]).length; i++) {
      IntNfts.push((myNfts[0])[i].toNumber());
    }
    if (IntNfts.length > 0) {
      try {
        let res = await axios.get(
          this.serverUrl + "traits/" + JSON.stringify(IntNfts),
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            },
          }
        );
        traits = res.data;

      } catch (error) {
        return myNftsInfo;
      }
    }

    await Promise.map(myNfts[0], async (value) => {
      let url = await TWM_NFT.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: Number(Number(obj.trait).toFixed(0)),
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async fetchStakedUtilities(): Promise<NftInfo[]> {
    const { TWM_BANK, TWM_PARTS } = this.contracts;
    let myNftsInfo: NftInfo[] = [];
    if (this.myAccount === "") return myNftsInfo;
    let myNfts: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
    let IntNfts = [];
    let traits: any[] = [];
    for (var i = 0; i < (myNfts[1]).length; i++) {
      IntNfts.push((myNfts[1])[i].toNumber());
    }
    if (IntNfts.length > 0) {
      try {
        let res = await axios.get(
          this.serverUrl + "traits/utility/" + JSON.stringify(IntNfts),
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
            },
          }
        );
        traits = res.data;
      } catch (error) {
        return myNftsInfo;
      }
    }


    await Promise.map(myNfts[1], async (value) => {
      let url = await TWM_PARTS.tokenURI(value);
      let res = await axios.get(url);
      let obj = traits.find((o) => o.no === value.toNumber());
      myNftsInfo.push({
        imageUrl: res.data.image,
        name: res.data.name,
        normalReward: Number(Number(obj.trait).toFixed(0)),
        id: value.toNumber(),
      });
    });
    return myNftsInfo;
  }

  async fetchStakedAllAmount(): Promise<number> {
    const { TWM_BANK } = this.contracts;
    if (this.myAccount === "") return 0;
    let myNfts: [BigNumber[], BigNumber[], BigNumber[]] = await TWM_BANK.getStakerTokens(this.myAccount);
    return myNfts[0].length + myNfts[1].length + myNfts[2].length;
  }

  async fetchUnstakedAllAmount(): Promise<number> {
    const { TWM_NFT, TWM_PARTS } = this.contracts;
    if (this.myAccount === "") return 0;
    let myTWMs: BigNumber = await TWM_NFT.balanceOf(this.myAccount);
    let myUtilities: BigNumber = await TWM_PARTS.balanceOf(this.myAccount);
    return myTWMs.toNumber() + myUtilities.toNumber();
  }

  async fetchTWMTBalance(): Promise<string> {
    const { TWM_TOKEN } = this.contracts;
    if (this.myAccount === "") return "0";
    try {
      let myTWMTBalance: BigNumber = await TWM_TOKEN.getUserBalance(this.myAccount);
      return balanceToDecimal(myTWMTBalance.toString());
    } catch (error) {
      return "0";
    }
  }

  async fetchTWMTDailyYield(): Promise<string> {
    const { TWM_BANK } = this.contracts;
    if (this.myAccount === "") return "0";
    try {
      let stakerYield: BigNumber = await TWM_BANK.getStakerYield(this.myAccount);
      return balanceToDecimal(stakerYield.toString());
    } catch (error) {
      return "0";
    }
  }

  async decimalsOfTWMT(account: string): Promise<number> {
    const { TWM_TOKEN } = this.contracts;
    let decimals: number = 0;
    if (this.myAccount === "") return decimals;
    try {
      decimals = await TWM_TOKEN.decimals();
    } catch (error) {
      console.log(error);
    }
    return decimals;
  }

  async balanceOfTWMT(account: string): Promise<BigNumber> {
    const { TWM_TOKEN } = this.contracts;
    let bigTWMTBalance: BigNumber = BigNumber.from(0);
    if (this.myAccount === "") return bigTWMTBalance;
    try {
      bigTWMTBalance = await TWM_TOKEN.balanceOf(account);
    } catch (error) {
      console.log(error);
    }
    return bigTWMTBalance;
  }

  async allowanceTWMT(owner: string): Promise<BigNumber> {
    const { TWM_TOKEN, TWM_CASINO } = this.contracts;
    let bigTWMTAllowance: BigNumber = BigNumber.from(0);
    if (this.myAccount === "") return bigTWMTAllowance;
    try {
      bigTWMTAllowance = await TWM_TOKEN.allowance(owner, TWM_CASINO.address);
    } catch (error) {
      console.log(error);
    }
    return bigTWMTAllowance;
  }

  async approveTWMT(amount: BigNumber): Promise<ReturnInfo> {
    const { TWM_TOKEN, TWM_CASINO } = this.contracts;
    try {
      const txx = await TWM_TOKEN.approve(TWM_CASINO.address, amount);
      const receipt = await txx.wait();
      console.log(
        `approve casino tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "APPROVE TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "APPROVE TRANSACTION FAIL",
      };
    }
  }

  async getClaimedAmountList(address: string): Promise<BigNumber[]> {
    const { TWM_CASINO } = this.contracts;
    let list: BigNumber[] = [];
    if (this.myAccount === "") return list;
    try {
      list = await TWM_CASINO.getClaimedList(address);
    } catch (error) {
      console.log(error);
    }
    return list;
  }

  async getDepositedAmountList(address: string): Promise<BigNumber[]> {
    const { TWM_CASINO } = this.contracts;
    let list: BigNumber[] = [];
    if (this.myAccount === "") return list;
    try {
      list = await TWM_CASINO.getDepositedList(address);
    } catch (error) {
      console.log(error);
    }
    return list;
  }

  async depositTWMT(amount: BigNumber): Promise<ReturnInfo> {
    const { TWM_CASINO } = this.contracts;
    try {
      const txx = await TWM_CASINO.deposit(amount);
      const receipt = await txx.wait();
      console.log(
        `deposit casino tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "DEPOSIT TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "DEPOSIT TRANSACTION FAIL",
      };
    }
  }

  async withdrawTWMT(wallet: string, amount: BigNumber, index: number, sig: string): Promise<ReturnInfo> {
    const { TWM_CASINO } = this.contracts;
    try {
      const txx = await TWM_CASINO.withdraw(wallet, amount, index, sig);
      const receipt = await txx.wait();
      console.log(
        `withdraw casino tx: https://etherscan.io/tx/${receipt.transactionHash}`
      );
      return {
        success: true,
        reason: "WITHDRAW TRANSACTION SUCCESS",
      };
    } catch (error) {
      return {
        success: false,
        reason: "WITHDRAW TRANSACTION FAIL",
      };
    }
  }

}
