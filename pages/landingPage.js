import { useState } from 'react';
import { useMetamask } from "../../hooks/useMetamask";
import Pinnie from "../Pinnie";
import SubmarineLogoSvg from "../SubmarineLogoSvg";
import axios from 'axios';

export default function ContentLanding({ pageData, loading, fileInfo }) {
  const [signing, setSigning] = useState(false);
  const { signData } = useMetamask();
  const handleSign = async () => {
    try {
      setSigning(true);
      const url = await signData(fileInfo.unlockInfo.network, fileInfo.shortId, fileInfo.unlockInfo.contract, fileInfo.submarineCID);
      if(url) {
        setSigning(false);
        window.location.replace(url);
      }     
    } catch (error) {
      setSigning(false)
      alert(error.message)
    }    
  }

  return (
    <div>
      <div className="absolute p-4 flex flex-row">
        <div>
          <SubmarineLogoSvg />
        </div>
      </div>
      <div className="absolute bottom-10 right-10 z-10">
        <Pinnie />
      </div>
      <div className="public-content-bg h-screen w-screen flex flex-col justify-center align-center">
        <div className="p-10 md:w-1/2 w-3/4 h-auto text-center flex flex-col justify-center align-center m-auto bg-white overflow-hidden shadow-lg rounded-lg">
          {loading ? (
            <div>
              <h1>Loading...</h1>
            </div>
          ) : (
            <div>
              <img
                className="mb-8 mt-6 w-24 h-24 m-auto rounded-full"
                src={`https://opengateway.mypinata.cloud/ipfs/${fileInfo.thumbnail}?img-width=200&img-height=200`}
                alt={`${fileInfo.name} preview`}
              />
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                <span className="block">{fileInfo.name}</span>
              </h2>
              <h4 className="mt-4 text-muted text-xl">
                {fileInfo.description}
              </h4>
              <div className="mt-10 flex justify-center">
                <div className="inline-flex w-1/2">
                  <button
                    onClick={() => handleSign()}
                    className="w-full inline-flex shadow-sm items-center justify-center px-5 py-3 text-base font-medium rounded-full text-white bg-pinata-purple hover:bg-pinata-purple"
                  >
                    {signing ? "Unlocking..." : "Connect wallet"}
                  </button>
                </div>
              </div>
              <p className="mt-4 mb-4 text-md text-muted">
                Unlock this content by connecting your wallet to verify you have
                the required NFT.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}