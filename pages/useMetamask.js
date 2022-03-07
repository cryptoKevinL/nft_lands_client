import { useEffect, useState } from "react";
import axios from "axios";

export const useMetamask = () => {
  const [ethereum, setEthereum] = useState(null);
  const [url, setUrl] = useState("");
  const [holdsNFT, setHoldsNFT] = useState(false);


  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask is installed!");
      setEthereum(window.ethereum);
    }
    if (ethereum) {
      ethereum.request({ method: "eth_requestAccounts" });
    }
  }, [ethereum]);

  const signData = async (network, shortId, contract, submarineCid) => {
    try {
      const messageToSign = await axios.get(`/api/verify?contract=${contract}`);
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      const signature = await ethereum.request({
        method: "personal_sign",
        params: [
          `To verify you own the NFT in question,
you must sign this message. 
The NFT contract address is:
${messageToSign.data.contract}
The verification id is: 
${messageToSign.data.id}`,//JSON.stringify(messageToSign.data),
          account,
          messageToSign.data.id,
        ],
      });
  
      const res = await axios.post("/api/verify", {
        address: account,
        signature,
        network,
        contractAddress: contract,
        CID: submarineCid,
        shortId: shortId
      });
      const url = res.data;     
      return url; 
    } catch (error) {
      throw error;
    }    
  };

  return {
    signData,
    ethereum,
    url,
    holdsNFT,
    url
  };
};