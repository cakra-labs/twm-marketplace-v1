import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import useTWMFinance from "../../../../hooks/useTWMFinance";
import { ReturnInfo } from "../../../../twm-finance/types";
import CharLeft from "../../../../assets/pixelwork/char-left-new.png";
import CharRight from "../../../../assets/pixelwork/char-right-new.png";
import "@solana/wallet-adapter-react-ui/styles.css";
import Ok from "../../../../assets/pixelwork/check-ok.png";
import Fail from "../../../../assets/pixelwork/check-fail.png";

import Spinner from "../Spinner";

function Claim() {
  const twmFinance = useTWMFinance();
  const { account } = useWeb3React();
  const [accumulatedAmount, setAccumulatedAmount] = useState<string>("0");
  const [twtBalance, setTwtBalance] = useState<string>("0");
  const [result, setResult] = useState<ReturnInfo>({
    success: true,
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [changed, setChange] = useState<boolean>(true);
  const render = () => {
    setChange(!changed);
  };

  const handleAccumulatedAmount = async () => {
    const res = await twmFinance?.getAccumulatedAmount();
    if (res) {
      setAccumulatedAmount(res);
    }
  };

  const fetchTWTBalance = async () => {
    const res = await twmFinance?.getTWTBalance();
    if (res) {
      setTwtBalance(res.split(".")[0]);
    }
  };

  const openClaimModal = (e: any) => {
    e.preventDefault();
    document.getElementById("modal-claim")?.classList.add("open");

    document
      .getElementById("modal-claim")
      ?.addEventListener("click", function () {
        render();
        document.getElementById("modal-claim")?.classList.remove("open");
      });
  }

  const claimTWT = async (e: any) => {
    setIsLoading(true);
    let res = await twmFinance?.withdrawAllTWMT();
    setIsLoading(false);
    if (res) {
      setResult(res);
    }
    e.preventDefault();
    document.getElementById("modal-claim-result")?.classList.add("open");

    document
      .getElementById("modal-claim-result")
      ?.addEventListener("click", function () {
        render();
        document.getElementById("modal-claim-result")?.classList.remove("open");
      });
  };

  useEffect(() => {
    async function fetchAccumulatedAmount() {
      try {
        setResult({ success: true, reason: "" });
        if (account && twmFinance?.myAccount) {
          handleAccumulatedAmount();
          fetchTWTBalance();
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAccumulatedAmount();
  }, [account, changed, twmFinance?.myAccount]);

  return (
    <section className="claim">
      <div className="container">
        <div className="row">
          <div className="col-xl-3">
            <img className="char-left" src={CharLeft} alt="" />
          </div>
          <div className="col-xl-6 claim-content">
            <div className="description center text-bold">
              <h2 className="text-white text-underline">
                Current accumulated reward:
              </h2>
              <h2 className="text-white">
                {" "}
                {!account
                  ? Number(0).toFixed(2)
                  : Number(accumulatedAmount).toFixed(2)}
                {" TWMT"}
              </h2>
            </div>
            <div className="description">
              Current <span className="text-important"><a href="https://etherscan.io/address/0xd88f0726dfb175e534213619c4c4a686d09ca743">$TWMT</a></span> balance:{" "}
              {twtBalance}
              <br />For any questions or concerns, <br /> please visit{" "}
              
              <a href="https://discord.gg/awJY8tYm56">
                <span className="text-white text-underline">
                  The Watchmaker Discord
                </span>{" "}
              </a>

            </div>
            {!account ? (
              <></>
            ) : (
              Number(accumulatedAmount) ? (<><div className="claim-btn-wrapper">
                <button
                  className="btn-large"
                  onClick={async (e: any) => {
                    openClaimModal(e);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner type={"small"} /> : ""} Claim $TWMT{" "}
                </button>
              </div></>) : (<></>)

            )}
          </div>
          <div className="col-xl-3">
            <img src={CharRight} className="char-right" alt="" />
          </div>
        </div>
      </div>
      <div className="overlay" id="modal-claim">
        <div className="modal wrapper-modal">
          <div className="modal-text">
            <strong>Grandfather</strong> keeps 25% of your Coin as a tax
            <br />
            to take it out of the world of watchmaking
            <br />

          </div>
          <button
            className="btn-large"
            onClick={async (e: any) => {
              await claimTWT(e);
            }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner type={"small"} /> : ""} Claim{" "}
          </button>
        </div>
      </div>
      <div className="overlay" id="modal-claim-result">
        <div className="modal">
          <img src={result.success ? Ok : Fail} alt="ok" />
          {result.success ? (
            <div className="modal-text">
              <strong>Great!</strong> Succesfully claimed!
              <br />
              <a href="#" className="btn-large">
                Thanks!
              </a>
            </div>
          ) : (
            <div className="modal-text">
              <strong>Oops!</strong> Claim failed!
              <br />
              <p>{result.reason}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Claim;
