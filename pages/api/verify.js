import axios from "axios";
import * as util from "ethereumjs-util";
import {ethers} from "ethers";
import { v4 as uuidv4 } from 'uuid';
import { withIronSession } from 'next-iron-session';
const abi = require("../../NFT_Lands.json").abi;
const contractAddress = "0xBE1df589c84008ec2bf828Fc8F2a3116Aee79D8f";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const urlV2API = `https://managed.mypinata.cloud/api/v1`;
const API_KEY = process.env.PINATA_V2_API_KEY;
const CID = "bafybeieurcyxmx5giqxk4nyg4cx6iztkbu7wp4lfgjuqwggsmrkwnglfdu";
const GATEWAY_URL = "https://nft_lands.mypinata.cloud";

function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD,
    cookieName: 'web3-auth-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production' ? true : false,
    },
  })
}

export default withSession(async (req, res) => {
  if(req.method === "POST") {
    try {         
      const message = req.session.get('message-session');
      const provider = await new ethers.providers.JsonRpcProvider(`https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);
      const contract = await new ethers.Contract( contractAddress , abi , provider );      
      let nonce = "\x19Ethereum Signed Message:\n" + JSON.stringify(message).length + JSON.stringify(message)
      nonce = util.keccak(Buffer.from(nonce, "utf-8"))
      const { v, r, s } = util.fromRpcSig(req.body.signature)
      const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s)
      const addrBuf = util.pubToAddress(pubKey)
      const addr = util.bufferToHex(addrBuf)
      if(req.body.address === addr) {
        const balance = await contract.balanceOf(addr);
        if(balance.toString() !== "0") {
          const config = {
            headers: {
              "x-api-key": `${API_KEY}`, 
              'Content-Type': 'application/json'
            }
          }
          //  Generate Access Token
          const content = await axios.get(`${urlV2API}/content`, config)
          
          const { data } = content;
          const { items } = data;
          const item = items.find(i => i.cid === CID);
          const body = {
            timeoutSeconds: 3600, 
            contentIds: [item.id] 
          }
          const token = await axios.post(`${urlV2API}/auth/content/jwt`, body, config);
          return res.send(`${GATEWAY_URL}/ipfs/${CID}?accessToken=${token.data}`);
        } else {
          return res.status(401).send("You aren't a PFPinata");
        }
      } else {
        return res.status(401).send("Invalid signature");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }    
  } 
  else if(req.method === "GET") {
   try {
     const message = { contractAddress, id: uuidv4() };
     req.session.set('message-session', message)
     await req.session.save()
     res.json(message)
   } catch (error) {
     console.log(error);
     const { response: fetchResponse } = error
     res.status(fetchResponse?.status || 500).json(error.data)
   }
  } 
  else {
    res.status(200).json({ message: 'This is the way...wait, no it is not. What are you doing here?' })
  }
})
