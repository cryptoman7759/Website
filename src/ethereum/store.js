import { ethers, BigNumber} from "ethers"; //BigNumber
import { config } from "./config";
import {extractCompo, toWei, fromWei, GWEI, addr0, getCtrtAddresses} from "./ethFunc";

//--------------------------==
const recordsPerPage = config.recordsPerPage;

let option = 0, bool1 = false, uintNum = 0;

//--------------------------== initAction()
/** should be run once and save compo1 into a state variable for all other functions to use

*/
//--------------------------==
export const ReadFunc = async (compo) =>
new Promise(async (resolve, reject) => {
  console.log("---------== ReadFunc()");
  const [instNFT721Creature, acct0] = await extractCompo(compo, 0, 0);
  if (instNFT721Creature === undefined) {
    resolve(-1);
  }
  try {
    const data = await instNFT721Creature.methods.name().call();
    console.log("data:", data);
    resolve(data);
  } catch (err) {
    console.error("ReadFunc() failed.", err);
    reject(-1);
  }
});

export const BalanceOf = async (compo) =>
new Promise(async (resolve, reject) => {
  console.log("---------== BalanceOf()");
  const [instNFT721Creature, acct0] = await extractCompo(compo, 0, 0);
  if (instNFT721Creature === undefined) {
    resolve(-1);
  }
  try {
    const data = await instNFT721Creature.methods.balanceOf(acct0).call();
    console.log("data:", data);
    resolve(data);
  } catch (err) {
    console.error("BalanceOf() failed.", err);
    reject(-1);
  }
});

export const CheckOwner = async (compo) =>
new Promise(async (resolve, reject) => {
  console.log("---------== CheckOwner()");
  const [instNFT721Creature, acct0] = await extractCompo(compo, 0, 0);
  if (instNFT721Creature === undefined) {
    resolve(-1);
  }

  try {
    const data = await instNFT721Creature.methods.checkOwner(acct0).call();
    console.log("data:", data);
    resolve(data);
  } catch (err) {
    console.error("CheckOwner() failed.", err);
    reject(-1);
  }
});

export const CheckSold = async (compo) =>
new Promise(async (resolve, reject) => {
  console.log("---------== CheckOwner()");
  const [instNFT721Creature, acct0] = await extractCompo(compo, 0, 0);
  if (instNFT721Creature === undefined) {
    resolve(-1);
  }
  const [addrNFT721Creature, addrNFT721Sales]= await getCtrtAddresses();
  console.log("addrNFT721Creature:", addrNFT721Creature, "\naddrNFT721Sales:", addrNFT721Sales);
  try {
    const data = await instNFT721Creature.methods.checkOwner(addrNFT721Sales).call();
    console.log("data:", data);
    resolve(data);
  } catch (err) {
    console.error("CheckOwner() failed.", err);
    reject(-1);
  }
});


export const GetXYZ = async (compo, userAddr, option) =>
new Promise(async (resolve, reject) => {
  console.log("---------== GetXYZ()");
  const [instNFT721Creature, acct0] = await extractCompo(compo, 0, 0);
  if (instNFT721Creature === undefined || acct0 === undefined) {
    resolve(-1);
    return false;
  }

  if (userAddr === undefined || userAddr === "") {
    userAddr = acct0;
    console.log("using default accounts[0]");
  }
  console.log("userAddr:", userAddr);
  try {
    const data = await instNFT721Creature.methods.betters(userAddr).call();
    console.log("data:", data);
    if(option === 0){
      resolve(data.deposit);
    } else if(option === 1){
      resolve(data.balance);
    } else if(option === 2){
      resolve(data.winloss);
    } else {
      resolve(data);
    }
  } catch (err) {
    console.error("GetXYZ() failed.", err);
    reject(-1);
  }
});


//-------------==
export const isTokenAvailable = async (compo, tokenId) => new Promise(async (resolve, reject) => {
  console.log("---------== isTokenAvailable()");
  const [instNFT721Creature, addrFrom] = await extractCompo(compo, 0, 0);

  const isExisting = await instNFT721Creature.methods.exists(tokenId).call();
  const tokenOwner = await instNFT721Creature.methods.ownerOf(tokenId).call();
  const isNotOwned = tokenOwner !== addrFrom;
  console.log("isExisting:", isExisting, ", isNotOwned:", isNotOwned);
  resolve(isExisting && isNotOwned);
});

export const buyNFTViaETH = async (compo, gasPrice, gasLimit, tokenId) => new Promise(async (resolve, reject) => {
  console.log("---------== buyNFTViaETH()");
  const [instNFT721Sales, addrFrom] = await extractCompo(compo, 1, 0);

  try {
    if (instNFT721Sales !== undefined && addrFrom !== "") {
      // const addrNFTContract = await instNFT721Sales.methods.addrNFTContract().call();
      // console.log("addrNFTContract:",addrNFTContract );
      const isAvailable = await isTokenAvailable(compo, tokenId);
      if(!isAvailable){
        console.log("tokenId not available");
        reject("tokenId not available");
        return false;
      }

      const priceInWeiETH = await instNFT721Sales.methods.priceInWeiETH().call();
      //const value1 = web3.utils.toWei('0.1', "ether");

      console.log("addrFrom:", addrFrom, ", gasPrice:", gasPrice, ", gasLimit:", gasLimit, tokenId, priceInWeiETH, typeof priceInWeiETH );
    
      await instNFT721Sales.methods
        .buyNFTViaETH(tokenId)
        .send({
          from: addrFrom,
          value: priceInWeiETH,
          gasPrice: gasPrice * GWEI,
          gas: gasLimit,
        })
        .on("receipt", (receipt) => {
          console.log(`receipt: ${JSON.stringify(receipt, null, 4)}`);
          resolve(receipt.transactionHash);
        })
        .on("error", (err, receipt) => {
          console.error("txn failed:", err);
          reject(err);
          return false;
        });
    }
    resolve("contract instance not existing");
  } catch (err) {
    console.error(err);
    reject(err);
    //this.setState({errGetBalance: err.message});
  }
});

export const buyNFTViaETHCheck = async (compo, gasPrice, gasLimit, tokenId) => new Promise(async (resolve, reject) => {
  console.log("---------== buyNFTViaETHCheck()");
  const [instNFT721Sales, addrFrom] = await extractCompo(compo, 1, 0);

  console.log("addrFrom:", addrFrom, gasPrice, gasLimit, tokenId);
  try {
    if (instNFT721Sales !== undefined && addrFrom !== "") {
      const result = await instNFT721Sales.methods
        .BuyNFTViaETHCheck(tokenId)
        .call({from: addrFrom});
        resolve(result);
    }
    resolve("contract instance not existing");
  } catch (err) {
    console.error(err);
    reject(err);
    //this.setState({errGetBalance: err.message});
  }
});

