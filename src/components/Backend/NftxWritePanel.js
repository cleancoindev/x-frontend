import React, { useState, useRef } from "react";
import {
  DropDown,
  TextInput,
  Button,
  AddressField,
  IconCheck,
} from "@aragon/ui";
import Web3 from "web3";
import { useWallet } from "use-wallet";
import Nftx from "../../contracts/NFTX.json";
import Loader from "react-loader-spinner";
import HashField from "../HashField/HashField";
import { useFavoriteNFTs } from "../../contexts/FavoriteNFTsContext";
import addresses from "../../addresses/rinkeby.json";

function ManageFundPanel({ closePanel }) {
  const { account } = useWallet();

  // const { addFavorite } = useFavoriteNFTs();

  const { current: web3 } = useRef(new Web3(window.ethereum));

  const nftx = new web3.eth.Contract(Nftx.abi, addresses.nftxProxy);

  const [funcParams, setFuncParams] = useState(JSON.parse("[[]]"));

  const [txHash, setTxHash] = useState(null);
  const [txReceipt, setTxReceipt] = useState(null);
  const [txError, setTxError] = useState(null);

  const getIsEligible = () => {};

  if (!txHash) {
    return (
      <div
        css={`
          & > div {
            margin-top: 25px;
            margin-bottom: 40px;
          }
        `}
      >
        {Nftx.abi
          .filter(
            (item) =>
              item.type === "function" && !item.stateMutability.includes("view")
          )
          .map((func, i) => (
            <div key={i}>
              {func.inputs.map((input, _i) => (
                <TextInput
                  key={_i}
                  value={(funcParams[i] && funcParams[i][_i]) || ""}
                  onChange={(event) => {
                    const newFuncParams = JSON.parse(
                      JSON.stringify(funcParams)
                    );
                    if (!newFuncParams[i]) {
                      newFuncParams[i] = [];
                    }
                    newFuncParams[i][_i] = event.target.value;
                    setFuncParams(newFuncParams);
                  }}
                  placeholder={`${input.name} (${input.type})`}
                  wide={true}
                  css={`
                    margin-bottom: 10px;
                  `}
                />
              ))}
              <Button
                label={func.name}
                wide={true}
                disabled={!account}
                onClick={() => {
                  nftx.methods[func.name](...funcParams[i])
                    .send({ from: account })
                    .then((receipt) => {
                      setTxReceipt(receipt);
                      console.log("receipt", receipt);
                    });
                }}
                css={`
                  margin-top: 5px;
                  margin-bottom: 15px;
                `}
              />
            </div>
          ))}
      </div>
    );
  } else if (txHash && !txReceipt) {
    return (
      <div>
        <div
          css={`
            margin-top: 28px;
            margin-bottom: 20px;
          `}
        >
          Transaction in progress...
        </div>
        <HashField hash={txHash} />
        <Loader
          type="ThreeDots"
          color="#201143"
          width={150}
          css={`
            margin-top: 50px;
            display: flex;
            justify-content: center;
          `}
        />
      </div>
    );
  } else if (txError) {
    return (
      <div>
        <div
          css={`
            margin-top: 28px;
            margin-bottom: 20px;
          `}
        >
          Error occured. Check console.
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div
          css={`
            margin-top: 28px;
            margin-bottom: 20px;
          `}
        >
          Transaction was successful
          <IconCheck
            css={`
              transform: translate(5px, 5px) scale(1.2);
              color: #5ac994;
            `}
          />
        </div>
        <Button label="Return to Page" wide={true} onClick={closePanel} />
      </div>
    );
  }
}

export default ManageFundPanel;